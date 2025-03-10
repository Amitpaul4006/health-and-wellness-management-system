import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  AppBar,
  Toolbar,
  Paper,
  IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExitToApp, Add, LocalHospital } from '@material-ui/icons';
import MedicationCard from '../components/MedicationCard';
import axios from 'axios';
import jwt_decode from 'jwt-decode'; // Add this import
import ErrorDialog from '../components/ErrorDialog';
import ReportButton from '../components/ReportButton';
import { medicationService, authService } from '../services/api';

const useStyles = makeStyles((theme) => ({
  styledPaper: {
    padding: theme.spacing(3),
    margin: theme.spacing(2, 0),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: theme.shadows[3],
  },
  root: {
    minHeight: '100vh',
    backgroundColor: '#f0f7ff',
    backgroundImage: 'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
  },
  appBar: {
    backgroundColor: '#2196f3'
  },
  addButton: {
    marginTop: theme.spacing(2),
    backgroundColor: '#2e7d32',
    '&:hover': {
      backgroundColor: '#1b5e20'
    }
  }
}));

const Dashboard = () => {
  const classes = useStyles();
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

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      window.location = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await medicationService.getAll();
      setMedications(response.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
      setError('Failed to load medications');
    }
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
    <Box className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <LocalHospital style={{ marginRight: 16 }} />
          <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
            Health & Wellness Manager
          </Typography>
          <IconButton color="inherit" onClick={() => handleLogout(false)}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" style={{ marginTop: 32, marginBottom: 32 }}>
        <Paper className={classes.styledPaper}>
          <Typography variant="h5" gutterBottom style={{ color: '#1976d2' }}>
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
                  startIcon={<Add />}
                  className={classes.addButton}
                >
                  Add Medication
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Paper className={classes.styledPaper}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom style={{ color: '#1976d2' }}>
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
        </Paper>
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