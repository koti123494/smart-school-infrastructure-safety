import { randomUUID } from 'node:crypto';
import { createServer as createHttpServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { AIProviderUnavailableError, createAIService } from './ai-service.js';

const SENSOR_TYPES = new Set([
  'temperature',
  'smoke',
  'gas',
  'humidity',
  'water_leakage',
  'flood',
  'fire',
  'motion',
  'door',
  'light',
  'air_quality',
  'noise',
  'electricity',
  'electrical',
  'vibration',
]);
const MAX_BODY_BYTES = 16 * 1024;
const MAX_READING_HISTORY = 1000;
const MAX_ALERT_HISTORY = 1000;

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body exceeds 16 KB.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.status = 400;
    throw error;
  }
}

function validateTelemetry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  if (typeof body.sensor_id !== 'string' || !body.sensor_id.trim() || body.sensor_id.length > 64) {
    return 'sensor_id must be a non-empty string of at most 64 characters.';
  }
  if (typeof body.sensor_type !== 'string' || !SENSOR_TYPES.has(body.sensor_type)) {
    return `sensor_type must be one of: ${[...SENSOR_TYPES].join(', ')}.`;
  }
  if (typeof body.value !== 'number' || !Number.isFinite(body.value)) {
    return 'value must be a finite number.';
  }
  if (typeof body.location !== 'string' || !body.location.trim() || body.location.length > 180) {
    return 'location must be a non-empty string of at most 180 characters.';
  }
  if (body.unit !== undefined && (typeof body.unit !== 'string' || body.unit.length > 16)) {
    return 'unit must be a string of at most 16 characters.';
  }
  if (body.battery_percentage !== undefined &&
      (!Number.isInteger(body.battery_percentage) || body.battery_percentage < 0 || body.battery_percentage > 100)) {
    return 'battery_percentage must be an integer from 0 to 100.';
  }
  if (body.timestamp !== undefined &&
      (typeof body.timestamp !== 'string' || Number.isNaN(Date.parse(body.timestamp)))) {
    return 'timestamp must be a valid date string.';
  }

  return null;
}

function evaluateThreshold(value, thresholds) {
  if (!thresholds || typeof thresholds !== 'object') return 'online';

  const matches = (range) => range &&
    ((typeof range.min === 'number' && value < range.min) ||
      (typeof range.max === 'number' && value > range.max));

  if (matches(thresholds.critical)) return 'critical';
  if (matches(thresholds.warning)) return 'warning';
  return 'online';
}

function parseThresholds(value) {
  if (!value) return {};
  const thresholds = typeof value === 'string' ? JSON.parse(value) : value;
  if (!thresholds || typeof thresholds !== 'object' || Array.isArray(thresholds)) {
    throw new Error('SENSOR_THRESHOLDS_JSON must be a JSON object keyed by sensor type.');
  }
  return thresholds;
}

