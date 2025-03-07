import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, TextField, Button, Select,
  MenuItem, FormControl, InputLabel, Grid, AppBar, Toolbar,
  Paper, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddIcon from '@mui/icons-material/Add';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationCard from '../components/MedicationCard';
import axios from 'axios';
import jwt_decode from 'jwt-decode'; // Add this import
import ErrorDialog from '../components/ErrorDialog';
import ReportButton from '../components/ReportButton';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: theme.shadows[3],
}));

const Dashboard = () => {
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', type: 'one-time', date: '', time: '', recurrence: '', dayOfWeek: '', startDate: '', endDate: '' });
  const [error, setError] = useState({ show: false, message: '' });

  const daysOfWeek = [
    { value: 'SUNDAY', label: 'Sunday' },
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' }
  ];

  useEffect(() => {
    const fetchMedications = async () => {
      const { data } = await axios.get('http://localhost:5000/api/medications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMedications(data);
    };
    fetchMedications();
  }, []);

  const validateForm = (formData) => {
    if (!formData.name.trim()) {
      throw new Error('Medication name is required');
    }
    if (!formData.type) {
      throw new Error('Medication type is required');
    }
    if (formData.type === 'one-time') {
      if (!formData.date) {
        throw new Error('Date is required for one-time medication');
      }
      if (!formData.time) {
        throw new Error('Time is required for one-time medication');
      }
    }
    if (formData.type === 'recurring') {
      if (!formData.recurrence) {
        throw new Error('Recurrence pattern is required for recurring medication');
      }
      if (!formData.startDate || !formData.endDate) {
        throw new Error('Start and end dates are required for recurring medication');
      }
      if (!formData.time) {
        throw new Error('Time is required for recurring medication');
      }
      if (formData.recurrence === 'weekly' && !formData.dayOfWeek) {
        throw new Error('Day of week is required for weekly medication');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      validateForm(form);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const medicationData = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        date: form.type === 'one-time' ? form.date : form.startDate,
        time: form.time,
        schedule: form.type === 'recurring' ? {
          startDate: form.startDate,
          endDate: form.endDate,
          time: form.time,
          frequency: form.recurrence,
          weekDay: form.recurrence === 'weekly' ? form.dayOfWeek : undefined
        } : undefined
      };

      const response = await axios.post(
        'http://localhost:5000/api/medications/add', 
        medicationData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setForm({ 
          name: '', description: '', type: 'one-time', 
          date: '', time: '', recurrence: '', 
          dayOfWeek: '', startDate: '', endDate: '' 
        });
        await refreshMedications();
      }
    } catch (error) {
      setError({
        show: true,
        message: error.response?.data?.error || error.message || 'Failed to add medication'
      });
    }
  };

  const handleLogout = async (allDevices) => {
    await axios.post('http://localhost:5000/api/auth/logout', { allDevices }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    localStorage.removeItem('token');
    window.location = '/';
  };

  const refreshMedications = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/medications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMedications(data);
    } catch (error) {
      setError({
        show: true,
        message: 'Failed to refresh medications'
      });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f0f7ff',
      backgroundImage: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
    }}>
      <AppBar position="static" sx={{ backgroundColor: '#2196f3' }}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Health & Wellness Manager
          </Typography>
          <IconButton color="inherit" onClick={() => handleLogout(false)}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <StyledPaper>
          <Typography variant="h5" gutterBottom sx={{ color: '#1976d2' }}>
            Add New Medication
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Medicine Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={form.type}
                    label="Type"
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <MenuItem value="one-time">One-Time</MenuItem>
                    <MenuItem value="recurring">Recurring</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  variant="outlined"
                />
              </Grid>

              {form.type === 'one-time' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              {form.type === 'recurring' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Recurrence</InputLabel>
                      <Select
                        value={form.recurrence}
                        label="Recurrence"
                        onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {form.recurrence === 'weekly' && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Day of Week</InputLabel>
                        <Select
                          value={form.dayOfWeek}
                          label="Day of Week"
                          onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                        >
                          {daysOfWeek.map((day) => (
                            <MenuItem key={day.value} value={day.value}>
                              {day.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Start Date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="End Date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 2,
                    backgroundColor: '#2e7d32',
                    '&:hover': { backgroundColor: '#1b5e20' }
                  }}
                >
                  Add Medication
                </Button>
              </Grid>
            </Grid>
          </Box>
        </StyledPaper>

        <StyledPaper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1976d2' }}>
              Your Medications
            </Typography>
            <ReportButton />
          </Box>
          <Grid container spacing={2}>
            {medications.map((med) => (
              <Grid item xs={12} sm={6} md={4} key={med._id}>
                <MedicationCard 
                  medication={med} 
                  onUpdate={refreshMedications}
                />
              </Grid>
            ))}
          </Grid>
        </StyledPaper>
      </Container>
      <ErrorDialog 
        open={error.show}
        message={error.message}
        onClose={() => setError({ show: false, message: '' })}
      />
    </Box>
  );
};

export default Dashboard;