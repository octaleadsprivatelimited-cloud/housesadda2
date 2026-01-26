# HousesAdda

A modern property listing platform for finding properties in India.

## Project Overview

HousesAdda is a React-based web application built with Vite, TypeScript, and Tailwind CSS. It provides a platform for users to browse and search for properties including Buy, Rent, New Projects, Plots, and Commercial spaces.

## Technologies Used

This project is built with:

- **Frontend:**
  - Vite
  - TypeScript
  - React
  - shadcn-ui
  - Tailwind CSS
  - React Router

- **Backend:**
  - Node.js
  - Express
  - Firebase Firestore (NoSQL cloud database)
  - JWT Authentication
  - bcryptjs

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Firebase account - [Sign up at firebase.google.com](https://firebase.google.com) (free tier available)

### Installation

1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd housesadda
```

2. **Install dependencies**
```sh
npm install
```

3. **Database Setup (Firebase - Required)**

   This project uses Firebase Firestore as the database. Admin users are automatically created on first run.
   
   **Setup Steps:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database in your Firebase project
   - Go to Project Settings > Service Accounts
   - Generate a new private key (downloads JSON file)
   - Configure `.env` with your Firebase credentials (see .env.example for options)

4. **Configure Environment Variables**

   Create a `.env` file in the root directory (copy from `.env.example`):
   ```env
   NODE_ENV=development
   JWT_SECRET=your-secret-key-change-in-production
   PORT=3001
   VITE_API_URL=http://localhost:3001/api
   
   # Firebase Configuration (Backend)
   # Option 1: Use service account JSON file path
   FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccountKey.json
   
   # Option 2: Use individual credentials
   # FIREBASE_PROJECT_ID=your-project-id
   # FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   # FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```

5. **Start the development servers**

   - Start both frontend and backend:
   ```sh
   npm run dev:all
   ```

   - Or start them separately:
   ```sh
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend (Firebase)
   npm run dev:server
   ```

### Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change the default admin password after first login in production!

## Available Scripts

- `npm run dev` - Start the frontend development server
- `npm run dev:server` - Start the backend API server (Supabase)
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

**Note:** Admin users are created automatically on first server start. No manual setup needed.

## Project Structure

```
housesadda/
├── server/              # Backend API
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── index.js        # Server entry point
├── database/           # Database files
│   ├── schema.sql      # Database schema
│   └── seed.sql        # Seed data
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities & API client
│   └── ...
└── public/             # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token

### Properties
- `GET /api/properties` - Get all properties
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

## Features

- Property browsing and search
- Filter by type (Buy, Rent, New Projects, Plots, Commercial)
- Browse by city and locality
- Property details page
- Admin dashboard for property management
- MySQL database integration
- JWT-based authentication
- Responsive design for mobile and desktop

## Database Schema

The database (Firebase Firestore) includes the following collections:
- `admin_users` - Admin user accounts (created automatically on first run)
- `properties` - Property listings (with transaction_type: Sale, Rent, Lease, PG)
- `property_types` - Property type definitions
- `locations` - Location/area data
- `property_images` - Property image URLs

**Firebase Firestore:**
- Cloud-hosted NoSQL database
- Free tier available
- Collections are created automatically when data is inserted
- Admin users are created automatically when you start the server

## Production Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

Quick steps:
1. Build the frontend:
   ```sh
   npm run build
   ```

2. Set up environment variables on your production server

3. Configure your web server (nginx, Apache) to serve the frontend

4. Run the backend server using PM2:
   ```sh
   pm2 start ecosystem.config.js
   ```

5. For Firebase: Ensure environment variables are set correctly in your deployment platform

## Security Notes

- Change the default JWT_SECRET in production
- Use strong passwords for admin accounts
- Implement rate limiting for API endpoints
- Use HTTPS in production
- Regularly update dependencies

## License

Private - All rights reserved
