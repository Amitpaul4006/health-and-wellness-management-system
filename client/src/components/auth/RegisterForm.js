import React, { useState } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
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
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
          Register
        </Button>
      </Box>
    </Box>
  );
}

export default RegisterForm;
