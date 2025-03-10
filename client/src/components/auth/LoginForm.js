import React, { useState } from 'react';
import { TextField, Button, Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useStyles } from '../../styles/LoginForm.styles';

function LoginForm() {
  const classes = useStyles();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className={classes.form}>
      {error && (
        <Alert severity="error" className={classes.errorAlert}>
          {error}
        </Alert>
      )}
      <TextField
        className={classes.input}
        margin="normal"
        required
        fullWidth
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <TextField
        className={classes.input}
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <Box className={classes.buttonContainer}>
        <Button
          type="submit"
          variant="contained"
          className={classes.submitButton}
        >
          Sign In
        </Button>
      </Box>
    </Box>
  );
}

export default LoginForm;
