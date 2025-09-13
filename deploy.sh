#!/bin/bash

# ISOWS-INDIA Deployment Script
# This script automates the deployment process

set -e

echo "🚀 ISOWS-INDIA Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from example.env..."
    if [ -f "example.env" ]; then
        cp example.env .env
        print_warning "Please edit .env file with your actual configuration before continuing."
        print_warning "Press Enter when you're ready to continue..."
        read
    else
        print_error "example.env file not found. Please create .env file manually."
        exit 1
    fi
fi

# Function to deploy with Docker Compose
deploy_docker_compose() {
    echo ""
    echo "🐳 Deploying with Docker Compose..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down 2>/dev/null || true
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Services are running successfully!"
        echo ""
        echo "🌐 Application URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:3001/api/health"
        echo "  Public API: http://localhost:3001/api/public/health"
        echo ""
        echo "📊 View logs with: docker-compose logs -f"
        echo "🛑 Stop with: docker-compose down"
    else
        print_error "Failed to start services. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Function to deploy to production
deploy_production() {
    echo ""
    echo "☁️  Production Deployment Options:"
    echo "1. AWS ECS"
    echo "2. Google Cloud Run"
    echo "3. DigitalOcean App Platform"
    echo "4. Railway"
    echo "5. Manual Docker deployment"
    
    read -p "Select deployment option (1-5): " choice
    
    case $choice in
        1)
            print_status "AWS ECS deployment selected"
            echo "Please follow the AWS deployment guide in DEPLOYMENT.md"
            ;;
        2)
            print_status "Google Cloud Run deployment selected"
            echo "Please follow the GCP deployment guide in DEPLOYMENT.md"
            ;;
        3)
            print_status "DigitalOcean deployment selected"
            echo "Please follow the DigitalOcean deployment guide in DEPLOYMENT.md"
            ;;
        4)
            print_status "Railway deployment selected"
            echo "Please follow the Railway deployment guide in DEPLOYMENT.md"
            ;;
        5)
            print_status "Manual Docker deployment selected"
            deploy_docker_compose
            ;;
        *)
            print_error "Invalid option selected"
            exit 1
            ;;
    esac
}

# Main menu
echo ""
echo "Select deployment type:"
echo "1. Local development (Docker Compose)"
echo "2. Production deployment"
echo "3. Check deployment status"
echo "4. View logs"
echo "5. Stop services"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_docker_compose
        ;;
    2)
        deploy_production
        ;;
    3)
        echo ""
        echo "📊 Deployment Status:"
        docker-compose ps
        ;;
    4)
        echo ""
        echo "📋 Recent logs:"
        docker-compose logs --tail=50
        echo ""
        echo "📋 Follow logs with: docker-compose logs -f"
        ;;
    5)
        echo ""
        print_status "Stopping services..."
        docker-compose down
        print_status "Services stopped"
        ;;
    *)
        print_error "Invalid option selected"
        exit 1
        ;;
esac

echo ""
print_status "Deployment script completed!"
