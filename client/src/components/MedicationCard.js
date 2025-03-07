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
import { makeStyles } from '@material-ui/core/styles';
import { LocalHospital, CalendarToday, Schedule, MoreVert } from '@material-ui/icons';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[3],
    '&:hover': {
      boxShadow: theme.shadows[6],
      transform: 'scale(1.01)',
      transition: 'all 0.2s'
    }
  },
  // ...add other styles...
}));

function MedicationCard({ medication, onUpdate }) {
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
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/medications/${medication._id}/status`,
        { status: newStatus },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await onUpdate();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };

  return (
    <>
      <Card className={classes.card}>
        <CardContent>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <LocalHospital style={{ color: '#1976d2', marginRight: 8 }} />
              <Typography variant="h6" component="div">
                {medication.name}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVert />
            </IconButton>
          </Box>
          
          <Typography color="text.secondary" style={{ marginBottom: 24 }}>
            {medication.description}
          </Typography>

          <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
              style={{ fontWeight: 'bold' }}
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
