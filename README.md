# Houses Adda - Property Management System

A modern property listing and management platform built with React, Firebase, and Express.js.

## Features

- 🏠 Property browsing and search
- 🔍 Advanced filtering (type, location, price, etc.)
- 📱 Responsive design for mobile and desktop
- 🔐 Admin panel for property management
- 🗄️ Firebase Firestore database
- 🚀 Deployed on Vercel

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: Firebase Firestore
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel (Frontend + API)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Firebase service account key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in root directory:
   ```env
   # Server
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-secret-key-change-in-production

   # API
   VITE_API_URL=http://localhost:3001/api

   # Firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   
   # Frontend Firebase Config
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Start development servers:
   ```bash
   # Start both frontend and backend
   npm run dev:all

   # Or separately:
   npm run dev          # Frontend only (port 8080)
   npm run dev:server   # Backend only (port 3001)
   ```

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these in production!**

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login (username/password)
- `GET /api/auth/verify` - Verify token

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (protected)
- `PUT /api/properties/:id` - Update property (protected)
- `DELETE /api/properties/:id` - Delete property (protected)
- `PATCH /api/properties/:id/featured` - Toggle featured (protected)
- `PATCH /api/properties/:id/active` - Toggle active (protected)

### Locations
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Create location (protected)
- `PUT /api/locations/:id` - Update location (protected)
- `DELETE /api/locations/:id` - Delete location (protected)

### Property Types
- `GET /api/types` - Get all property types
- `POST /api/types` - Create type (protected)
- `PUT /api/types/:id` - Update type (protected)
- `DELETE /api/types/:id` - Delete type (protected)

### Settings
- `GET /api/settings/social-media` - Get social media settings

### Health & Info
- `GET /api/health` - Health check
- `GET /api/routes` - List all routes
- `GET /api/test` - Test endpoint

## Database Collections

- `admin_users` - Admin user accounts
- `properties` - Property listings
- `property_types` - Property type definitions
- `locations` - Location/area data
- `property_images` - Property images (base64)
- `settings` - Application settings

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The API will be available at `/api/*` routes automatically.

## Project Structure

```
├── api/              # Vercel serverless functions
├── server/           # Backend Express server
│   ├── routes/      # API route handlers
│   ├── middleware/ # Auth middleware
│   └── utils/       # Utility functions
├── src/             # Frontend React app
│   ├── components/  # React components
│   ├── pages/       # Page components
│   └── lib/         # Utilities & API client
├── public/          # Static assets
└── dist/           # Build output
```

## Development

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3001`
- Admin Panel: `http://localhost:8080/admin`

## License

Private project - All rights reserved
