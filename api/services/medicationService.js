const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

// Store active reminders
const activeReminders = new Map();

class MedicationService {
  async scheduleReminder(medication, user) {
    try {
      console.log('Scheduling reminder:', {
        medicationId: medication._id,
        userId: user._id,
        email: user.email,
        scheduledDate: medication.scheduledDate
      });

      const scheduledTime = new Date(medication.scheduledDate);
      const now = new Date();

      // For immediate or past medications
      if (scheduledTime <= now) {
        console.log('Sending immediate reminder');
        await this.sendReminderNow(medication, user);
        return;
      }

      // For future medications
      const delay = scheduledTime.getTime() - now.getTime();
      console.log('Setting reminder with delay:', Math.floor(delay / 1000 / 60), 'minutes');

      setTimeout(async () => {
        try {
          await this.sendReminderNow(medication, user);
          
          if (medication.type === 'recurring') {
            const nextDate = new Date(scheduledTime);
            nextDate.setDate(nextDate.getDate() + 1);
            await this.scheduleReminder({
              ...medication,
              scheduledDate: nextDate
            }, user);
          }
        } catch (error) {
          console.error('Failed to send scheduled reminder:', error);
        }
      }, delay);

      // Update medication status
      await Medication.findByIdAndUpdate(medication._id, {
        lastReminderScheduled: now,
        nextReminder: scheduledTime
      });

      return true;
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      throw error;
    }
  }

  cancelReminder(medicationId) {
    const timerId = activeReminders.get(medicationId.toString());
    if (timerId) {
      clearTimeout(timerId);
      activeReminders.delete(medicationId.toString());
      console.log('Cancelled reminder:', medicationId);
    }
  }

  async sendReminderNow(medication, user) {
    try {
      if (!user?.email) {
        throw new Error('User email is required for sending reminder');
      }

      console.log('Sending reminder:', {
        medicationId: medication._id,
        userName: user.username || user.email,
        scheduledTime: medication.scheduledDate
      });

      const emailContent = `
        <h2>Medication Reminder</h2>
        <p>Hello ${user.username || user.email},</p>
        <p>Time to take your medication: <strong>${medication.name}</strong></p>
        <p>Details:</p>
        <ul>
          <li>Type: ${medication.type}</li>
          <li>Description: ${medication.description || 'No description'}</li>
          <li>Scheduled Time: ${new Date(medication.scheduledDate).toLocaleString()}</li>
        </ul>
      `;

      // Set a shorter timeout for serverless environment
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email timeout')), 5000);
      });

      const emailPromise = sendEmail(
        user.email,
        'Medication Reminder',
        emailContent
      );

      const result = await Promise.race([emailPromise, timeoutPromise]);
      console.log('Reminder sent to:', user.email);
      return result;
    } catch (error) {
      console.error('Reminder send error:', error);
      throw error;
    }
  }

  async sendReminderEmail(medication, user) {
    const emailContent = `
      <h2>Medication Reminder</h2>
      <p>Hello ${user.username || user.email},</p>
      <p>Time to take your medication: <strong>${medication.name}</strong></p>
      <p>Details:</p>
      <ul>
        <li>Time: ${new Date(medication.scheduledDate).toLocaleTimeString()}</li>
        <li>Description: ${medication.description || 'No description'}</li>
        <li>Type: ${medication.type}</li>
      </ul>
      <p><a href="${process.env.CLIENT_URL}/medications/${medication._id}/mark-done">Mark as Done</a></p>
    `;

    await sendEmail(
      user.email,
      'Medication Reminder',
      emailContent
    );

    console.log('Reminder email sent:', {
      medicationId: medication._id,
      userEmail: user.email
    });

    // Update medication status
    await Medication.findByIdAndUpdate(medication._id, {
      lastNotified: new Date(),
      notificationSent: true
    });
  }

  async updateMedicationStatus(medicationId, status, userId) {
    const medication = await Medication.findOneAndUpdate(
      { _id: medicationId, userId },
      { status },
      { new: true }
    );

    if (medication && status === 'done') {
      this.cancelReminder(medicationId);
    }

    return medication;
  }

  async getMedicationStatus(medicationId, userId) {
    return await Medication.findOne({ _id: medicationId, userId });
  }

  async generateAndSendReport(userId, user) {
    try {
      console.log('Generating report for user:', userId);

      const medications = await Medication.find({ userId });
      const csvHeader = 'Name,Description,Type,Scheduled Date,Status\n';
      const csvRows = medications.map(med => 
        `${med.name},${med.description || ''},${med.type},${med.scheduledDate.toISOString()},${med.status}`
      ).join('\n');

      const emailContent = `
        <h2>Medication Report</h2>
        <p>Hello ${user.username || user.email},</p>
        <p>Please find your medication report attached.</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      `;

      await sendEmail(
        user.email,
        'Your Medication Report',
        emailContent,
        csvHeader + csvRows
      );

      console.log('Report sent successfully to:', user.email);
      return true;
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  async handleMedicationReminder(medication, user) {
    try {
      console.log('Processing reminder:', {
        medicationId: medication._id,
        userId: user._id,
        scheduledTime: medication.scheduledDate
      });

      // Send reminder email
      await this.sendReminderEmail(medication, user);

      // Update medication status
      await Medication.findByIdAndUpdate(medication._id, {
        lastNotified: new Date(),
        notificationSent: true
      });

      // Schedule next reminder if recurring
      if (medication.type === 'recurring') {
        const nextDate = new Date(medication.scheduledDate);
        nextDate.setDate(nextDate.getDate() + 1);
        await this.scheduleReminder({
          ...medication,
          scheduledDate: nextDate,
          notificationSent: false
        }, user);
      }

      return true;
    } catch (error) {
      console.error('Reminder handling error:', error);
      throw error;
    }
  }

  getActiveReminders(userId) {
    return Array.from(activeReminders.entries())
      .filter(([id]) => id.startsWith(userId))
      .map(([id, timer]) => ({
        id,
        scheduled: true,
        timer: !!timer
      }));
  }
}

module.exports = new MedicationService();
