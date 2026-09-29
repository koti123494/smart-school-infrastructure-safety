import { createServer } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { configureSocket } from './socket/io.js';
import { prisma } from './utils/prisma.js';

const server = createServer(app);
configureSocket(server);
server.listen(env.PORT, () => console.log(`Smart School API listening on port ${env.PORT}`));

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());