import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { IssueStatus, Priority, Role, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/env.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';
import { notify } from '../services/notifications.js';

export const api = Router();
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const issueStatuses = ['REPORTED', 'ASSIGNED', 'WORK_STARTED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED'] as const;
const alertStatuses = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] as const;
const emergencyStatuses = ['REPORTED', 'ACKNOWLEDGED', 'TEAM_ASSIGNED', 'RESPONDING', 'ON_SCENE', 'RESOLVED', 'VERIFIED'] as const;
const includeIssue = { report: { include: { reporter: { select: { id: true, name: true, email: true, role: true } } } }, assignment: { include: { department: true, assignee: { select: { id: true, name: true, email: true, role: true } } } }, timeline: { orderBy: { createdAt: 'asc' as const }, include: { actor: { select: { id: true, name: true } } } }, foodComplaint: true } as const;
const asyncRoute = (handler: (req: import('express').Request, res: import('express').Response) => Promise<unknown>) =>
  (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => { void handler(req, res).catch(next); };

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128), phoneNumber: z.string().trim().max(32).optional(),
});
api.post('/auth/login', asyncRoute(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { department: true } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser });
}));
api.post('/auth/register', asyncRoute(async (req, res) => {
  const data = registrationSchema.parse(req.body);
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(data.password, 12),
        phoneNumber: data.phoneNumber || null,
        role: Role.TEACHER,
      },
      include: { department: true },
    });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    throw error;
  }
}));
api.post('/auth/password-reset/request', asyncRoute(async (req, res) => {
  const { email } = z.object({ email: z.string().trim().email().max(254) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true, name: true, email: true } });
  if (!user) {
    res.status(404).json({ error: 'No account is registered with that email address.' });
    return;
  }
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.SMTP_FROM) {
    res.status(503).json({ error: 'Password reset email is not configured. Please contact your school administrator.' });
    return;
  }

  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === 'true',
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  const resetUrl = new URL(env.FRONTEND_URL);
  resetUrl.searchParams.set('resetToken', token);
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: user.email,
      subject: 'Reset your Smart School password',
      text: `Hello ${user.name},\n\nUse this link to reset your password within 30 minutes:\n${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
    });
  } catch {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    res.status(503).json({ error: 'The password reset email could not be delivered. Please try again later.' });
    return;
  }
  res.json({ message: 'A password reset link has been sent to your email address.' });
}));
api.post('/auth/password-reset/complete', asyncRoute(async (req, res) => {
  const { token, password } = z.object({ token: z.string().length(64), password: z.string().min(8).max(128) }).parse(req.body);
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const reset = await prisma.passwordResetToken.findFirst({ where: { tokenHash, expiresAt: { gt: new Date() } } });
  if (!reset) {
    res.status(400).json({ error: 'This password reset link is invalid or expired. Request a new link.' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: reset.userId } }),
  ]);
  res.json({ message: 'Your password has been reset successfully.' });
}));
api.get('/auth/me', authenticate, asyncRoute(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, role: true, section: true, department: true } });
  res.json({ user });
}));

const reportSchema = z.object({
  title: z.string().trim().min(2).max(180), description: z.string().trim().min(2).max(10000),
  location: z.string().trim().min(2).max(240), exactLocation: z.string().trim().min(2).max(240).optional(),
  category: z.string().trim().min(2).max(100), priority: z.enum(priorities).default('MEDIUM'),
  locationType: z.string().max(80).optional(), building: z.string().max(120).optional(), floor: z.string().max(80).optional(),
  classroom: z.string().max(80).optional(), section: z.string().max(80).optional(), reporterPhone: z.string().trim().max(32).optional(), imageUrl: z.string().max(500).optional(),
  selectedDay: z.string().max(20).optional(), lunchMenu: z.string().max(3000).optional(), studentName: z.string().max(120).optional(),
  qrCode: z.string().max(120).optional(),
});

async function createIssueReport(req: import('express').Request, data: z.infer<typeof reportSchema>, qrCode?: string) {
  const location = data.location ?? data.exactLocation!;
  const isFood = data.category.toLowerCase() === 'food complaint';
  const issue = await prisma.issue.create({
    data: {
      issueNumber: `SCH-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      title: data.title, description: data.description, location, category: data.category, priority: data.priority,
      report: { create: { reporterId: req.user!.id, section: data.section ?? req.user!.role, reporterPhone: data.reporterPhone, locationType: data.locationType, building: data.building, floor: data.floor, classroom: data.classroom, exactLocation: location, imageUrl: data.imageUrl } },
      timeline: { create: { actorId: req.user!.id, status: IssueStatus.REPORTED, note: 'Problem submitted.' } },
      ...(isFood ? { foodComplaint: { create: { reporterId: req.user!.id, selectedDay: data.selectedDay ?? 'Unspecified', lunchMenu: data.lunchMenu ?? 'Unspecified', studentName: data.studentName ?? req.user!.name, section: data.section ?? 'Unspecified', complaint: data.description, imageUrl: data.imageUrl } } } : {}),
      ...(qrCode ? { qrReport: { create: { reporterId: req.user!.id, qrCode, classroom: data.classroom ?? location } } } : {}),
    }, include: includeIssue,
  });
  await notify({ type: 'new_report', event: 'new_problem', title: 'New problem report', message: `${issue.issueNumber}: ${issue.title} at ${issue.location}`, issueId: issue.id });
  if (issue.priority === 'CRITICAL') await notify({ type: 'critical_alert', event: 'critical_alert', title: 'Critical safety report', message: `${issue.title} at ${issue.location}`, issueId: issue.id });
  return issue;
}

