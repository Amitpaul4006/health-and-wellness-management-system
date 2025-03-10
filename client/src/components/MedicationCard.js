import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Chip
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { LocalHospital, CalendarToday, Schedule, MoreVert } from '@material-ui/icons';
import { medicationService } from '../services/api';
import { useStyles } from '../styles/MedicationCard.styles';

const MedicationCard = ({ medication, onUpdate }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await medicationService.updateStatus(medication._id, newStatus);
      await onUpdate();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  return (
    <>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Box className={classes.header}>
            <Box className={classes.title}>
              <LocalHospital className={classes.icon} style={{ color: '#1976d2' }} />
              <Typography variant="h6" component="div">
                {medication.name}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuOpen} size="small" className={classes.menuButton}>
              <MoreVert />
            </IconButton>
          </Box>
          
          <Typography className={classes.description}>
            {medication.description}
          </Typography>

          <Box className={classes.chipContainer}>
            <Chip
              icon={<CalendarToday />}
              label={medication.type === 'recurring' ? 'Recurring' : 'One-time'}
              color={medication.type === 'recurring' ? 'primary' : 'secondary'}
              size="small"
            />
            {medication.time && (
              <Chip
                icon={<Schedule />}
                label={medication.time}
                color="info"
                size="small"
              />
            )}
            <Chip
              label={medication.status === 'done' ? 'Completed' : 'Pending'}
              color={medication.status === 'done' ? 'success' : 'warning'}
              size="small"
              className={classes.statusChip}
            />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem 
              onClick={() => handleStatusUpdate('pending')}
              disabled={loading}
            >
              Mark as Pending
            </MenuItem>
            <MenuItem 
              onClick={() => handleStatusUpdate('done')}
              disabled={loading}
            >
              Mark as Done
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default MedicationCard;
