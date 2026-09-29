import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer, type Server } from 'node:http';
import { io as connectSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';

process.env.DATABASE_URL ??= 'postgresql://school:school@127.0.0.1:5432/school_test';
process.env.JWT_SECRET ??= 'test-only-validation-secret-with-at-least-32-characters';
const { app } = await import('../src/app.js');
const { configureSocket, emitEvent } = await import('../src/socket/io.js');

let server: Server;
let socketServer: import('socket.io').Server;
let baseUrl: string;
before(async () => {
  server = createServer(app);
  socketServer = configureSocket(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind a TCP port.');
  baseUrl = `http://127.0.0.1:${address.port}`;
});
after(async () => new Promise<void>((resolve) => socketServer.close(() => resolve())));

test('health endpoint reports service readiness without exposing configuration', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const body = await response.json() as Record<string, unknown>;
  assert.equal(body.status, 'online');
  assert.equal('DATABASE_URL' in body, false);
  assert.equal('JWT_SECRET' in body, false);
});

test('protected APIs reject requests without a token', async () => {
  const response = await fetch(`${baseUrl}/api/issues`);
  assert.equal(response.status, 401);
});

test('authenticated Socket.IO clients receive real-time problem events', async () => {
  const token = jwt.sign({ id: 'demo-user', role: 'ADMIN', name: 'Demo Admin' }, process.env.JWT_SECRET!);
  const socket = connectSocket(baseUrl, { auth: { token }, transports: ['websocket'] });
  const received = new Promise<{ title?: string }>((resolve, reject) => {
    socket.once('new_problem', resolve);
    socket.once('connect_error', reject);
    const timer = setTimeout(() => reject(new Error('Socket.IO event timed out.')), 4000);
    timer.unref();
  });
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });
  emitEvent('new_problem', { title: 'Test report event' });
  assert.equal((await received).title, 'Test report event');
  socket.disconnect();
});