api.post('/reports', authenticate, asyncRoute(async (req, res) => {
  const data = reportSchema.parse(req.body);
  res.status(201).json({ issue: await createIssueReport(req, data) });
}));
api.post('/reports/qr', authenticate, asyncRoute(async (req, res) => {
  const body = z.object({ ...reportSchema.shape, qrCode: z.string().min(1).max(120) }).parse(req.body);
  res.status(201).json({ issue: await createIssueReport(req, body, body.qrCode) });
}));
api.get('/reports', authenticate, asyncRoute(async (req, res) => {
  const where: Prisma.IssueWhereInput = { report: { isNot: null } };
  if (req.user!.role === 'STUDENT' || req.user!.role === 'TEACHER') where.report = { reporterId: req.user!.id };
  const issues = await prisma.issue.findMany({ where, include: includeIssue, orderBy: { reportedAt: 'desc' } });
  res.json({ reports: issues });
}));
api.get('/reports/:id', authenticate, asyncRoute(async (req, res) => {
  const issueId = String(req.params.id);
  const issue = await prisma.issue.findFirst({ where: { OR: [{ id: issueId }, { issueNumber: issueId }], report: { isNot: null } }, include: includeIssue });
  if (!issue) { res.status(404).json({ error: 'Report not found.' }); return; }
  if (['STUDENT', 'TEACHER'].includes(req.user!.role) && issue.report?.reporterId !== req.user!.id) { res.status(403).json({ error: 'Not permitted.' }); return; }
  res.json({ report: issue });
}));
api.put('/reports/:id', authenticate, asyncRoute(async (req, res) => {
  const data = reportSchema.partial().parse(req.body);
  const issueId = String(req.params.id);
  const existing = await prisma.issue.findFirst({ where: { OR: [{ id: issueId }, { issueNumber: issueId }], report: { isNot: null } }, include: { report: true } });
  if (!existing) { res.status(404).json({ error: 'Report not found.' }); return; }
  if (['STUDENT', 'TEACHER'].includes(req.user!.role) && existing.report?.reporterId !== req.user!.id) { res.status(403).json({ error: 'Not permitted.' }); return; }
  const issue = await prisma.issue.update({ where: { id: existing.id }, data: { title: data.title, description: data.description, location: data.location ?? data.exactLocation, category: data.category, priority: data.priority, report: { update: { section: data.section, reporterPhone: data.reporterPhone, locationType: data.locationType, building: data.building, floor: data.floor, classroom: data.classroom, exactLocation: data.location ?? data.exactLocation, imageUrl: data.imageUrl } } }, include: includeIssue });
  res.json({ report: issue });
}));
api.delete('/reports/:id', authenticate, authorize(Role.ADMIN), asyncRoute(async (req, res) => {
  const issueId = String(req.params.id);
  const issue = await prisma.issue.findFirst({ where: { OR: [{ id: issueId }, { issueNumber: issueId }], report: { isNot: null } } });
  if (!issue) { res.status(404).json({ error: 'Report not found.' }); return; }
  await prisma.issue.delete({ where: { id: issue.id } });
  res.status(204).end();
}));