export function createSchoolServer({
  thresholds = parseThresholds(process.env.SENSOR_THRESHOLDS_JSON),
  corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173',
  aiService = createAIService(),
} = {}) {
  const sensors = new Map();
  const readings = new Map();
  const alerts = [];
  const eventStreams = new Set();

  const publish = (event, data) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const stream of eventStreams) stream.write(message);
  };

  const server = createHttpServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');

    const origin = request.headers.origin;
    if (origin === corsOrigin) {
      response.setHeader('Access-Control-Allow-Origin', corsOrigin);
      response.setHeader('Vary', 'Origin');
    }
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');

    if (request.method === 'OPTIONS') {
      response.writeHead(204).end();
      return;
    }

    const url = new URL(request.url || '/', 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);

    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        json(response, 200, {
          status: 'online',
          system: 'Smart School Infrastructure & Safety Monitoring System',
          mode: 'demo',
          storage: 'in-memory',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/api/events') {
        response.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Connection': 'keep-alive',
        });
        response.write(': connected\n\n');
        eventStreams.add(response);
        response.on('close', () => eventStreams.delete(response));
        return;
      }

      if (request.method === 'GET' && url.pathname === '/api/sensors') {
        json(response, 200, { sensors: [...sensors.values()] });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/api/alerts') {
        json(response, 200, { alerts: [...alerts].reverse() });
        return;
      }

      if (request.method === 'GET' && url.pathname === '/api/dashboard') {
        const sensorList = [...sensors.values()];
        json(response, 200, {
          sensors: {
            total: sensorList.length,
            online: sensorList.filter((sensor) => sensor.status === 'online').length,
            warning: sensorList.filter((sensor) => sensor.status === 'warning').length,
            critical: sensorList.filter((sensor) => sensor.status === 'critical').length,
          },
          activeAlerts: alerts.filter((alert) => alert.status === 'active').length,
          mode: 'demo',
        });
        return;
      }

      if (request.method === 'POST' && url.pathname === '/api/ai/analyze-alert') {
        const body = await readJson(request);
        if (!body || typeof body.alert !== 'string' || !body.alert.trim() || body.alert.length > 4000) {
          json(response, 400, { error: 'alert must be a non-empty string of at most 4000 characters.' });
          return;
        }
        json(response, 200, { analysis: await aiService.analyzeAlert(body.alert.trim()) });
        return;
      }

      if (request.method === 'POST' && url.pathname === '/api/ai/assistant') {
        const body = await readJson(request);
        if (!body || typeof body.question !== 'string' || !body.question.trim() || body.question.length > 2000) {
          json(response, 400, { error: 'question must be a non-empty string of at most 2000 characters.' });
          return;
        }
        const data = {
          sensors: [...sensors.values()],
          alerts: alerts.map(({ id, title, sensor_id, location, severity, status, created_at }) =>
            ({ id, title, sensor_id, location, severity, status, created_at })),
        };
        json(response, 200, {
          answer: await aiService.answerQuestion({ question: body.question.trim(), data }),
        });
        return;
      }

      if (request.method === 'POST' &&
          (url.pathname === '/api/sensors/data' || url.pathname === '/api/iot/telemetry')) {
        const body = await readJson(request);
        const legacyPayload = url.pathname === '/api/iot/telemetry';
        const payload = legacyPayload ? {
          sensor_id: body.sensorCode,
          sensor_type: body.type,
          value: typeof body.value === 'number' ? body.value : Number(body.value),
          unit: body.unit,
          location: body.location,
          timestamp: body.timestamp,
        } : body;
        const validationError = validateTelemetry(payload);
        if (validationError) {
          json(response, 400, { error: validationError });
          return;
        }

        const timestamp = payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString();
        const sensorTypeThresholds = thresholds[payload.sensor_type];
        const status = evaluateThreshold(payload.value, sensorTypeThresholds);
        const reading = {
          id: randomUUID(),
          sensor_id: payload.sensor_id,
          sensor_type: payload.sensor_type,
          value: payload.value,
          unit: payload.unit || '',
          location: payload.location.trim(),
          timestamp,
        };
        const sensor = {
          sensor_id: reading.sensor_id,
          sensor_type: reading.sensor_type,
          value: reading.value,
          unit: reading.unit,
          location: reading.location,
          status,
          battery_percentage: payload.battery_percentage ?? sensors.get(reading.sensor_id)?.battery_percentage ?? null,
          last_seen: timestamp,
        };

        sensors.set(reading.sensor_id, sensor);
        const sensorReadings = readings.get(reading.sensor_id) || [];
        sensorReadings.push(reading);
        if (sensorReadings.length > MAX_READING_HISTORY) sensorReadings.shift();
        readings.set(reading.sensor_id, sensorReadings);

        let alert = null;
        if (status === 'warning' || status === 'critical') {
          alert = alerts.find((item) =>
            item.sensor_id === reading.sensor_id && item.severity === status && item.status === 'active'
          );
          if (alert) {
            alert.last_seen = timestamp;
            alert.value = reading.value;
          } else {
            alert = {
              id: randomUUID(),
              title: `${status === 'critical' ? 'Critical' : 'Warning'} ${reading.sensor_type.replaceAll('_', ' ')} reading`,
              sensor_id: reading.sensor_id,
              sensor_type: reading.sensor_type,
              location: reading.location,
              value: reading.value,
              unit: reading.unit,
              severity: status,
              status: 'active',
              created_at: timestamp,
              last_seen: timestamp,
            };
            alerts.push(alert);
            if (alerts.length > MAX_ALERT_HISTORY) alerts.shift();
            publish('alert.created', alert);
          }
        }

        publish('sensor.updated', { sensor, reading, alert });
        json(response, 201, { received: true, sensor, reading, alert });
        return;
      }

      if (request.method === 'GET' && segments[0] === 'api' && segments[1] === 'sensors' && segments[3] === 'readings') {
        const sensorId = decodeURIComponent(segments[2] || '');
        const limit = Number(url.searchParams.get('limit') || 100);
        if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
          json(response, 400, { error: 'limit must be an integer from 1 to 200.' });
          return;
        }
        json(response, 200, { readings: (readings.get(sensorId) || []).slice(-limit).reverse() });
        return;
      }

      if (request.method === 'PATCH' && segments[0] === 'api' && segments[1] === 'alerts' && segments.length === 3) {
        const alert = alerts.find((item) => item.id === decodeURIComponent(segments[2]));
        if (!alert) {
          json(response, 404, { error: 'Alert not found.' });
          return;
        }
        const body = await readJson(request);
        if (!['acknowledged', 'resolved'].includes(body.status)) {
          json(response, 400, { error: 'status must be acknowledged or resolved.' });
          return;
        }
        alert.status = body.status;
        alert.updated_at = new Date().toISOString();
        publish('alert.updated', alert);
        json(response, 200, { alert });
        return;
      }

      json(response, 404, { error: 'Endpoint not found.' });
    } catch (error) {
      if (error instanceof AIProviderUnavailableError) {
        json(response, 503, { error: error.message, detail: 'Insufficient data available.' });
        return;
      }
      json(response, error.status || 500, {
        error: error.status ? error.message : 'Internal server error.',
      });
    }
  });

  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5000);
  const server = createSchoolServer();
  server.listen(port, () => {
    console.log(`Smart School demo API listening on http://localhost:${port}`);
    console.log('Demo mode: readings and alerts are held in memory; authentication is not enabled.');
  });
}