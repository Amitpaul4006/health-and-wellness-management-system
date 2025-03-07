const { Queue, Worker } = require('bullmq');
const { sendEmail } = require('../utils/email');
const IORedis = require('ioredis'); // Corrected import
const schedule = require('node-schedule');
const User = require('../models/User'); // Corrected import path

const redis = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null, // Set to null as required by BullMQ
});
const reminderQueue = new Queue('reminders', { connection: redis });

const addReminderJob = async (medication) => {
  const { _id, userId, name, type, date, time, recurrence, dayOfWeek, startDate, endDate } = medication;

  if (type === 'one-time') {
    const [hours, minutes] = time.split(':');
    const jobTime = new Date(date);
    jobTime.setHours(hours, minutes);

    await reminderQueue.add(
      'send-reminder',
      { userId, medicationId: _id, name },
      { delay: jobTime - Date.now() }
    );
  } else if (type === 'recurring') {
    const [hours, minutes] = time.split(':');
    let cronExpression;
    if (recurrence === 'daily') {
      cronExpression = `${minutes} ${hours} * * *`;
    } else if (recurrence === 'weekly') {
      const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
      cronExpression = `${minutes} ${hours} * * ${dayMap[dayOfWeek]}`;
    }

    await reminderQueue.add(
      'send-recurring-reminder',
      { userId, medicationId: _id, name, startDate, endDate },
      { repeat: { cron: cronExpression, startDate, endDate } }
    );
  }
};

// Worker to process reminders
new Worker(
  'reminders',
  async (job) => {
    const { userId, medicationId, name } = job.data;
    await sendEmail(userId, `Medication Reminder: ${name}`, `Time to take ${name}!`);
  },
  { connection: redis }
);

module.exports = { addReminderJob };