import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { reportService } from '../services/api';
import { useStyles } from '../styles/ReportButton.styles';

const ReportButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const classes = useStyles({ loading });

  const onClick = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reportService.generate();
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setSuccess('Report generated and sent to your email');
    } catch (error) {
      console.error('Report generation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={onClick}
        disabled={loading}
        className={classes.progressButton}
      >
        <span className={classes.buttonText}>Generate Weekly Report</span>
        {loading && (
          <CircularProgress 
            size={24} 
            className={classes.progressIndicator}
          />
        )}
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
