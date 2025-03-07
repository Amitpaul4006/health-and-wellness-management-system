const { Queue, Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const { createJob, jobCleanup } = require('../services/jobScheduler');

jest.mock('nodemailer');

describe('Report Jobs', () => {
  let emailQueue;
  let connection;

  beforeEach(() => {
    connection = {
      host: 'localhost',
      port: 6379
    };
    
    emailQueue = new Queue('emailQueue', { connection });
  });

  afterEach(async () => {
    await emailQueue.close();
    await jobCleanup();
  });

  test('weekly report job scheduling', async () => {
    const jobData = { type: 'weeklyReport', email: 'test@example.com' };
    const job = await emailQueue.add('weeklyReport', jobData);
    
    expect(job).toBeDefined();
    expect(job.name).toBe('weeklyReport');
    
    const savedJob = await emailQueue.getJob(job.id);
    expect(savedJob.data).toEqual(jobData);
  });
});