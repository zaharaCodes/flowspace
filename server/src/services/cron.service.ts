import cron from 'node-cron';
import prisma from '../utils/prisma';

export const startOverdueJob = () => {
  // Runs every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running overdue task check...');
    try {
      const result = await prisma.task.updateMany({
        where: {
          dueDate: { lt: new Date() },
          status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] },
        },
        data: { status: 'OVERDUE' },
      });
      console.log(`Marked ${result.count} tasks as overdue`);
    } catch (err) {
      console.error('Overdue job failed:', err);
    }
  });
  console.log('⏰ Overdue task cron job started');
};