api.get('/issues', authenticate, asyncRoute(async (req, res) => {
  const issues = await prisma.issue.findMany({ include: includeIssue, orderBy: { reportedAt: 'desc' }, take: 500 });
  res.json({ issues });
}));
api.get('/issues/:id', authenticate, asyncRoute(async (req, res) => {
  const issueId = String(req.params.id);
  const issue = await prisma.issue.findFirst({ where: { OR: [{ id: issueId }, { issueNumber: issueId }] }, include: includeIssue });
  if (!issue) { res.status(404).json({ error: 'Issue not found.' }); return; }
  res.json({ issue });
}));
api.put('/issues/:id', authenticate, authorize(Role.ADMIN, Role.MAINTENANCE_STAFF), asyncRoute(async (req, res) => {
  const data = z.object({ priority: z.enum(priorities).optional(), title: z.string().min(2).max(180).optional(), description: z.string().min(2).optional(), resolutionNotes: z.string().max(10000).optional(), resolutionImage: z.string().max(500).optional() }).parse(req.body);
  const issue = await prisma.issue.update({ where: { id: String(req.params.id) }, data, include: includeIssue });
  res.json({ issue });
}));
api.post('/issues/:id/assign', authenticate, authorize(Role.ADMIN), asyncRoute(async (req, res) => {
  const data = z.object({ departmentId: z.string().uuid().optional(), assigneeId: z.string().uuid().optional() }).parse(req.body);
  const issue = await prisma.$transaction(async (tx) => {
    const updated = await tx.issue.update({ where: { id: String(req.params.id) }, data: { status: IssueStatus.ASSIGNED } });
    await tx.issueAssignment.upsert({ where: { issueId: updated.id }, create: { issueId: updated.id, ...data, assignedById: req.user!.id }, update: { ...data, assignedById: req.user!.id } });
    await tx.issueTimeline.create({ data: { issueId: updated.id, actorId: req.user!.id, status: IssueStatus.ASSIGNED, note: 'Issue assigned.' } });
    return tx.issue.findUniqueOrThrow({ where: { id: updated.id }, include: includeIssue });
  });
  await notify({ type: 'issue_assigned', event: 'issue_assigned', title: 'Issue assigned', message: `${issue.issueNumber} has been assigned.`, issueId: issue.id, userId: data.assigneeId });
  res.json({ issue });
}));
api.post('/issues/:id/status', authenticate, authorize(Role.ADMIN, Role.MAINTENANCE_STAFF), asyncRoute(async (req, res) => {
  const data = z.object({ status: z.enum(issueStatuses), notes: z.string().max(10000).optional(), resolutionImage: z.string().max(500).optional() }).parse(req.body);
  const issueId = String(req.params.id);
  const current = await prisma.issue.findUniqueOrThrow({ where: { id: issueId } });
  const allowed: Record<IssueStatus, IssueStatus[]> = {
    REPORTED: [IssueStatus.ASSIGNED], ASSIGNED: [IssueStatus.WORK_STARTED, IssueStatus.IN_PROGRESS],
    WORK_STARTED: [IssueStatus.IN_PROGRESS], IN_PROGRESS: [IssueStatus.RESOLVED],
    RESOLVED: [], VERIFIED: [],
  };
  if (!allowed[current.status].includes(data.status) && !(current.status === data.status && data.notes)) {
    res.status(409).json({ error: `Cannot change issue from ${current.status} to ${data.status}.` });
    return;
  }
  const issue = await prisma.$transaction(async (tx) => {
    const updated = await tx.issue.update({ where: { id: issueId }, data: { status: data.status, resolutionNotes: data.notes, resolutionImage: data.resolutionImage, resolvedAt: data.status === 'RESOLVED' ? new Date() : undefined, verifiedAt: data.status === 'VERIFIED' ? new Date() : undefined } });
    await tx.issueTimeline.create({ data: { issueId: updated.id, actorId: req.user!.id, status: data.status, note: data.notes } });
    return tx.issue.findUniqueOrThrow({ where: { id: updated.id }, include: includeIssue });
  });
  const event = data.status === 'RESOLVED' ? 'issue_resolved' : data.status === 'VERIFIED' ? 'issue_verified' : 'issue_status_changed';
  await notify({ type: event, event, title: 'Issue status updated', message: `${issue.issueNumber} is now ${data.status.replaceAll('_', ' ')}.`, issueId: issue.id });
  res.json({ issue });
}));
api.post('/issues/:id/verify', authenticate, authorize(Role.ADMIN, Role.TEACHER), asyncRoute(async (req, res) => {
  const notes = z.object({ notes: z.string().max(10000).optional() }).parse(req.body ?? {}).notes;
  const issueId = String(req.params.id);
  const current = await prisma.issue.findUniqueOrThrow({ where: { id: issueId } });
  if (current.status !== IssueStatus.RESOLVED) { res.status(409).json({ error: 'Only resolved issues can be verified.' }); return; }
  const issue = await prisma.$transaction(async (tx) => {
    const updated = await tx.issue.update({ where: { id: issueId }, data: { status: IssueStatus.VERIFIED, verifiedAt: new Date(), resolutionNotes: notes } });
    await tx.issueTimeline.create({ data: { issueId: updated.id, actorId: req.user!.id, status: IssueStatus.VERIFIED, note: notes } });
    return tx.issue.findUniqueOrThrow({ where: { id: updated.id }, include: includeIssue });
  });
  await notify({ type: 'issue_verified', event: 'issue_verified', title: 'Issue verified', message: `${issue.issueNumber} was verified.`, issueId: issue.id });
  res.json({ issue });
}));

