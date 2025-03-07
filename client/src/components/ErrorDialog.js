import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ErrorOutline } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    backgroundColor: '#ffebee'
  },
  titleContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

function ErrorDialog({ open, message, onClose }) {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className={classes.dialogTitle}>
        <Box className={classes.titleContent}>
          <ErrorOutline color="error" />
          <Typography variant="h6">Error</Typography>
        </Box>
      </DialogTitle>
      <DialogContent className={classes.content}>
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
