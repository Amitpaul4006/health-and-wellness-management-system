const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['one-time', 'recurring'],
    required: true
  },
  description: String,
  scheduledDate: {
    type: Date,
    required: function() {
      return this.type === 'one-time' && this.isNew; // Only required for new one-time medications
    }
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    time: String,
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      required: function() {
        return this.type === 'recurring';
      }
    },
    weekDay: {
      type: String,
      enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      required: function() {
        return this.type === 'recurring' && this.schedule?.frequency === 'weekly';
      },
      uppercase: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending'
  },
  userId: {  // Make sure this matches what you're querying with
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notificationJobId: String
}, { timestamps: true });

// Remove or modify the pre-save middleware to avoid validation issues during status updates
medicationSchema.pre('save', function(next) {
  if (this.isNew && this.type === 'one-time') {
    if (!this.scheduledDate) {
      next(new Error('scheduledDate is required for new one-time medications'));
      return;
    }
    this.schedule = [{
      date: this.scheduledDate,
      completed: false
    }];
  }
  if (this.type === 'recurring' && this.schedule.frequency === 'weekly') {
    if (!this.schedule.weekDay) {
      next(new Error('Weekly recurring medications must specify a weekDay'));
      return;
    }
  }
  next();
});

module.exports = mongoose.model('Medication', medicationSchema);
