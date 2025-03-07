const { Queue } = require('bullmq');
const Medication = require('../models/Medication');
const emailService = require('./emailService');

class MedicationService {
  constructor() {
    this.medicationQueue = new Queue('medication', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    });
  }

  async scheduleOneTimeMedication(medicationData) {
    try {
      // Create the medication document
      const medication = new Medication({
        name: medicationData.name,
        type: 'one-time',
        description: medicationData.description,
        scheduledDate: medicationData.scheduledDate,
        userId: medicationData.userId,
        status: 'pending'
      });

      // Save first to get the ID
      await medication.save();

      // Calculate delay
      const now = new Date();
      const scheduledTime = new Date(medication.scheduledDate);
      const delay = Math.max(0, scheduledTime - now);

      // Add to queue
      const job = await this.medicationQueue.add('medication-reminder', {
        medicationId: medication._id,
        email: medicationData.userEmail,
        medication: medication.name,
        time: scheduledTime.toISOString()
      }, {
        delay,
        attempts: 3,
        removeOnComplete: false
      });

      // Update with job ID
      medication.jobId = job.id;
      await medication.save();

      return medication;
    } catch (error) {
      console.error('Error in scheduleOneTimeMedication:', error);
      throw error;
    }
  }

  async processImmediateMedication(medication) {
    try {
      await emailService.sendEmail({
        to: medication.userEmail,
        subject: 'Medication Reminder',
        text: `Time to take your medication: ${medication.name} now!`
      });
      await this.updateMedicationStatus(medication._id, 'completed');
    } catch (error) {
      console.error('Error processing immediate medication:', error);
    }
  }

  async updateMedicationStatus(medicationId, status) {
    return await Medication.findByIdAndUpdate(
      medicationId,
      { 
        status,
        notificationSent: true
      },
      { new: true }
    );
  }

  async getMedicationStatus(medicationId) {
    const medication = await Medication.findById(medicationId);
    const now = new Date();
    
    if (medication.scheduledDate < now && !medication.notificationSent) {
      await this.updateMedicationStatus(medicationId, 'missed');
    }
    
    return medication;
  }
}

module.exports = new MedicationService();
