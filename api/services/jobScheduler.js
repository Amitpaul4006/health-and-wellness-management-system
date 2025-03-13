const { sendEmail } = require('../config/emailConfig');

// Detect serverless environment
const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_VERSION;

let Queue, Worker;
if (!isServerless) {
  const bullmq = require('bullmq');
  Queue = bullmq.Queue;
  Worker = bullmq.Worker;
}

let queues = [];
let workers = [];

const QUEUE_NAMES = {
  REMINDER: 'reminderQueue',
  REPORT: 'reportQueue'
};

const createQueue = (name, connection = { host: 'localhost', port: 6379 }) => {
  if (isServerless) return null;
  const queue = new Queue(name, { connection });
  queues.push(queue);
  return queue;
};

// Mock queue for serverless
const createJob = async (data) => {
  if (isServerless) {
    console.log('Running in serverless mode - skipping queue');
    return { id: Date.now(), data };
  }

  const queue = createQueue(QUEUE_NAMES.REMINDER);
  const job = await queue.add('reminder', data);
  return job;
};

// Mock worker for serverless
const processJob = async () => {
  if (isServerless) {
    console.log('Running in serverless mode - returning mock worker');
    return {
      on: () => {},
      close: () => Promise.resolve()
    };
  }

  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  };

  // Create worker for reminder queue
  const reminderWorker = new Worker(QUEUE_NAMES.REMINDER, async (job) => {
    console.log('Processing reminder job:', job.id, job.data);
    const { email, medication } = job.data;

    try {
      await sendEmail({
        to: email,
        subject: 'Medication Reminder',
        text: `Don't forget to take your ${medication}!`
      });
    } catch (error) {
      console.error(`Failed to process reminder job ${job.id}:`, error);
      if (error.code === 'EAUTH') {
        console.error('Email authentication failed. Please check email credentials.');
      }
      throw error; // Re-throw to mark job as failed
    }
  }, { 
    connection,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 }
  });

  // Create worker for report queue
  const reportWorker = new Worker(QUEUE_NAMES.REPORT, async (job) => {
    console.log('Processing report job:', job.id, job.data);
    const { email, csvData } = job.data;

    const emailContent = `
      <h2>Weekly Medication Report</h2>
      <p>Please find attached your medication report for the past week.</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Weekly Medication Report',
      html: emailContent,
      attachments: [{
        filename: 'medication-report.csv',
        content: csvData,
        contentType: 'text/csv'
      }]
    });
  }, { connection });

  workers.push(reminderWorker, reportWorker);

  // Handle worker events
  [reminderWorker, reportWorker].forEach(worker => {
    worker.on('completed', job => console.log(`Job ${job.id} completed successfully`));
    worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));
  });

  return reminderWorker; // Return reminder worker for test compatibility
};

const cleanup = async () => {
  await Promise.all(queues.map(queue => queue.close()));
  await Promise.all(workers.map(worker => worker.close()));
  queues = [];
  workers = [];
};

// Alias for cleanup to maintain compatibility
const jobCleanup = cleanup;

const scheduleReminder = async (medication, user) => {
  try {
    const scheduledTime = new Date(medication.scheduledDate);
    const now = new Date();
    
    console.log('Scheduling reminder:', {
      medicationId: medication._id,
      userId: user._id,
      scheduledTime
    });

    // Schedule the reminder
    setTimeout(async () => {
      try {
        await sendEmail(
          user.email,
          'Medication Reminder',
          `<h2>Medication Reminder</h2>
           <p>This is a reminder to take your medication: ${medication.name}</p>
           <p>Time: ${scheduledTime.toLocaleTimeString()}</p>
           <p>Description: ${medication.description || 'No description'}</p>
           <a href="${process.env.CLIENT_URL}/medications/${medication._id}/mark-done">Mark as Done</a>`,
        );
        console.log('Reminder sent for medication:', medication._id);
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }, scheduledTime.getTime() - now.getTime());

  } catch (error) {
    console.error('Error scheduling reminder:', error);
  }
};

module.exports = {
  createJob,
  processJob,
  cleanup,
  jobCleanup,
  scheduleReminder
};
