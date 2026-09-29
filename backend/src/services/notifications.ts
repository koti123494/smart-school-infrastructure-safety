import { prisma } from '../utils/prisma.js';
import { emitEvent } from '../socket/io.js';

export async function notify(input: { type: string; title: string; message: string; issueId?: string; userId?: string; event?: string }) {
  const notification = await prisma.notification.create({
    data: { type: input.type, title: input.title, message: input.message, issueId: input.issueId, userId: input.userId },
  });
  const { event, ...payload } = input;
  emitEvent(event ?? input.type, { ...payload, notification });
  return notification;
}