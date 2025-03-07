import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function ErrorDialog({ open, message, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#ffebee' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <ErrorOutlineIcon color="error" />
          <Typography variant="h6">Error</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ErrorDialog;
