import React, { useState } from 'react';
import { medicationService } from '../services/api';
import { TextField, Grid } from '@material-ui/core';

const ReminderForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    medication: '',
    scheduledTime: '',
    frequency: 'daily'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicationService.add({
        ...formData,
        type: 'reminder'
      });
      onSuccess?.();
      setFormData({ medication: '', scheduledTime: '', frequency: 'daily' });
    } catch (error) {
      console.error('Failed to set reminder:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Medication"
            value={formData.medication}
            onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
          />
        </Grid>
        {/* ...rest of form fields... */}
      </Grid>
    </form>
  );
};

export default ReminderForm;
