import React, { useState } from 'react';
import { TextField, Button, Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

function LoginForm() {
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 3,
            mb: 2,
            width: '60%', // Reduced from 100% or auto
            py: 1,
            fontSize: '0.9rem'
          }}
        >
          Sign In
        </Button>
      </Box>
    </Box>
  );
}

export default LoginForm;
