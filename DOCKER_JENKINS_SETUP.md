# Docker and Jenkins Setup Guide

This guide explains how to use Docker for containerization and Jenkins for CI/CD with the SkyTouchClean application.

---

## Docker Setup

### Files Created

1. **Dockerfile** - Multi-stage build configuration for Next.js
2. **.dockerignore** - Files to exclude from Docker build
3. **next.config.js** - Updated with `output: 'standalone'` for Docker

### Building the Docker Image

```bash
# Navigate to project directory
cd SkyTouchClean

# Build the Docker image
docker build -t skytouchclean:latest .

# Or with a specific tag
docker build -t skytouchclean:v1.0.0 .
```

### Running the Container

```bash
# Run with environment variables
docker run -d \
  --name skytouchclean \
  -p 3000:3000 \
  -e MONGODB_URI="mongodb://your-mongodb-host:27017/skytouchclean" \
  -e MONGODB_DB="skytouchclean" \
  -e SESSION_SECRET="your-session-secret-min-32-chars" \
  -e PAYSTACK_SECRET_KEY="sk_test_your-key" \
  -e NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_your-key" \
  -e NEXT_PUBLIC_SITE_URL="https://your-domain.com" \
  skytouchclean:latest
```

### Environment Variables for Production

Required environment variables:

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skytouchclean
MONGODB_DB=skytouchclean
SESSION_SECRET=your-production-secret-at-least-32-characters
PAYSTACK_SECRET_KEY=sk_live_your-production-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your-production-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Optional:

```bash
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password
ADMIN_NAME=Admin Name
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your-api-key
```

### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker logs skytouchclean

# Stop container
docker stop skytouchclean

# Start container
docker start skytouchclean

# Remove container
docker rm skytouchclean

# Remove image
docker rmi skytouchclean:latest

# Execute shell in container
docker exec -it skytouchclean sh
```

### Pushing to Docker Registry

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag skytouchclean:latest yourusername/skytouchclean:latest

# Push to registry
docker push yourusername/skytouchclean:latest
```

For other registries (AWS ECR, Google GCR, Azure ACR):

```bash
# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com
docker tag skytouchclean:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/skytouchclean:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/skytouchclean:latest

# Google GCR
gcloud auth configure-docker
docker tag skytouchclean:latest gcr.io/your-project/skytouchclean:latest
docker push gcr.io/your-project/skytouchclean:latest
```

---

## Jenkins Setup

### Prerequisites

1. Jenkins server installed and running
2. Docker installed on Jenkins agent
3. Jenkins plugins installed:
   - Docker Pipeline
   - Git
   - Node.js (optional, if using Node.js plugin)

### Jenkinsfile Overview

The Jenkinsfile includes the following stages:

1. **Checkout** - Clone the repository
2. **Install Dependencies** - Run `npm ci`
3. **Lint** - Run `npm run lint`
4. **Type Check** - Run `npm run typecheck`
5. **Unit Tests** - Run `npm test`
6. **E2E Tests** - Run `npm run test:e2e`
7. **Build Docker Image** - Build Docker image
8. **Tag Docker Image** - Tag with build number and latest
9. **Push Docker Image** - Push to registry (main/master/develop branches only)
10. **Deploy to Staging** - Deploy to staging (develop branch)
11. **Deploy to Production** - Deploy to production (main branch with manual approval)

### Setting Up Jenkins Credentials

1. Go to Jenkins → Manage Jenkins → Credentials
2. Add Docker registry credentials:
   - **ID**: `docker-registry-credentials`
   - **Username**: Your registry username
   - **Password**: Your registry password/token
   - **Description**: Docker Registry Credentials

### Configuring the Pipeline

1. Create a new Multibranch Pipeline in Jenkins
2. Add your Git repository
3. Jenkins will automatically discover branches and run the pipeline

### Customizing the Jenkinsfile

Update the following in the Jenkinsfile:

```groovy
environment {
    // Change to your registry
    REGISTRY = 'your-registry.com' // or 'docker.io/yourusername'

    // Update credential ID if different
    REGISTRY_CREDENTIALS = 'docker-registry-credentials'
}
```

### Branch Strategy

