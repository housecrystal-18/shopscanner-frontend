#!/bin/bash

# Shop Scanner Frontend Deployment Script
# This script handles the deployment of the Shop Scanner frontend application

set -e  # Exit on any error

# Configuration
APP_NAME="shopscanner-frontend"
DOCKER_IMAGE="shopscanner/frontend"
DOCKER_TAG=${1:-latest}
ENVIRONMENT=${2:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    log_info "Checking deployment requirements..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    log_success "All requirements met"
}

# Validate environment files
validate_environment() {
    log_info "Validating environment configuration..."
    
    if [ ! -f ".env.${ENVIRONMENT}" ]; then
        log_error "Environment file .env.${ENVIRONMENT} not found"
        exit 1
    fi
    
    # Check for required environment variables
    source ".env.${ENVIRONMENT}"
    
    required_vars=(
        "VITE_API_BASE_URL"
        "VITE_STRIPE_PUBLISHABLE_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "Environment validation passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    docker build \
        --target production \
        --build-arg NODE_ENV=${ENVIRONMENT} \
        -t ${DOCKER_IMAGE}:${DOCKER_TAG} \
        -t ${DOCKER_IMAGE}:latest \
        .
    
    if [ $? -eq 0 ]; then
        log_success "Docker image built successfully"
    else
        log_error "Failed to build Docker image"
        exit 1
    fi
}

# Run security scan (optional)
security_scan() {
    log_info "Running security scan..."
    
    if command -v trivy &> /dev/null; then
        trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}
        if [ $? -ne 0 ]; then
            log_warning "Security scan found issues. Review before deploying to production."
        fi
    else
        log_warning "Trivy not installed. Skipping security scan."
    fi
}

# Deploy using Docker Compose
deploy() {
    log_info "Deploying application..."
    
    # Copy environment file
    cp ".env.${ENVIRONMENT}" .env
    
    # Determine which docker-compose file to use
    COMPOSE_FILE="docker-compose.yml"
    if [ "${ENVIRONMENT}" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    fi
    
    # Stop existing containers
    docker-compose -f ${COMPOSE_FILE} down
    
    # Start new containers
    docker-compose -f ${COMPOSE_FILE} up -d
    
    if [ $? -eq 0 ]; then
        log_success "Application deployed successfully"
    else
        log_error "Deployment failed"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for the application to start
    sleep 30
    
    # Check if the application is responding
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        
        # Show logs for debugging
        log_info "Showing container logs..."
        docker-compose logs --tail=50 ${APP_NAME}
        
        exit 1
    fi
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old versions (keep last 3)
    docker images ${DOCKER_IMAGE} --format "table {{.Tag}}\t{{.ID}}" | \
    tail -n +2 | \
    head -n -3 | \
    awk '{print $2}' | \
    xargs -r docker rmi
    
    log_success "Cleanup completed"
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."
    
    # This is a simplified rollback - in production you'd want to implement
    # proper versioning and rollback strategies
    docker-compose down
    docker-compose up -d
    
    log_success "Rollback completed"
}

# Main deployment flow
main() {
    log_info "Starting deployment of ${APP_NAME} (${ENVIRONMENT})"
    
    check_requirements
    validate_environment
    build_image
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        security_scan
    fi
    
    deploy
    health_check
    cleanup
    
    log_success "Deployment completed successfully!"
    log_info "Application is available at: http://localhost"
    
    if [ "${ENVIRONMENT}" = "production" ]; then
        log_info "Monitor the application with: docker-compose logs -f ${APP_NAME}"
    fi
}

# Handle script arguments
case "$1" in
    build)
        check_requirements
        validate_environment
        build_image
        ;;
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    health)
        health_check
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|deploy|rollback|health|cleanup} [tag] [environment]"
        echo ""
        echo "Commands:"
        echo "  build     - Build Docker image only"
        echo "  deploy    - Full deployment (default)"
        echo "  rollback  - Rollback to previous version"
        echo "  health    - Run health check"
        echo "  cleanup   - Clean up old Docker images"
        echo ""
        echo "Arguments:"
        echo "  tag       - Docker image tag (default: latest)"
        echo "  environment - deployment environment (default: production)"
        echo ""
        echo "Examples:"
        echo "  $0 deploy latest production"
        echo "  $0 build v1.2.0"
        echo "  $0 rollback"
        exit 1
        ;;
esac

# If no command specified, run full deployment
if [ $# -eq 0 ]; then
    main
fi