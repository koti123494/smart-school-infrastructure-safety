import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
await mkdir(uploadRoot, { recursive: true });

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadRoot),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) return callback(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.'));
    callback(null, true);
  },
});