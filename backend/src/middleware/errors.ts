import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Resource not found.' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'Request validation failed.', details: error.issues });
    return;
  }
  const status = error?.code === 'LIMIT_FILE_SIZE' ? 413 : error?.name === 'MulterError' ? 400 : Number(error?.status) || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'An unexpected server error occurred.' : error.message || 'Invalid upload.' });
};