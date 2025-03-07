const { Queue } = require('bullmq');
const Medication = require('../models/Medication');
const User = require('../models/User');
const { generateCSV } = require('../utils/csvGenerator');

const reportQueue = new Queue('reportQueue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

const generateWeeklyReport = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const medications = await Medication.find({
    userId,
    scheduledDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  const csvData = generateCSV(medications);

  await reportQueue.add('sendReport', {
    email: user.email,
    csvData
  });
};

module.exports = {
  generateWeeklyReport
};
