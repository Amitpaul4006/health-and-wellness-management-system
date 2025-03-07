import React, { useState } from 'react';
import { Box, Container, Tabs, Tab, Typography, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  paper: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.95)'
  },
  title: {
    fontWeight: 600,
    marginBottom: theme.spacing(3),
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
    fontWeight: 400,
    color: theme.palette.text.secondary
  },
  tabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginTop: theme.spacing(4)
  },
  tabsPaper: {
    width: '60%',
    borderRadius: theme.spacing(2),
    overflow: 'hidden'
  },
  tabs: {
    width: '70%',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper
  },
  tab: {
    minWidth: '100px',
    padding: theme.spacing(1.5, 2),
    fontSize: '0.9rem'
  },
  tabPanel: {
    padding: theme.spacing(3)
  }
}));

function TabPanel({ children, value, index }) {
  const classes = useStyles();
  return (
    <div 
      role="tabpanel"
      hidden={value !== index}
      className={classes.tabPanel}
    >
      {value === index && children}
    </div>
  );
}

function LandingPage() {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md" className={classes.root}>
      <Paper className={classes.paper} elevation={5}>
        <Box mb={6}>
          <Typography variant="h2" align="center" className={classes.title}>
            Health & Wellness System
          </Typography>
          <Typography variant="h5" align="center" className={classes.subtitle}>
            Your comprehensive platform for managing medications and tracking your wellness journey with confidence
          </Typography>
        </Box>
        
        <Box className={classes.tabsContainer}>
          <Paper className={classes.tabsPaper} elevation={2}>
            <Box className={classes.tabsContainer}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                centered
                className={classes.tabs}
              >
                <Tab label="Login" className={classes.tab} />
                <Tab label="Register" className={classes.tab} />
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
