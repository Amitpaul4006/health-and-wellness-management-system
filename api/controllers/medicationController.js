const Medication = require('../models/Medication');
const User = require('../models/User'); // Add this import
const { scheduleNotification, cancelNotification } = require('../services/notificationService');

// Consolidate the controller into a single object
const medicationController = {
  getMedications: async (req, res) => {
    try {
      console.log('Fetching medications for user:', req.userId);
      const medications = await Medication.find({ userId: req.userId });
      res.json(medications);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ message: 'Error fetching medications' });
    }
  },

  addMedication: async (req, res) => {
    try {
      console.log('Received medication data:', req.body);
      const { name, type, description, date, time, schedule } = req.body;

      // Create medication data
      const medicationData = {
        name,
        type,
        description,
        userId: req.userId,
        scheduledDate: new Date(`${date}T${time}`),
        schedule: type === 'recurring' ? schedule : undefined
      };

      console.log('Creating medication with data:', medicationData);
      
      // Create and save medication
      const medication = new Medication(medicationData);
      await medication.save();

      // Schedule notification
      const user = await User.findById(req.userId);
      if (user) {
        await scheduleNotification(medication, user);
      }

      res.status(201).json(medication);
    } catch (error) {
      console.error('Error adding medication:', error);
      res.status(500).json({
        message: 'Error creating medication',
        error: error.message
      });
    }
  },

  getMedicationStatus: async (req, res) => {
    try {
      const medication = await Medication.findOne({
        _id: req.params.id,
        userId: req.userId
      });
      
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      res.json({ status: medication.status });
    } catch (error) {
      console.error('Error getting medication status:', error);
      res.status(500).json({ message: 'Error getting medication status' });
    }
  },

  updateMedicationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const medication = await Medication.findOneAndUpdate(
        { _id: id, userId: req.userId },
        { status },
        { new: true }
      );

      if (!medication) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      // Handle notifications based on status
      if (status === 'done') {
        cancelNotification(id);
      } else if (status === 'pending') {
        const user = await User.findById(req.userId);
        if (user) {
          await scheduleNotification(medication, user);
        }
      }

      res.json(medication);
    } catch (error) {
      console.error('Error updating medication status:', error);
      res.status(500).json({ error: 'Error updating medication status' });
    }
  }
};

module.exports = medicationController;
