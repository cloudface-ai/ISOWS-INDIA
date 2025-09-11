# Work Licensing & Plagiarism Detection App

A comprehensive platform for protecting creative work through plagiarism detection and licensing.

## Phase 1: MVP Features

- **User Authentication**: Google Sign-in via Firebase
- **Work Submission**: Submit and validate creative content
- **Basic Plagiarism Check**: Detect duplicate and suspicious content
- **Work Display**: View all submitted and licensed works
- **License Generation**: Generate unique license IDs for verified works
- **License Verification**: Public tool to verify work authenticity

## Project Structure

```
├── frontend/          # React TypeScript application
├── backend/           # Node.js Express API
├── example.env        # Environment variables template
└── README.md         # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

### 1. Backend Setup

```bash
cd backend
npm install
npm run build
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

### 3. Environment Configuration

1. Copy `example.env` to `.env` in the root directory
2. Set up a Firebase project and add your configuration:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication with Google provider
   - Get your Firebase config values
   - Update the `.env` file with your Firebase credentials

3. For the frontend, create a `.env.local` file in the frontend directory:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Firebase Admin Setup (Backend)

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Save the JSON file as `backend/firebase-service-account.json`
4. Update the backend Firebase initialization if needed

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token

### Work Management
- `POST /api/work/submit` - Submit new work
- `GET /api/work/my-works` - Get user's works
- `GET /api/work/:workId` - Get specific work

### License Management
- `POST /api/license/generate` - Generate license for work
- `GET /api/license/my-licenses` - Get user's licenses
- `GET /api/license/verify/:licenseId` - Verify license (public)

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Starts React development server
```

## Next Steps (Future Phases)

### Phase 2: Advanced Functionality
- Advanced plagiarism detection with third-party APIs
- Watermarked PDF generation
- User profiles and management
- Enhanced license verification

### Phase 3: Scaling & Enhancements
- Email notifications
- Support for multiple file formats
- User analytics dashboard
- Public API for third-party integration

## Technologies Used

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Firebase Authentication
- CSS3 with modern styling

### Backend
- Node.js with Express
- TypeScript
- Firebase Admin SDK
- CORS enabled for cross-origin requests

## License

This project is licensed under the MIT License.
