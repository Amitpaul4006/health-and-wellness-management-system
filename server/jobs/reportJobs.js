const { Queue } = require('bullmq');
const { createObjectCsvWriter } = require('csv-writer');
const Medication = require('../models/Medication');
const User = require('../models/Users');
const { sendEmail } = require('../utils/email');
const IORedis = require('redis');

const redis = new IORedis({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT });
const reportQueue = new Queue('reports', { connection: redis });

const addWeeklyReportJob = () => {
  reportQueue.add(
    'generate-weekly-report',
    {},
    { repeat: { cron: '0 0 * * 0' } } // Every Sunday at midnight
  );
};

new Worker(
  'reports',
  async () => {
    const users = await User.find();
    for (const user of users) {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      const medications = await Medication.find({
        userId: user._id,
        date: { $gte: startOfWeek },
      });

      const csvWriter = createObjectCsvWriter({
        path: `./reports/${user._id}_weekly.csv`,
        header: [
          { id: 'name', title: 'Medicine Name' },
          { id: 'date', title: 'Date' },
          { id: 'time', title: 'Time' },
          { id: 'completed', title: 'Completed' },
        ],
      });

      await csvWriter.writeRecords(medications);
      await sendEmail(user._id, 'Weekly Medication Report', 'Attached is your weekly report.', `./reports/${user._id}_weekly.csv`);
    }
  },
  { connection: redis }
);

module.exports = { addWeeklyReportJob };