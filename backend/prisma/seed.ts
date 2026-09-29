import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Priority, Role, IssueStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const seedPassword = process.env.SEED_DEMO_PASSWORD ?? '';
if (seedPassword.length < 12) throw new Error('Set SEED_DEMO_PASSWORD to a value of at least 12 characters before seeding.');

const demoLocations = [
  'Classroom A101', 'Classroom A102', 'Classroom A103', 'Classroom A104', 'Classroom A105',
  'Classroom A106', 'Classroom A107', 'Classroom A108', 'Classroom A109', 'Classroom A110',
  'Classroom B201', 'Classroom B202', 'Classroom B203', 'Classroom B204', 'Classroom B205',
  'Classroom B206', 'Classroom B207', 'Classroom B208', 'Classroom B209', 'Classroom B210',
  'Classroom C301', 'Classroom C302', 'Classroom C303', 'Classroom C304', 'Classroom C305',
  'Classroom C306', 'Classroom C307', 'Classroom C308', 'Classroom C309', 'Classroom C310',
  'Physics Laboratory', 'Chemistry Laboratory', 'Computer Laboratory', 'Electronics Laboratory',
  'Central Library', 'Seminar Hall', 'Auditorium', 'Main Corridor', 'Ground Floor Washroom',
  'First Floor Washroom', 'Playground', 'Main Canteen', 'Parking Area', 'Electrical Room',
  'Principal Office', 'Staff Room', 'Faculty Room', 'Main Entrance', 'Security Room', 'Sports Room',
];

const demoNames = [
  'Rahul Kumar', 'Priya Sharma', 'Anil Reddy', 'Sneha Rao', 'Kiran Kumar', 'Divya Reddy',
  'Arjun Varma', 'Neha Patel', 'Sai Krishna', 'Pooja Devi', 'Naveen Kumar', 'Harsha Vardhan',
  'Swathi Rao', 'Rohit Kumar', 'Keerthi Reddy',
];

const problemTypes = [
  'Broken Fan', 'Broken Light', 'Electrical Problem', 'Damaged Desk', 'Damaged Chair',
  'Water Leakage', 'Plumbing Problem', 'Projector Problem', 'Computer Problem', 'Lab Equipment Problem',
  'Cleanliness Problem', 'Broken Door', 'Broken Window', 'Floor Damage', 'Wall Damage', 'AC Problem',
  'Safety Equipment Problem', 'Ground/Safety Problem', 'Food Quality Problem', 'Hygiene Problem',
  'Security Problem', 'Drainage Problem',
];

const demoDepartments = [
  { name: 'Electrical Maintenance', description: 'Electrical inspection and repairs' },
  { name: 'Civil Maintenance', description: 'Buildings, furniture, floors, and fixtures' },
  { name: 'Plumbing', description: 'Water, drainage, and washroom maintenance' },
  { name: 'IT Support', description: 'Computers, projectors, and classroom technology' },
  { name: 'Housekeeping', description: 'Cleaning and hygiene services' },
  { name: 'Laboratory Maintenance', description: 'Laboratory equipment and safety systems' },
  { name: 'Security', description: 'Campus security and access control' },
  { name: 'Canteen Services', description: 'Canteen food quality and hygiene' },
  { name: 'General Maintenance', description: 'General campus repairs and facilities' },
  { name: 'Sports Maintenance', description: 'Playground and sports facilities' },
];

const demoStatuses = [
  IssueStatus.REPORTED, IssueStatus.REPORTED, IssueStatus.REPORTED, IssueStatus.REPORTED,
  IssueStatus.ASSIGNED, IssueStatus.ASSIGNED, IssueStatus.IN_PROGRESS, IssueStatus.IN_PROGRESS,
  IssueStatus.RESOLVED, IssueStatus.VERIFIED,
];

