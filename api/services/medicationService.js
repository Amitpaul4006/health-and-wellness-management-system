const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

// Store active reminders
const activeReminders = new Map();

class MedicationService {
  async scheduleReminder(medication, user) {
    try {
      const scheduledTime = new Date(medication.scheduledDate);
      const now = new Date();
      const delay = Math.max(0, scheduledTime.getTime() - now.getTime());

      console.log('Scheduling medication reminder:', {
        medicationId: medication._id,
        userId: user._id,
        scheduledTime: scheduledTime.toISOString(),
        delay: `${Math.floor(delay / 1000 / 60)} minutes`,
        type: medication.type,
        userEmail: user.email
      });

      if (delay <= 0) {
        console.log('Medication time has passed, sending immediate reminder');
        await this.sendReminderNow(medication, user);
        return;
      }

      // Clear existing reminder if any
      this.cancelReminder(medication._id);

      // Schedule the reminder
      const timerId = setTimeout(async () => {
        try {
          await this.sendReminderNow(medication, user);
          
          // For recurring medications
          if (medication.type === 'recurring') {
            const nextDate = new Date(scheduledTime);
            nextDate.setDate(nextDate.getDate() + 1);
            console.log('Scheduling next recurring reminder for:', nextDate);
            
            await this.scheduleReminder({
              ...medication,
              scheduledDate: nextDate
            }, user);
          }
        } catch (error) {
          console.error('Failed to send reminder:', error);
        }
      }, delay);

      activeReminders.set(medication._id.toString(), timerId);
      
      // Update medication with reminder info
      await Medication.findByIdAndUpdate(medication._id, {
        lastReminderScheduled: now,
        nextReminder: scheduledTime
      });

    } catch (error) {
      console.error('Reminder scheduling error:', error);
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
      console.log('Sending immediate reminder for:', {
        medicationId: medication._id,
        userEmail: user.email
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
        <p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/medications/${medication._id}/mark-done">Mark as Done</a></p>
      `;

      await sendEmail(
        user.email,
        'Medication Reminder',
        emailContent
      );

      console.log('Reminder sent successfully');

      // Update medication status
      await Medication.findByIdAndUpdate(medication._id, {
        lastReminderSent: new Date()
      });

    } catch (error) {
      console.error('Failed to send immediate reminder:', error);
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
