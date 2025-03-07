import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5'
  },
  paper: {
    padding: theme.spacing(4),
    textAlign: 'center'
  },
  progress: {
    marginBottom: theme.spacing(2)
  },
  successText: {
    color: theme.palette.success.main
  },
  errorText: {
    color: theme.palette.error.main
  }
}));

const MarkDone = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const classes = useStyles();

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
    <Box className={classes.root}>
      <Paper className={classes.paper}>
        {status === 'processing' && <CircularProgress className={classes.progress} />}
        <Typography 
          variant="h6" 
          className={
            status === 'success' ? classes.successText : 
            status === 'error' ? classes.errorText : 
            undefined
          }
        >
          {getStatusMessage()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MarkDone;
