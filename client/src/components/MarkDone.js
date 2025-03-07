import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const MarkDone = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        await axios.patch(
          `http://localhost:5000/api/medications/${id}/status`,
          { status: 'done' },
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        setStatus('error');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    updateStatus();
  }, [id, navigate]);

  const getStatusMessage = () => {
    switch(status) {
      case 'processing':
        return 'Updating medication status...';
      case 'success':
        return 'Medication marked as done! Redirecting...';
      case 'error':
        return 'Failed to update status. Redirecting...';
      default:
        return 'Processing...';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {status === 'processing' && <CircularProgress sx={{ mb: 2 }} />}
        <Typography variant="h6" color={
          status === 'success' ? 'success.main' : 
          status === 'error' ? 'error.main' : 
          'text.primary'
        }>
          {getStatusMessage()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MarkDone;
