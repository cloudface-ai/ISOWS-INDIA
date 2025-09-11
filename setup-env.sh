#!/bin/bash

# Setup script for environment variables
echo "Setting up environment variables..."

# Create .env file for backend
cat > .env << EOF
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyAJEiXsOlZ4WzJ81BWPb6G2bO2yAjseW38
FIREBASE_AUTH_DOMAIN=isows-india.firebaseapp.com
FIREBASE_PROJECT_ID=isows-india
FIREBASE_STORAGE_BUCKET=isows-india.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=422810186635
FIREBASE_APP_ID=1:422810186635:web:8b70079e278a892d24358e
FIREBASE_MEASUREMENT_ID=G-0VJ3XBWD1D

# Backend Configuration
PORT=3001
NODE_ENV=development

# Database (if using one)
DATABASE_URL=your_database_url_here

# Plagiarism Detection API (for future phases)
PLAGIARISM_API_KEY=your_plagiarism_api_key_here
EOF

# Create .env.local file for frontend
cat > frontend/.env.local << EOF
REACT_APP_FIREBASE_API_KEY=AIzaSyAJEiXsOlZ4WzJ81BWPb6G2bO2yAjseW38
REACT_APP_FIREBASE_AUTH_DOMAIN=isows-india.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=isows-india
REACT_APP_FIREBASE_STORAGE_BUCKET=isows-india.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=422810186635
REACT_APP_FIREBASE_APP_ID=1:422810186635:web:8b70079e278a892d24358e
REACT_APP_FIREBASE_MEASUREMENT_ID=G-0VJ3XBWD1D
REACT_APP_API_URL=http://localhost:3001/api
EOF

echo "Environment files created successfully!"
echo "You can now run:"
echo "  cd backend && npm run dev"
echo "  cd frontend && npm start"
