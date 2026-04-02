import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 12);

  // Users
  const admin = await prisma.user.create({
    data: { name: 'Fathima Zahra', email: 'fathima@flowspace.com', password, role: 'ADMIN' },
  });
  const admin2 = await prisma.user.create({
    data: { name: 'Zahara Sheikh', email: 'zahara@flowspace.com', password, role: 'ADMIN' },
  });
  const pm1 = await prisma.user.create({
    data: { name: 'Arjun Sharma', email: 'arjun@flowspace.com', password, role: 'PROJECT_MANAGER' },
  });
  const pm2 = await prisma.user.create({
    data: { name: 'Priya Nair', email: 'priya@flowspace.com', password, role: 'PROJECT_MANAGER' },
  });
  const dev1 = await prisma.user.create({
    data: { name: 'Ravi Kumar', email: 'ravi@flowspace.com', password, role: 'DEVELOPER' },
  });
  const dev2 = await prisma.user.create({
    data: { name: 'Aisha Patel', email: 'aisha@flowspace.com', password, role: 'DEVELOPER' },
  });
  const dev3 = await prisma.user.create({
    data: { name: 'Rohan Mehta', email: 'rohan@flowspace.com', password, role: 'DEVELOPER' },
  });
  const dev4 = await prisma.user.create({
    data: { name: 'Sneha Reddy', email: 'sneha@flowspace.com', password, role: 'DEVELOPER' },
  });

  // Clients
  const client1 = await prisma.client.create({
    data: { name: 'Vikram Anand', email: 'vikram@techcorp.in', company: 'TechCorp India' },
  });
  const client2 = await prisma.client.create({
    data: { name: 'Meera Iyer', email: 'meera@greenleaf.in', company: 'GreenLeaf Studio' },
  });
  const client3 = await prisma.client.create({
    data: { name: 'Suresh Pillai', email: 'suresh@finova.in', company: 'Finova Solutions' },
  });

  // Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'TechCorp Website Redesign',
      description: 'Full redesign of the TechCorp marketing website with new brand guidelines.',
      clientId: client1.id,
      managerId: pm1.id,
    },
  });
  const project2 = await prisma.project.create({
    data: {
      name: 'GreenLeaf Mobile App',
      description: 'Cross-platform mobile application for GreenLeaf Studio customers.',
      clientId: client2.id,
      managerId: pm1.id,
    },
  });
  const project3 = await prisma.project.create({
    data: {
      name: 'Finova Analytics Dashboard',
      description: 'Internal analytics dashboard for Finova financial data and reporting.',
      clientId: client3.id,
      managerId: pm2.id,
    },
  });

  const now = new Date();
  const past = (days: number) => new Date(now.getTime() - days * 86400000);
  const future = (days: number) => new Date(now.getTime() + days * 86400000);

  // Project 1 Tasks
  const t1 = await prisma.task.create({ data: { title: 'Design homepage mockup', description: 'Create Figma mockups for the new homepage', status: 'DONE', priority: 'HIGH', dueDate: past(10), projectId: project1.id, assignedTo: dev1.id } });
  const t2 = await prisma.task.create({ data: { title: 'Implement navigation component', description: 'Build responsive navigation with dropdowns', status: 'IN_REVIEW', priority: 'HIGH', dueDate: past(2), projectId: project1.id, assignedTo: dev1.id } });
  const t3 = await prisma.task.create({ data: { title: 'SEO audit and fixes', description: 'Run full SEO audit and implement recommendations', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: future(5), projectId: project1.id, assignedTo: dev2.id } });
  const t4 = await prisma.task.create({ data: { title: 'Performance optimization', description: 'Optimize images and implement lazy loading', status: 'TODO', priority: 'MEDIUM', dueDate: future(10), projectId: project1.id, assignedTo: dev2.id } });
  const t5 = await prisma.task.create({ data: { title: 'Write unit tests', description: 'Write tests for all React components', status: 'OVERDUE', priority: 'LOW', dueDate: past(5), projectId: project1.id, assignedTo: dev1.id } });

  // Project 2 Tasks
  const t6 = await prisma.task.create({ data: { title: 'Setup React Native project', description: 'Initialize RN project with navigation and state management', status: 'DONE', priority: 'CRITICAL', dueDate: past(15), projectId: project2.id, assignedTo: dev3.id } });
  const t7 = await prisma.task.create({ data: { title: 'Build authentication flow', description: 'Login, register, forgot password screens', status: 'IN_PROGRESS', priority: 'CRITICAL', dueDate: future(3), projectId: project2.id, assignedTo: dev3.id } });
  const t8 = await prisma.task.create({ data: { title: 'Design system setup', description: 'Implement design tokens and reusable components', status: 'IN_REVIEW', priority: 'HIGH', dueDate: past(1), projectId: project2.id, assignedTo: dev4.id } });
  const t9 = await prisma.task.create({ data: { title: 'Push notification integration', description: 'Integrate Firebase push notifications', status: 'TODO', priority: 'MEDIUM', dueDate: future(7), projectId: project2.id, assignedTo: dev4.id } });
  const t10 = await prisma.task.create({ data: { title: 'App store submission prep', description: 'Prepare screenshots, descriptions, and metadata', status: 'OVERDUE', priority: 'HIGH', dueDate: past(3), projectId: project2.id, assignedTo: dev3.id } });

  // Project 3 Tasks
  const t11 = await prisma.task.create({ data: { title: 'Database schema design', description: 'Design PostgreSQL schema for financial data', status: 'DONE', priority: 'CRITICAL', dueDate: past(20), projectId: project3.id, assignedTo: dev2.id } });
  const t12 = await prisma.task.create({ data: { title: 'Build REST API endpoints', description: 'Create all API endpoints for dashboard data', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: future(4), projectId: project3.id, assignedTo: dev2.id } });
  const t13 = await prisma.task.create({ data: { title: 'Charts and visualizations', description: 'Implement D3.js charts for financial metrics', status: 'TODO', priority: 'HIGH', dueDate: future(8), projectId: project3.id, assignedTo: dev1.id } });
  const t14 = await prisma.task.create({ data: { title: 'Role-based access control', description: 'Implement RBAC for different user types', status: 'IN_REVIEW', priority: 'CRITICAL', dueDate: future(2), projectId: project3.id, assignedTo: dev4.id } });
  const t15 = await prisma.task.create({ data: { title: 'Export to PDF feature', description: 'Allow users to export reports as PDF', status: 'TODO', priority: 'LOW', dueDate: future(14), projectId: project3.id, assignedTo: dev3.id } });

  // Activity Logs
  const activities = [
    { userId: dev1.id, projectId: project1.id, taskId: t1.id, action: `Ravi Kumar moved Design homepage mockup from IN_PROGRESS → DONE`, fromStatus: 'IN_PROGRESS', toStatus: 'DONE', createdAt: past(10) },
    { userId: dev1.id, projectId: project1.id, taskId: t2.id, action: `Ravi Kumar moved Implement navigation component from IN_PROGRESS → IN_REVIEW`, fromStatus: 'IN_PROGRESS', toStatus: 'IN_REVIEW', createdAt: past(2) },
    { userId: dev2.id, projectId: project1.id, taskId: t3.id, action: `Aisha Patel moved SEO audit and fixes from TODO → IN_PROGRESS`, fromStatus: 'TODO', toStatus: 'IN_PROGRESS', createdAt: past(1) },
    { userId: dev3.id, projectId: project2.id, taskId: t6.id, action: `Rohan Mehta moved Setup React Native project from IN_PROGRESS → DONE`, fromStatus: 'IN_PROGRESS', toStatus: 'DONE', createdAt: past(15) },
    { userId: dev3.id, projectId: project2.id, taskId: t7.id, action: `Rohan Mehta moved Build authentication flow from TODO → IN_PROGRESS`, fromStatus: 'TODO', toStatus: 'IN_PROGRESS', createdAt: past(3) },
    { userId: dev4.id, projectId: project2.id, taskId: t8.id, action: `Sneha Reddy moved Design system setup from IN_PROGRESS → IN_REVIEW`, fromStatus: 'IN_PROGRESS', toStatus: 'IN_REVIEW', createdAt: past(1) },
    { userId: dev2.id, projectId: project3.id, taskId: t11.id, action: `Aisha Patel moved Database schema design from IN_PROGRESS → DONE`, fromStatus: 'IN_PROGRESS', toStatus: 'DONE', createdAt: past(20) },
    { userId: dev4.id, projectId: project3.id, taskId: t14.id, action: `Sneha Reddy moved Role-based access control from TODO → IN_REVIEW`, fromStatus: 'TODO', toStatus: 'IN_REVIEW', createdAt: past(1) },
    { userId: admin.id, projectId: project1.id, taskId: t5.id, action: `Fathima Zahra flagged Write unit tests as OVERDUE`, fromStatus: 'TODO', toStatus: 'OVERDUE', createdAt: past(5) },
    { userId: admin.id, projectId: project2.id, taskId: t10.id, action: `Fathima Zahra flagged App store submission prep as OVERDUE`, fromStatus: 'IN_PROGRESS', toStatus: 'OVERDUE', createdAt: past(3) },
  ];

  for (const activity of activities) {
    await prisma.activityLog.create({ data: activity });
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: dev1.id, title: 'New task assigned', message: 'You have been assigned: Implement navigation component', isRead: false },
      { userId: dev2.id, title: 'New task assigned', message: 'You have been assigned: SEO audit and fixes', isRead: true },
      { userId: pm1.id, title: 'Task ready for review', message: 'Implement navigation component has been moved to In Review', isRead: false },
      { userId: pm2.id, title: 'Task ready for review', message: 'Role-based access control has been moved to In Review', isRead: false },
      { userId: dev3.id, title: 'New task assigned', message: 'You have been assigned: Build authentication flow', isRead: false },
      { userId: dev4.id, title: 'Task ready for review', message: 'Design system setup has been moved to In Review', isRead: true },
      { userId: admin.id, title: 'Project update', message: 'TechCorp Website Redesign has 2 overdue tasks', isRead: false },
      { userId: admin2.id, title: 'New project created', message: 'Finova Analytics Dashboard has been created', isRead: false },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('📧 Login credentials (all passwords: password123)');
  console.log('   fathima@flowspace.com  — Admin');
  console.log('   zahara@flowspace.com   — Admin');
  console.log('   arjun@flowspace.com    — Project Manager');
  console.log('   priya@flowspace.com    — Project Manager');
  console.log('   ravi@flowspace.com     — Developer');
  console.log('   aisha@flowspace.com    — Developer');
  console.log('   rohan@flowspace.com    — Developer');
  console.log('   sneha@flowspace.com    — Developer');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());