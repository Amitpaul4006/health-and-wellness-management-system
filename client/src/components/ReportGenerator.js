import React, { useState } from 'react';
import { reportService } from '../services/api';
import { Button, CircularProgress, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const ReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      await reportService.generate();
      setMessage({ type: 'success', text: 'Report generated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate report' });
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
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Report'}
      </Button>
      {message && (
        <Snackbar 
          open={!!message} 
          autoHideDuration={6000} 
          onClose={() => setMessage(null)}
        >
          <Alert severity={message.type}>{message.text}</Alert>
        </Snackbar>
      )}
    </>
  );
};

export default ReportGenerator;
