const { Queue } = require('bullmq');
const { generateWeeklyReport } = require('../services/reportService');

const reportQueue = new Queue('report-generation', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
});

const addReportJob = async (userId) => {
  await reportQueue.add('generate-report', {
    userId,
    timestamp: new Date().toISOString()
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
};

module.exports = { reportQueue, addReportJob };
