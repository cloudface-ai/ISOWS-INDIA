# ISOWS-INDIA Deployment Guide

This guide covers deploying the ISOWS-INDIA Work Licensing & Plagiarism Detection App to various cloud platforms.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (for production)
- Environment variables configured

## Quick Start with Docker Compose

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend Configuration
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# URLs
FRONTEND_URL=https://your-domain.com
```

### 2. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Verify Deployment

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/health
- Public API: http://localhost:3001/api/public/health

## Cloud Platform Deployments

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Create ECR repositories:**
```bash
aws ecr create-repository --repository-name isows-india/frontend
aws ecr create-repository --repository-name isows-india/backend
```

2. **Build and push images:**
```bash
# Build and tag images
docker build -t isows-india/frontend ./frontend
docker build -t isows-india/backend ./backend

# Tag for ECR
docker tag isows-india/frontend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/isows-india/frontend:latest
docker tag isows-india/backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/isows-india/backend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/isows-india/frontend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/isows-india/backend:latest
```

3. **Create ECS task definitions and services**
4. **Set up Application Load Balancer**
5. **Configure Route 53 for domain**

#### Using AWS Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize EB application:**
```bash
eb init
eb create production
```

3. **Deploy:**
```bash
eb deploy
```

### Google Cloud Platform

#### Using Cloud Run

1. **Enable APIs:**
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

2. **Deploy backend:**
```bash
cd backend
gcloud run deploy isows-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. **Deploy frontend:**
```bash
cd frontend
gcloud run deploy isows-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### DigitalOcean

#### Using App Platform

1. **Create app.yaml:**
```yaml
name: isows-india
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/isows-india
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "3001"

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/isows-india
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: REACT_APP_API_URL
    value: ${backend.PUBLIC_URL}/api
```

2. **Deploy:**
```bash
doctl apps create --spec app.yaml
```

### Railway

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and deploy:**
```bash
railway login
railway init
railway up
```

## Production Considerations

### Security

1. **Environment Variables:**
   - Never commit `.env` files
   - Use secret management services
   - Rotate keys regularly

2. **HTTPS:**
   - Always use HTTPS in production
   - Configure proper SSL certificates
   - Use HSTS headers

3. **Rate Limiting:**
   - Implement API rate limiting
   - Use CDN for static assets
   - Monitor for abuse

### Performance

1. **Caching:**
   - Enable Redis for session storage
   - Use CDN for static assets
   - Implement API response caching

2. **Database:**
   - Migrate from JSON files to PostgreSQL/MongoDB
   - Implement database indexing
   - Set up read replicas

3. **Monitoring:**
   - Set up application monitoring (DataDog, New Relic)
   - Configure log aggregation
   - Implement health checks

### Scaling

1. **Horizontal Scaling:**
   - Use load balancers
   - Implement auto-scaling
   - Database connection pooling

2. **Microservices:**
   - Split into smaller services
   - Use message queues
   - Implement circuit breakers

## Monitoring and Maintenance

### Health Checks

- Backend: `GET /api/health`
- Public API: `GET /api/public/health`
- Frontend: `GET /health`

### Logs

```bash
# Docker Compose logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Individual container logs
docker logs -f container_name
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Zero-downtime deployment
docker-compose up -d --no-deps backend
docker-compose up -d --no-deps frontend
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Change ports in docker-compose.yml
   - Check if ports are already in use

2. **Environment variables:**
   - Verify all required variables are set
   - Check variable formatting

3. **Firebase configuration:**
   - Ensure service account key is properly formatted
   - Verify project ID and permissions

4. **Email configuration:**
   - Check Gmail app password
   - Verify SMTP settings

### Debug Mode

```bash
# Run in debug mode
NODE_ENV=development docker-compose up

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Support

For deployment issues:
- Check logs: `docker-compose logs`
- Verify environment variables
- Test individual services
- Contact support: support@isows-india.com
