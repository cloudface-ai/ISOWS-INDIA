# ISOWS-INDIA Work Licensing & Plagiarism Detection App

A comprehensive platform for creative work licensing, plagiarism detection, and intellectual property protection. Built with React, Node.js, and Firebase.

## 🌟 Features

### Phase 1: MVP (Completed ✅)
- **User Authentication** - Firebase Google Sign-in
- **Work Submission** - Text and file upload support
- **Basic Plagiarism Detection** - Advanced n-gram analysis
- **Work Display** - User dashboard with all submitted works
- **License Generation** - Professional PDF certificates

### Phase 2: Advanced Functionality (Completed ✅)
- **Advanced Plagiarism Detection** - N-gram overlap and TF-IDF similarity
- **Watermarked PDF Generation** - Professional certificates with stamps
- **User Profiles** - Complete user management
- **License Verification** - Public verification system
- **Work Editing** - Edit works with diff preview
- **My Licenses Page** - Advanced filtering and management

### Phase 3: Scaling & Enhancements (Completed ✅)
- **Email Notifications** - Plagiarism alerts and license confirmations
- **File Format Support** - .txt and .docx file uploads
- **User Analytics Dashboard** - Performance tracking and insights
- **Public API** - Third-party integration support
- **Cloud Deployment** - Docker and production-ready configurations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- Firebase project with Authentication enabled
- Gmail account for email notifications

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/ISOWS-INDIA.git
cd ISOWS-INDIA
```

2. **Set up environment variables:**
```bash
# Copy example environment file
cp example.env .env

# Edit .env with your configuration
nano .env
```

3. **Install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **Start development servers:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Docker Deployment

1. **Quick deployment:**
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

2. **Manual Docker Compose:**
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
ISOWS-INDIA/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Authentication middleware
│   │   ├── types/          # TypeScript definitions
│   │   └── index.ts        # Server entry point
│   ├── public/             # Static files (PDFs)
│   ├── data/               # JSON data storage
│   └── Dockerfile          # Backend container config
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript definitions
│   └── Dockerfile          # Frontend container config
├── docker-compose.yml      # Multi-container setup
├── nginx.conf              # Reverse proxy config
├── deploy.sh               # Deployment script
└── DEPLOYMENT.md           # Detailed deployment guide
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# URLs
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📚 API Documentation

### Public API Endpoints

#### Verify License
```http
GET /api/public/verify/:licenseId
```

**Response:**
```json
{
  "success": true,
  "license": {
    "id": "abc123-def456-ghi789",
    "workId": "work-123",
    "issuedAt": "2024-01-15T10:30:00Z",
    "isActive": true,
    "authorName": "John Doe",
    "workType": "poem"
  },
  "work": {
    "id": "work-123",
    "title": "My Creative Work",
    "submittedAt": "2024-01-15T10:00:00Z",
    "isLicensed": true
  },
  "verification": {
    "verified": true,
    "verifiedAt": "2024-01-15T10:35:00Z",
    "verifiedBy": "ISOWS-INDIA API v1.0"
  }
}
```

#### Health Check
```http
GET /api/public/health
```

**Response:**
```json
{
  "status": "OK",
  "service": "ISOWS-INDIA Public API",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

### Rate Limits
- **License Verification:** 100 requests/hour per IP
- **Health Check:** 1000 requests/hour per IP

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run health       # Check health status
```

#### Frontend
```bash
npm start            # Start development server
npm run build        # Build for production
npm run build:prod   # Build and analyze bundle
npm run serve        # Serve production build
```

### Code Structure

#### Backend Services
- **workService** - Work submission and management
- **licenseService** - License generation and verification
- **plagiarismService** - Plagiarism detection algorithms
- **emailService** - Email notifications
- **fileService** - File upload and processing

#### Frontend Components
- **AuthContext** - Authentication state management
- **SubmitWork** - Work submission with file upload
- **MyWorks** - Work management with editing
- **Analytics** - User performance dashboard
- **LicenseVerification** - Public license lookup

## 🚀 Deployment

### Cloud Platforms Supported
- **AWS** - ECS, Elastic Beanstalk, Lambda
- **Google Cloud** - Cloud Run, App Engine
- **DigitalOcean** - App Platform, Droplets
- **Railway** - One-click deployment
- **Docker** - Any container platform

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrated from JSON files
- [ ] Monitoring and logging set up
- [ ] Rate limiting configured
- [ ] Backup strategy implemented

## 🔒 Security Features

- **Authentication** - Firebase Auth with Google Sign-in
- **Authorization** - JWT token-based API access
- **Rate Limiting** - API endpoint protection
- **Input Validation** - Comprehensive data validation
- **File Security** - Safe file upload handling
- **CORS** - Cross-origin request protection

## 📊 Monitoring

### Health Checks
- Backend: `GET /api/health`
- Public API: `GET /api/public/health`
- Frontend: `GET /health`

### Logs
```bash
# Docker Compose logs
docker-compose logs -f

# Individual service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** [API Docs](http://localhost:3000/api-docs)
- **Issues:** [GitHub Issues](https://github.com/your-username/ISOWS-INDIA/issues)
- **Email:** support@isows-india.com

## 🎯 Roadmap

### Future Enhancements
- [ ] Advanced plagiarism detection with AI
- [ ] Blockchain-based license verification
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Integration with publishing platforms

---

**ISOWS-INDIA** - Protecting Creative Works, One License at a Time 🎨✨