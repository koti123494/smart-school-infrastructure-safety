import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { env } from './config/env.js';
import { api } from './routes/index.js';
import { errorHandler, notFound } from './middleware/errors.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'online', service: 'smart-school-backend', timestamp: new Date().toISOString() }));
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR), {
	dotfiles: 'deny',
	index: false,
	maxAge: '1d',
	setHeaders: (response) => response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
}));
app.use('/api', api);
app.use(notFound);
app.use(errorHandler);