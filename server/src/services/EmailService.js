import nodemailer from 'nodemailer';
import { emailQueue } from '../queues/emailQueue';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  async sendMedicationReminder(email: string, medication: any) {
    await emailQueue.add('medication-reminder', {
      to: email,
      subject: 'Medication Reminder',
      text: `Time to take your medicine: ${medication.medicineName}`
    });
  }

  async sendWeeklyReport(email: string, report: any) {
    await emailQueue.add('weekly-report', {
      to: email,
      subject: 'Weekly Medication Report',
      attachments: [{
        filename: 'report.csv',
        content: report
      }]
    });
  }
}

export default new EmailService();