function departmentFor(category: string, location: string): string {
  if (location.includes('Laboratory') && ['Lab Equipment Problem', 'Safety Equipment Problem', 'Electrical Problem'].includes(category)) return 'Laboratory Maintenance';
  if (category.includes('Electrical') || category.includes('Light') || category.includes('Fan')) return 'Electrical Maintenance';
  if (category.includes('Water') || category.includes('Plumbing') || category.includes('Drainage')) return 'Plumbing';
  if (category.includes('Computer') || category.includes('Projector')) return 'IT Support';
  if (category.includes('Food') || category.includes('Hygiene') && location === 'Main Canteen') return 'Canteen Services';
  if (category.includes('Hygiene') || category.includes('Cleanliness')) return 'Housekeeping';
  if (category.includes('Security')) return 'Security';
  if (category.includes('Ground') || location === 'Playground' || location === 'Sports Room') return 'Sports Maintenance';
  if (category.includes('Damage') || category.includes('Door') || category.includes('Window') || category.includes('Desk') || category.includes('Chair')) return 'Civil Maintenance';
  return 'General Maintenance';
}

function categoryFor(index: number, location: string): string {
  if (location === 'Physics Laboratory' || location === 'Chemistry Laboratory' || location === 'Electronics Laboratory') return 'Lab Equipment Problem';
  if (location === 'Computer Laboratory') return 'Computer Problem';
  if (location === 'Electrical Room') return 'Electrical Problem';
  if (location === 'Main Canteen') return 'Food Quality Problem';
  if (location === 'Security Room' || location === 'Main Entrance') return 'Security Problem';
  if (location === 'Playground' || location === 'Sports Room') return 'Ground/Safety Problem';
  return problemTypes[index % problemTypes.length];
}