api.get('/notifications', authenticate, asyncRoute(async (req, res) => {
  const notifications = await prisma.notification.findMany({ where: { OR: [{ userId: req.user!.id }, { userId: null }] }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ notifications });
}));
api.patch('/notifications/:id/read', authenticate, asyncRoute(async (req, res) => {
  const result = await prisma.notification.updateMany({ where: { id: String(req.params.id), OR: [{ userId: req.user!.id }, { userId: null }] }, data: { readAt: new Date() } });
  if (!result.count) { res.status(404).json({ error: 'Notification not found.' }); return; }
  res.json({ success: true });
}));

api.post('/uploads', authenticate, imageUpload.single('image'), async (req, res, next) => {
  if (!req.file) { res.status(400).json({ error: 'An image file is required in the image field.' }); return; }
  try {
    const { readFile, unlink } = await import('node:fs/promises');
    const content = await readFile(req.file.path);
    const validImage = (content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) ||
      content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      (content.toString('ascii', 0, 4) === 'RIFF' && content.toString('ascii', 8, 12) === 'WEBP');
    if (!validImage) {
      await unlink(req.file.path);
      res.status(400).json({ error: 'The uploaded file is not a valid JPG, PNG, or WEBP image.' });
      return;
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  } catch (error) { next(error); }
});

const alertSchema = z.object({ title: z.string().min(2).max(180), message: z.string().min(2).max(10000), location: z.string().min(2).max(240), priority: z.enum(priorities), source: z.string().max(40).optional() });
api.get('/alerts', authenticate, asyncRoute(async (_req, res) => res.json({ alerts: await prisma.safetyAlert.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }) })));
api.post('/alerts', authenticate, authorize(Role.ADMIN, Role.SECURITY), asyncRoute(async (req, res) => {
  const data = alertSchema.parse(req.body);
  const alert = await prisma.safetyAlert.create({ data: { ...data, createdById: req.user!.id } });
  if (alert.priority === 'CRITICAL') await notify({ type: 'critical_alert', event: 'critical_alert', title: alert.title, message: alert.message });
  res.status(201).json({ alert });
}));
api.put('/alerts/:id', authenticate, authorize(Role.ADMIN, Role.SECURITY), asyncRoute(async (req, res) => {
  const data = z.object({ status: z.enum(alertStatuses), acknowledged: z.boolean().optional() }).parse(req.body);
  const alert = await prisma.safetyAlert.update({ where: { id: String(req.params.id) }, data: { status: data.status, acknowledgedById: data.acknowledged ? req.user!.id : undefined, acknowledgedAt: data.acknowledged ? new Date() : undefined, resolvedAt: data.status === 'RESOLVED' ? new Date() : undefined } });
  res.json({ alert });
}));