- **main/master** → Production deployment (requires manual approval)
- **develop** → Staging deployment (automatic)
- **feature/*** → Build and test only (no deployment)

### Deployment Stages

The Jenkinsfile has placeholder deployment commands. Update these based on your infrastructure:

#### For Kubernetes:

```groovy
stage('Deploy to Production') {
    steps {
        sh 'kubectl apply -f k8s/production/'
        sh 'kubectl rollout status deployment/skytouchclean'
    }
}
```

#### For Docker Swarm:

```groovy
stage('Deploy to Production') {
    steps {
        sh 'docker stack deploy -c docker-compose.prod.yml skytouchclean'
    }
}
```

#### For Ansible:

```groovy
stage('Deploy to Production') {
    steps {
        sh 'ansible-playbook deploy-production.yml'
    }
}
```

#### For AWS ECS:

```groovy
stage('Deploy to Production') {
    steps {
        sh '''
            aws ecs update-service \
                --cluster your-cluster \
                --service skytouchclean \
                --force-new-deployment
        '''
    }
}
```

### Notifications

Uncomment and configure email notifications in the Jenkinsfile:

```groovy
post {
    failure {
        emailext subject: "Jenkins Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                 body: "Check console output at ${env.BUILD_URL}",
                 to: "team@example.com"
    }
}
```

Or add Slack notifications using the Slack Notification plugin.

---

## Development with Docker

### Using Docker for Local Development

For local development with MongoDB, you can use Docker (even though you're not using docker-compose for production):

```bash
# Run MongoDB in Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# Build and run the app
docker build -t skytouchclean:dev .
docker run -d \
  --name skytouchclean \
  -p 3000:3000 \
  --link mongodb:mongodb \
  -e MONGODB_URI="mongodb://mongodb:27017/skytouchclean" \
  -e MONGODB_DB="skytouchclean" \
  skytouchclean:dev
```

---

## Production Deployment without Docker Compose

Since you're not using docker-compose for production, here are the recommended approaches:

### Option 1: Kubernetes

Create Kubernetes manifests in `k8s/` directory:

- `deployment.yaml` - Pod and replica configuration
- `service.yaml` - Service to expose the app
- `configmap.yaml` - Environment variables
- `secret.yaml` - Sensitive data (passwords, API keys)

### Option 2: Docker Swarm

Create a `docker-stack.yml` file (not docker-compose) for swarm deployment:

```yaml
version: '3.8'
services:
  app:
    image: your-registry/skytouchclean:latest
    deploy:
      replicas: 3
      ports:
        - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/skytouchclean
    networks:
      - skytouch-network

  mongodb:
    image: mongo:latest
    deploy:
      replicas: 1
    volumes:
      - mongodb_data:/data/db
    networks:
      - skytouch-network

networks:
  skytouch-network:

volumes:
  mongodb_data:
```

Deploy with:
```bash
docker stack deploy -c docker-stack.yml skytouchclean
```

### Option 3: Cloud Services

- **AWS**: ECS, EKS, or App Runner
- **Google Cloud**: Cloud Run, GKE
- **Azure**: Container Instances, AKS
- **Vercel**: Can deploy Docker images directly

---

## Troubleshooting

### Docker Build Issues

**Issue**: Build fails due to missing dependencies
```bash
# Solution: Ensure node_modules are not copied in first stage
# The Dockerfile uses multi-stage build to handle this
```

**Issue**: Image too large
```bash
# Solution: Multi-stage build already optimizes this
# Next.js standalone output also reduces size
```

### Jenkins Pipeline Issues

**Issue**: Docker command not found
```bash
# Solution: Ensure Docker is installed on Jenkins agent
# Check Jenkins agent configuration
```

**Issue**: Permission denied for Docker
```bash
# Solution: Add jenkins user to docker group
sudo usermod -aG docker jenkins
```

**Issue**: Registry authentication fails
```bash
# Solution: Verify credentials in Jenkins
# Check credential ID matches Jenkinsfile
```

---

## Security Best Practices

1. **Never commit `.env` files** - Use runtime environment variables
2. **Use secrets management** - Kubernetes Secrets, AWS Secrets Manager, or HashiCorp Vault
3. **Scan images for vulnerabilities** - Use tools like Trivy, Clair, or Docker Scout
4. **Use minimal base images** - Alpine Linux (already used in Dockerfile)
5. **Run as non-root user** - Already configured in Dockerfile
6. **Keep dependencies updated** - Regularly run `npm audit` and update packages
7. **Enable HTTPS** - Use reverse proxy (nginx, Traefik) with SSL certificates

---

## Monitoring and Logging

### Health Checks

Add health check to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

### Logging

Configure logging driver in production:

```bash
docker run -d \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  skytouchclean:latest
```

Or use centralized logging (ELK stack, CloudWatch, etc.)

---

## Next Steps

1. Update `REGISTRY` in Jenkinsfile to your actual registry
2. Configure Jenkins credentials for Docker registry
3. Set up deployment commands in Jenkinsfile for your infrastructure
4. Test the pipeline on a feature branch
5. Configure notifications for build failures
6. Set up monitoring and alerting for production