async function main() {
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const departments = await Promise.all(demoDepartments.map(({ name, description }) => prisma.department.upsert({ where: { name }, update: { description }, create: { name, description } })));
  const users = await Promise.all([
    { name: 'Campus Administrator', email: 'admin@demo.school', role: Role.ADMIN },
    { name: 'Demo Teacher', email: 'teacher@demo.school', role: Role.TEACHER, section: 'Grade 7' },
    { name: 'Demo Student', email: 'student@demo.school', role: Role.STUDENT, section: 'Grade 7' },
    { name: 'Maintenance Technician', email: 'maintenance@demo.school', role: Role.MAINTENANCE_STAFF, departmentId: departments[0].id },
    { name: 'Campus Security', email: 'security@demo.school', role: Role.SECURITY },
    { name: 'Canteen Coordinator', email: 'canteen@demo.school', role: Role.CANTEEN_STAFF, departmentId: departments[3].id },
  ].map((user) => prisma.user.upsert({ where: { email: user.email }, update: { passwordHash, role: user.role }, create: { ...user, passwordHash } })));

  const demoReporters = await Promise.all(demoNames.map((name, index) => {
    const email = `${name.toLowerCase().replaceAll(' ', '.')}@demo.school`;
    return prisma.user.upsert({
      where: { email },
      update: { name, role: index % 3 === 0 ? Role.STUDENT : Role.TEACHER, section: `${6 + index % 7}-${String.fromCharCode(65 + index % 3)}`, passwordHash },
      create: { name, email, role: index % 3 === 0 ? Role.STUDENT : Role.TEACHER, section: `${6 + index % 7}-${String.fromCharCode(65 + index % 3)}`, passwordHash },
    });
  }));

  const existing = await prisma.issue.count();
  if (existing === 0) {
    const created = await prisma.issue.create({
      data: {
        issueNumber: 'SCH-DEMO-001', title: 'Ceiling fan making unusual noise', description: 'Fan in the north classroom requires inspection.',
        location: 'Block A, Classroom 103', category: 'Broken Fan', priority: Priority.MEDIUM,
        report: { create: { reporterId: users[1].id, section: 'Grade 7', locationType: 'Classroom', building: 'Block A', classroom: '103', exactLocation: 'Block A, Classroom 103' } },
        timeline: { create: { actorId: users[1].id, status: IssueStatus.REPORTED, note: 'Seeded demonstration report.' } },
      },
    });
    await prisma.issueAssignment.create({ data: { issueId: created.id, departmentId: departments[0].id, assigneeId: users[3].id, assignedById: users[0].id } });
    await prisma.notification.create({ data: { userId: users[0].id, issueId: created.id, type: 'new_report', title: 'New problem report', message: 'A demonstration classroom report is ready for review.' } });
    await prisma.safetyAlert.create({ data: { title: 'Routine equipment inspection due', message: 'A scheduled inspection is due this week.', location: 'Block A', priority: Priority.LOW, createdById: users[0].id } });
  }

  const departmentIds = new Map(departments.map((department) => [department.name, department.id]));
  for (const [index, location] of demoLocations.entries()) {
    const issueNumber = `SCH-DEMO-ROOM-${String(index + 1).padStart(3, '0')}`;
    if (await prisma.issue.findUnique({ where: { issueNumber }, select: { id: true } })) continue;

    const category = categoryFor(index, location);
    const reporter = demoReporters[index % demoReporters.length];
    const departmentName = departmentFor(category, location);
    const status = demoStatuses[index % demoStatuses.length];
    const criticalProblem = location === 'Electrical Room' ||
      (location.includes('Laboratory') && ['Lab Equipment Problem', 'Electrical Problem', 'Safety Equipment Problem'].includes(category));
    const priority = criticalProblem ? Priority.CRITICAL : index % 8 === 0 ? Priority.HIGH : index % 3 === 0 ? Priority.MEDIUM : Priority.LOW;
    const section = reporter.section ?? '8-A';
    const building = location.startsWith('Classroom A') ? 'Block A' : location.startsWith('Classroom B') ? 'Block B' : location.startsWith('Classroom C') ? 'Block C' : location;
    const classroom = location.startsWith('Classroom ') ? location.replace('Classroom ', '') : undefined;
    const phone = `+91 90000 ${String(index + 1).padStart(5, '0')}`;
    const reportedAt = new Date(Date.now() - index * 86_400_000);

    const issue = await prisma.$transaction(async (tx) => {
      const created = await tx.issue.create({
        data: {
          issueNumber,
          title: `${category} at ${location}`,
          description: `Demo report: ${category.toLowerCase()} requires inspection at ${location}.`,
          location,
          category,
          priority,
          status,
          reportedAt,
          resolvedAt: status === IssueStatus.RESOLVED || status === IssueStatus.VERIFIED ? reportedAt : undefined,
          verifiedAt: status === IssueStatus.VERIFIED ? reportedAt : undefined,
          report: { create: {
            reporterId: reporter.id,
            section,
            reporterPhone: phone,
            locationType: location.startsWith('Classroom ') ? 'Classroom' : location.includes('Laboratory') ? 'Laboratory' : location.includes('Washroom') ? 'Washroom' : location === 'Main Canteen' ? 'Canteen' : 'Others',
            building,
            floor: location.includes('First Floor') ? 'First Floor' : location.startsWith('Classroom B') || location.startsWith('Classroom C') ? 'Upper Floor' : 'Ground Floor',
            classroom,
            exactLocation: location,
          } },
          timeline: { create: { actorId: reporter.id, status, note: 'Seeded database-backed demonstration report.' } },
        },
      });
      if (status !== IssueStatus.REPORTED) {
        await tx.issueAssignment.create({
          data: { issueId: created.id, departmentId: departmentIds.get(departmentName), assignedById: users[0].id },
        });
      }
      return created;
    });
    if (!issue.id) throw new Error(`Unable to seed demo issue ${issueNumber}.`);
  }

  const seededRoomIssues = await prisma.issue.count({ where: { issueNumber: { startsWith: 'SCH-DEMO-ROOM-' } } });
  console.log(`Seeded ${users.length + demoReporters.length} demo accounts, ${departments.length} departments, and ${seededRoomIssues} database-backed room/location issues. Password is supplied via SEED_DEMO_PASSWORD.`);
}

main().finally(() => prisma.$disconnect());