import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { medicationService } from '../services/api';

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

const MarkDone = ({ medicationId, onUpdate }) => {
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

        await medicationService.updateStatus(medicationId || id, 'done');
        
        if (onUpdate) {
          onUpdate();
        }

        setStatus('success');
        setTimeout(() => {
          if (medicationId) {
            onUpdate?.();
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } catch (error) {
        console.error('Error updating status:', error);
        setStatus('error');
        setTimeout(() => {
          if (medicationId) {
            onUpdate?.();
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      }
    };

    if (medicationId || id) {
      updateStatus();
    }
  }, [id, navigate, medicationId, onUpdate]);

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

  if (!medicationId && !id) {
    return <Typography color="error">No medication ID provided</Typography>;
  }

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
