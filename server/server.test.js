import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createSchoolServer } from './server.js';

let server;
let baseUrl;

before(async () => {
  server = createSchoolServer({
    thresholds: {
      temperature: {
        warning: { max: 35 },
        critical: { max: 45 },
      },
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function postTelemetry(payload) {
  return fetch(`${baseUrl}/api/sensors/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

test('health endpoint identifies demo-only in-memory storage', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const health = await response.json();
  assert.equal(health.status, 'online');
  assert.equal(health.mode, 'demo');
  assert.equal(health.storage, 'in-memory');
  assert.equal(Number.isNaN(Date.parse(health.timestamp)), false);
});

test('AI endpoints fail closed when no provider is configured', async () => {
  const response = await fetch(`${baseUrl}/api/ai/analyze-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert: 'Temperature rose rapidly in the server room.' }),
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: 'AI provider is not configured.',
    detail: 'Insufficient data available.',
  });
});

test('rejects malformed sensor telemetry', async () => {
  const response = await postTelemetry({
    sensor_id: 'TMP-101',
    sensor_type: 'temperature',
    value: 'hot',
    location: 'Room 101',
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /finite number/);
});

test('stores readings, evaluates configured thresholds, and creates an alert', async () => {
  const response = await postTelemetry({
    sensor_id: 'TMP-101',
    sensor_type: 'temperature',
    value: 46,
    unit: 'C',
    location: 'Room 101, Block A',
    battery_percentage: 82,
  });
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.sensor.status, 'critical');
  assert.equal(result.alert.severity, 'critical');
  assert.equal(result.reading.value, 46);

  const sensors = await (await fetch(`${baseUrl}/api/sensors`)).json();
  assert.equal(sensors.sensors.length, 1);
  assert.equal(sensors.sensors[0].sensor_id, 'TMP-101');

  const history = await (await fetch(`${baseUrl}/api/sensors/TMP-101/readings?limit=10`)).json();
  assert.equal(history.readings.length, 1);
  assert.equal(history.readings[0].value, 46);

  const activeAlerts = await (await fetch(`${baseUrl}/api/alerts`)).json();
  assert.equal(activeAlerts.alerts.length, 1);
  assert.equal(activeAlerts.alerts[0].status, 'active');
});

test('publishes sensor updates to connected SSE clients', async () => {
  const response = await fetch(`${baseUrl}/api/events`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /text\/event-stream/);
  const reader = response.body.getReader();
  await reader.read();

  await postTelemetry({
    sensor_id: 'TMP-102',
    sensor_type: 'temperature',
    value: 28,
    unit: 'C',
    location: 'Room 102, Block A',
  });

  let timeout;
  const eventRead = reader.read();
  const result = await Promise.race([
    eventRead,
    new Promise((resolve) => { timeout = setTimeout(() => resolve(null), 1500); }),
  ]);
  clearTimeout(timeout);
  await reader.cancel();
  assert.ok(result, 'expected an SSE message after telemetry ingestion');
  assert.match(new TextDecoder().decode(result.value), /event: sensor\.updated/);
  assert.match(new TextDecoder().decode(result.value), /TMP-102/);
});

test('allows an alert workflow state update', async () => {
  const { alerts } = await (await fetch(`${baseUrl}/api/alerts`)).json();
  const response = await fetch(`${baseUrl}/api/alerts/${alerts[0].id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'acknowledged' }),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).alert.status, 'acknowledged');
});

test('rejects invalid history limits and invalid alert states', async () => {
  const readingsResponse = await fetch(`${baseUrl}/api/sensors/TMP-101/readings?limit=500`);
  assert.equal(readingsResponse.status, 400);

  const alerts = (await (await fetch(`${baseUrl}/api/alerts`)).json()).alerts;
  const updateResponse = await fetch(`${baseUrl}/api/alerts/${alerts[0].id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'deleted' }),
  });
  assert.equal(updateResponse.status, 400);
});
