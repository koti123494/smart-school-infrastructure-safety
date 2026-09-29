import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export let io: Server;

export function configureSocket(server: HttpServer): Server {
  io = new Server(server, { cors: { origin: env.FRONTEND_ORIGIN, credentials: true } });
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.data.user = jwt.verify(token, env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Unauthorized socket connection'));
    }
  });
  return io;
}

export function emitEvent(event: string, payload: unknown): void {
  io?.emit(event, payload);
}