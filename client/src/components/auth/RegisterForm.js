import React, { useState } from 'react';
import { TextField, Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  form: {
    marginTop: theme.spacing(1)
  },
  alert: {
    marginBottom: theme.spacing(2)
  },
  button: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    width: '60%',
    padding: theme.spacing(1),
    fontSize: '0.9rem'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center'
  }
}));

function RegisterForm() {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate className={classes.form}>
      {error && <Alert severity="error" className={classes.alert}>{error}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        label="Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Full Name (Optional)"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Box className={classes.buttonContainer}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.button}
        >
          Register
        </Button>
      </Box>
    </Box>
  );
}

export default RegisterForm;
