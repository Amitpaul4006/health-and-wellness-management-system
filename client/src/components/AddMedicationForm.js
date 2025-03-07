import React, { useState } from 'react';
import { medicationService } from '../services/api';
import '../styles/AddMedicationForm.css';  // Make sure to import the CSS

const AddMedicationForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('one-time');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysOfWeek = [
    { value: 'SUNDAY', label: 'Sunday' },
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' }
  ];

  const [selectedDay, setSelectedDay] = useState('');

  const formatDate = (inputDate) => {
    if (!inputDate) return '';
    try {
      const date = new Date(inputDate);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const formatTime = (inputTime) => {
    if (!inputTime) return '';
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(inputTime) ? inputTime : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formattedDate = formatDate(schedule?.startDate || date);
      const formattedTime = formatTime(schedule?.time || time);

      if (!formattedDate || !formattedTime) {
        setError('Invalid date or time format');
        return;
      }

      const medicationData = {
        name: name.trim(),
        type,
        description: description.trim(),
        date: formattedDate,
        time: formattedTime,
        weekDay: type === 'weekly' ? selectedDay : undefined,
        schedule: type === 'weekly' ? {
          type: 'weekly',
          day: selectedDay,
          time: formattedTime
        } : undefined
      };

      const result = await medicationService.addMedication(medicationData);
      setSuccess('Medication added successfully!');
      resetForm();
    } catch (error) {
      setError(error.message || 'Error adding medication');
      console.error('Error adding medication:', error);
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    if (newType !== 'weekly') {
      setSelectedDay('');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDate('');
    setTime('');
    setType('one-time');
    setSchedule(null);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="medication-form">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {/* ...existing form fields... */}
      
      <div className="form-group">
        <label htmlFor="medicationType">Medication Type:</label>
        <select 
          id="medicationType"
          value={type} 
          onChange={handleTypeChange}
          className="form-control"
          required
        >
          <option value="one-time">One Time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {type === 'weekly' && (
        <div className="form-group week-select">
          <label htmlFor="weekDay">Day of Week:</label>
          <div className="select-wrapper">
            <select 
              id="weekDay"
              value={selectedDay} 
              onChange={(e) => setSelectedDay(e.target.value)}
              className="form-control week-dropdown"
              required
            >
              <option value="">Select a day</option>
              {daysOfWeek.map(day => (
                <option 
                  key={day.value} 
                  value={day.value}
                  className="week-option"
                >
                  {day.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ...rest of the form... */}
    </form>
  );
};

export default AddMedicationForm;