const emergencySchema = z.object({ type: z.string().min(2).max(80), location: z.string().min(2).max(240), description: z.string().min(2).max(10000), priority: z.enum(priorities), evidenceImage: z.string().max(500).optional() });
api.get('/emergencies', authenticate, asyncRoute(async (_req, res) => res.json({ emergencies: await prisma.emergencyIncident.findMany({ include: { reporter: { select: { id: true, name: true, role: true } } }, orderBy: { reportedAt: 'desc' } }) })));
api.post('/emergencies', authenticate, asyncRoute(async (req, res) => {
  const data = emergencySchema.parse(req.body);
  const incident = await prisma.emergencyIncident.create({ data: { ...data, incidentNumber: `EM-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`, reporterId: req.user!.id, timeline: [{ status: 'REPORTED', timestamp: new Date().toISOString(), actor: req.user!.name }] } });
  await notify({ type: 'emergency', event: 'emergency_alert', title: `Emergency: ${incident.type}`, message: `${incident.description} at ${incident.location}` });
  res.status(201).json({ incident });
}));
api.put('/emergencies/:id', authenticate, authorize(Role.ADMIN, Role.SECURITY), asyncRoute(async (req, res) => {
  const data = z.object({ status: z.enum(emergencyStatuses), note: z.string().max(2000).optional() }).parse(req.body);
  const incidentId = String(req.params.id);
  const current = await prisma.emergencyIncident.findUniqueOrThrow({ where: { id: incidentId } });
  const timeline = Array.isArray(current.timeline) ? current.timeline as Prisma.JsonArray : [];
  const incident = await prisma.emergencyIncident.update({ where: { id: incidentId }, data: { status: data.status, resolvedAt: data.status === 'RESOLVED' ? new Date() : undefined, timeline: [...timeline, { status: data.status, timestamp: new Date().toISOString(), actor: req.user!.name, note: data.note }] } });
  await notify({ type: 'emergency_status_changed', event: 'emergency_alert', title: 'Emergency response updated', message: `${incident.incidentNumber} is now ${data.status}.` });
  res.json({ incident });
}));

api.get('/analytics/overview', authenticate, asyncRoute(async (_req, res) => {
  const [total, open, critical, resolved] = await Promise.all([
    prisma.issue.count(), prisma.issue.count({ where: { status: { notIn: ['RESOLVED', 'VERIFIED'] } } }),
    prisma.issue.count({ where: { priority: 'CRITICAL', status: { notIn: ['RESOLVED', 'VERIFIED'] } } }),
    prisma.issue.count({ where: { status: { in: ['RESOLVED', 'VERIFIED'] } } }),
  ]);
  res.json({ total, open, critical, resolved });
}));
api.get('/analytics/problems-by-location', authenticate, asyncRoute(async (_req, res) => {
  const groups = await prisma.issue.groupBy({ by: ['location'], _count: { _all: true }, orderBy: { location: 'asc' } });
  res.json({ data: groups.map((group) => ({ location: group.location, count: group._count._all })) });
}));
api.get('/analytics/problems-by-category', authenticate, asyncRoute(async (_req, res) => {
  const groups = await prisma.issue.groupBy({ by: ['category'], _count: { _all: true }, orderBy: { category: 'asc' } });
  res.json({ data: groups.map((group) => ({ category: group.category, count: group._count._all })) });
}));
api.get('/analytics/status', authenticate, asyncRoute(async (_req, res) => {
  const groups = await prisma.issue.groupBy({ by: ['status'], _count: { _all: true } });
  res.json({ data: groups.map((group) => ({ status: group.status, count: group._count._all })) });
}));
api.get('/analytics/monthly', authenticate, asyncRoute(async (_req, res) => {
  const rows = await prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`SELECT date_trunc('month', reported_at) AS month, count(*)::bigint AS count FROM issues GROUP BY month ORDER BY month`;
  res.json({ data: rows.map((row) => ({ month: row.month.toISOString().slice(0, 7), count: Number(row.count) })) });
}));
api.get('/analytics/resolution-time', authenticate, asyncRoute(async (_req, res) => {
  const result = await prisma.$queryRaw<Array<{ average_hours: number | null }>>`SELECT avg(extract(epoch FROM (resolved_at - reported_at)) / 3600)::float AS average_hours FROM issues WHERE resolved_at IS NOT NULL`;
  res.json({ averageHours: result[0]?.average_hours ?? null });
}));

api.get('/departments', authenticate, asyncRoute(async (_req, res) => res.json({ departments: await prisma.department.findMany({ orderBy: { name: 'asc' } }) })));
api.get('/users', authenticate, authorize(Role.ADMIN), asyncRoute(async (_req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, section: true, department: true }, orderBy: { name: 'asc' } });
  res.json({ users });
}));
api.post('/food-complaints', authenticate, asyncRoute(async (req, res) => {
  const data = reportSchema.extend({ selectedDay: z.string().min(1), lunchMenu: z.string().min(1), studentName: z.string().min(1), section: z.string().min(1) }).parse(req.body);
  const issueData = { ...data, category: 'Food Complaint', location: 'Food / Canteen', locationType: 'Canteen', building: 'Canteen', title: data.title || `Food Complaint - ${data.selectedDay}` };
  res.status(201).json({ issue: await createIssueReport(req, issueData) });
}));
api.get('/food-complaints', authenticate, asyncRoute(async (_req, res) => {
  res.json({ complaints: await prisma.foodComplaint.findMany({ include: { issue: true, reporter: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'desc' } }) });
}));