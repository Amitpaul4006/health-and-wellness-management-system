import React, { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography, Paper } from '@mui/material';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function LandingPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={5}
        sx={{
          mt: 8,
          mb: 4,
          p: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h2" 
            align="center" 
            gutterBottom
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 3
            }}
          >
            Health & Wellness System
          </Typography>
          <Typography 
            variant="h5" 
            align="center" 
            color="text.secondary"
            sx={{
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400
            }}
          >
            Your comprehensive platform for managing medications and tracking your wellness journey with confidence
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            mt: 4
          }}
        >
          <Paper 
            elevation={2} 
            sx={{ 
              width: '60%',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                centered
                sx={{
                  width: '70%', // Make tabs container smaller
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  '& .MuiTab-root': {
                    minWidth: '100px', // Reduce minimum width of tabs
                    px: 2, // Reduce padding
                  }
                }}
              >
                <Tab 
                  label="Login" 
                  sx={{ 
                    py: 1.5,
                    fontSize: '0.9rem' // Slightly smaller font
                  }} 
                />
                <Tab 
                  label="Register" 
                  sx={{ 
                    py: 1.5,
                    fontSize: '0.9rem' // Slightly smaller font
                  }} 
                />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <LoginForm />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <RegisterForm />
            </TabPanel>
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
}

export default LandingPage;
