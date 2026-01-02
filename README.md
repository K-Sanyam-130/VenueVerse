# VenueVerse - Venue Management System

A comprehensive venue and event management system for colleges, built with React (Vite) frontend and Node.js/Express backend.

## Features

- **Student Portal**: Browse and register for events
- **Club Officials**: Event creation, management, and booking
- **Admin Dashboard**: Approve events, manage users, handle venue changes
- **Real-time Event Categorization**: Automatic LIVE/UPCOMING/PAST status
- **Email Notifications**: OTP verification, approvals, and confirmations
- **User Management**: Club official approval workflow

## Tech Stack

### Frontend
- React 18 + Vite
- Framer Motion animations
- Lucide React icons
- Axios for API calls

### Backend
- Node.js + Express
- MongoDB (Atlas)
- JWT authentication
- Nodemailer for emails
- Cron jobs for event scheduling

## Live Demo

- **Frontend**: [Your Vercel URL]
- **Backend API**: [Your Render URL]

## Local Development

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Gmail account for SMTP

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories.

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## License

MIT License

## Author

VenueVerse Team
