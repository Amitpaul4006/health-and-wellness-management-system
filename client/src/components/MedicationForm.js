import React, { useState } from 'react';
import { medicationService } from '../services/api';
import { TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

const MedicationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'one-time',
    scheduledDate: '',
    time: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicationService.add(formData);
      onSuccess?.();
      setFormData({ name: '', description: '', type: 'one-time', scheduledDate: '', time: '' });
    } catch (error) {
      console.error('Failed to add medication:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Medication Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Grid>
        {/* ...rest of form fields... */}
      </Grid>
    </form>
  );
};

export default MedicationForm;
