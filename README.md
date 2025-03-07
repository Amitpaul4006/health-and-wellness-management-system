# Health and Wellness Management System

A comprehensive full-stack application for managing medications and health-related reminders with automated email notifications.

[![Node.js](https://img.shields.io/badge/Node.js-v20.18.3-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.0-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

- **User Authentication**: Secure login and registration system
- **Medication Management**: Add and track medications
- **Smart Scheduling**: 
  - One-time medication reminders
  - Recurring medication schedules (daily/weekly)
- **Email Notifications**: Automated reminders for medication doses
- **Weekly Reports**: Generate and email medication compliance reports
- **Status Tracking**: Mark medications as taken or missed

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Redis for job queuing
- BullMQ for background jobs
- Node-schedule for recurring tasks
- Nodemailer for email services
- JWT for authentication

### Frontend
- React.js
- Material-UI
- Axios for API calls
- React Router for navigation

## 📝 Prerequisites

- Node.js (v20.18.3)
- MongoDB
- Redis Server
- Gmail Account (for email notifications)

## ⚙️ Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/health-wellness-system.git
cd health-wellness-system
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Configure environment variables:
```env
# Server .env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail
EMAIL_APP_PASSWORD=your_app_specific_password
REDIS_HOST=localhost
REDIS_PORT=6379
EMAIL_FROM=your_email
FRONTEND_URL=http://localhost:3000
```

4. Start the application:
```bash
# Start backend (from /server directory)
npm start

# Start frontend (from /client directory)
npm start
```

## 🔍 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Medications
- `GET /api/medications` - Get all medications
- `POST /api/medications/add` - Add new medication
- `PATCH /api/medications/:id/status` - Update medication status

### Reports
- `POST /api/reports/generate` - Generate weekly report

## 🧪 Testing

Run the test suite:
```bash
cd server
npm test
```

## 🚀 Future Enhancements

- [ ] Mobile application support
- [ ] SMS notifications
- [ ] Multiple timezone support
- [ ] Medication inventory tracking
- [ ] Doctor appointment scheduling
- [ ] Health metrics tracking

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Material-UI](https://mui.com/) for UI components
- [Nodemailer](https://nodemailer.com/) for email handling
- [BullMQ](https://docs.bullmq.io/) for job queuing
- [Node-schedule](https://github.com/node-schedule/node-schedule) for task scheduling

## 📞 Contact

Amit Paul - [@YourTwitter](https://twitter.com/YourTwitter)  
Email: amitpaul4006@gmail.com

Project Link: [https://github.com/your-username/health-wellness-system](https://github.com/your-username/health-wellness-system)

## 🖼️ Screenshots

<details>
<summary>Dashboard</summary>
<img src="screenshots/dashboard.png" alt="Dashboard">
</details>

<details>
<summary>Add Medication</summary>
<img src="screenshots/add-medication.png" alt="Add Medication">
</details>
