const { Queue } = require('bullmq');
const nodemailer = require('nodemailer');
const jobScheduler = require('../services/jobScheduler');
const emailConfig = require('../config/emailConfig');
const { setupTestEnv, mockNodemailer, cleanupTestEnv } = require('./utils/testSetup');

jest.mock('nodemailer');

describe('Reminder Jobs', () => {
  let jobData;
  let mockMailer;
  let worker;

  beforeEach(() => {
    setupTestEnv();
    mockMailer = mockNodemailer();
    emailConfig.setTransporter(mockMailer);
    
    jobData = {
      email: 'test@example.com',
      medication: 'Aspirin',
      time: new Date(Date.now() + 1000 * 60 * 5).toISOString()
    };
  });

  afterEach(async () => {
    if (worker) {
      await worker.close();
    }
    await jobScheduler.cleanup();
    emailConfig.setTransporter(null);
    cleanupTestEnv();
    // Increase cleanup wait time
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('should create a job for medication reminder', async () => {
    const job = await jobScheduler.createJob(jobData);
    expect(job).toBeDefined();
    expect(job.data).toEqual(expect.objectContaining({
      email: jobData.email,
      medication: jobData.medication
    }));
  });

  test('should process the job and send an email', async () => {
    const job = await jobScheduler.createJob(jobData);
    worker = await jobScheduler.processJob();
    
    // Increase wait time for job processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    expect(mockMailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'test@example.com',
        to: jobData.email,
        subject: 'Medication Reminder',
        text: expect.stringContaining(jobData.medication)
      })
    );
  }, 10000); // Increase test timeout
});