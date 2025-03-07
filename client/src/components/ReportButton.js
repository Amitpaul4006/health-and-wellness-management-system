import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const ReportButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log("token", token);
      if (!token) throw new Error('No authentication token found');

      console.log("calling axios post");
      await axios.post('http://localhost:5000/api/reports/generate', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("axios post done");

      setSuccess('Report generation initiated. You will receive an email shortly.');
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.error || 'Failed to initiate report generation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateReport}
        disabled={loading}
        sx={{ 
          mt: 2, 
          width: '30%',  
          mb: 2 // Add some space below the button
        }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Weekly Report'}
      </Button>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReportButton;
