const schedule = require('node-schedule');
const moment = require('moment');
const { sendEmail } = require('../config/emailConfig');
const User = require('../models/User');
const Medication = require('../models/Medication');

const scheduleMap = new Map();

const createEmailContent = (medication) => {
  const markDoneUrl = `${process.env.FRONTEND_URL}/medications/${medication._id}/mark-done`;
  
  return `
    <h2>Medication Reminder</h2>
    <p>It's time to take your medication: ${medication.name}</p>
    <p>Description: ${medication.description || 'No description provided'}</p>
    <p>Time: ${moment(medication.scheduledDate).format('hh:mm A')}</p>
    <div style="margin-top: 20px;">
      <a href="${markDoneUrl}" 
         style="background-color: #4CAF50; 
                color: white; 
                padding: 10px 20px; 
                text-decoration: none; 
                border-radius: 5px;
                display: inline-block;">
        Mark as Done
      </a>
    </div>
  `;
};

const getDayOfWeek = (weekDay) => {
  const days = {
    'SUNDAY': 0,
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6
  };
  return days[weekDay.toUpperCase()] || 0;
};

const scheduleNotification = async (medication, user) => {
  try {
    if (medication.status === 'done') {
      return;
    }

    const scheduleNotificationJob = (date) => {
      const job = schedule.scheduleJob(date, async () => {
        try {
          if (medication.status !== 'done') {
            const emailData = {
              to: user.email,
              subject: 'Medication Reminder',
              html: createEmailContent(medication),
              text: `It's time to take your medication: ${medication.name}`
            };

            await sendEmail(emailData);
            console.log(`Reminder sent for medication: ${medication.name}`);
          }
        } catch (error) {
          console.error('Failed to send medication reminder:', error);
        }
      });

      job.on('error', (error) => {
        console.error('Job scheduling error:', error);
      });

      return job;
    };

    // Cancel existing job if any
    if (scheduleMap.has(medication._id.toString())) {
      scheduleMap.get(medication._id.toString()).cancel();
    }

    if (medication.type === 'one-time') {
      const job = scheduleNotificationJob(medication.scheduledDate);
      scheduleMap.set(medication._id.toString(), job);
    } else if (medication.type === 'recurring') {
      const { startDate, endDate, time, frequency, weekDay } = medication.schedule;
      const rule = new schedule.RecurrenceRule();
      
      const [hours, minutes] = time.split(':');
      rule.hour = parseInt(hours);
      rule.minute = parseInt(minutes);

      if (frequency === 'daily') {
        const job = schedule.scheduleJob(
          { start: new Date(startDate), end: new Date(endDate), rule },
          async () => {
            try {
              if (medication.status !== 'done') {
                const emailData = {
                  to: user.email,
                  subject: 'Medication Reminder',
                  html: createEmailContent(medication),
                  text: `It's time to take your medication: ${medication.name}`
                };

                await sendEmail(emailData);
                console.log(`Reminder sent for medication: ${medication.name}`);
              }
            } catch (error) {
              console.error('Failed to send medication reminder:', error);
            }
          }
        );

        job.on('error', (error) => {
          console.error('Job scheduling error:', error);
        });

        scheduleMap.set(medication._id.toString(), job);
      } else if (frequency === 'weekly') {
        // Convert weekDay string to number
        rule.dayOfWeek = getDayOfWeek(weekDay);
        
        const job = schedule.scheduleJob(
          { start: new Date(startDate), end: new Date(endDate), rule },
          async () => {
            try {
              if (medication.status !== 'done') {
                const emailData = {
                  to: user.email,
                  subject: 'Medication Reminder',
                  html: createEmailContent(medication),
                  text: `It's time to take your medication: ${medication.name}`
                };

                await sendEmail(emailData);
                console.log(`Weekly reminder sent for medication: ${medication.name} on ${weekDay}`);
              }
            } catch (error) {
              console.error('Failed to send weekly medication reminder:', error);
            }
          }
        );

        job.on('error', (error) => {
          console.error('Weekly job scheduling error:', error);
        });

        scheduleMap.set(medication._id.toString(), job);
      }
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

const cancelNotification = (medicationId) => {
  if (scheduleMap.has(medicationId.toString())) {
    scheduleMap.get(medicationId.toString()).cancel();
    scheduleMap.delete(medicationId.toString());
  }
};

module.exports = {
  scheduleNotification,
  cancelNotification
};
