import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid } from '@material-ui/core';
import { medicationService } from '../services/api';
import MedicationList from './MedicationList';
import MedicationForm from './MedicationForm';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';

const Dashboard = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await medicationService.getAll();
      setMedications(response.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
      setError('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleAddMedication = async (medicationData) => {
    try {
      await medicationService.add(medicationData);
      fetchMedications(); // Refresh the list
    } catch (err) {
      console.error('Error adding medication:', err);
      setError('Failed to add medication. Please try again.');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await medicationService.updateStatus(id, status);
      fetchMedications(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update medication status. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Medication Dashboard
      </Typography>
      
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <MedicationForm onSubmit={handleAddMedication} />
        </Grid>
        <Grid item xs={12} md={8}>
          <MedicationList 
            medications={medications}
            onStatusUpdate={handleStatusUpdate}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
