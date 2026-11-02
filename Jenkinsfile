pipeline {
    agent any

    environment {
        // Docker image name and tag
        IMAGE_NAME = 'skytouchclean'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        REGISTRY = 'your-registry.com' // Change to your registry (Docker Hub, ECR, GCR, etc.)
        REGISTRY_CREDENTIALS = 'docker-registry-credentials' // Jenkins credential ID

        // Node.js version
        NODE_VERSION = '20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh """
                    node --version
                    npm --version
                    npm ci
                """
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('E2E Tests') {
            steps {
                sh 'npm run test:e2e'
            }
            post {
                always {
                    // Publish test results
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report'
                    ])
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build(
                        image: "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}",
                        args: "--build-arg NODE_ENV=production"
                    )
                }
            }
        }

        stage('Tag Docker Image') {
            steps {
                script {
                    docker.image("${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}").tag('latest')
                }
            }
        }

        stage('Push Docker Image') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", "${REGISTRY_CREDENTIALS}") {
                        docker.image("${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}").push()
                        docker.image("${REGISTRY}/${IMAGE_NAME}:latest").push()
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to staging environment...'
                // Add your deployment commands here
                // Example: kubectl apply -f k8s/staging/
                // Or: ansible-playbook deploy-staging.yml
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message 'Deploy to production?'
                ok 'Deploy'
                submitter 'admin'
            }
            steps {
                echo 'Deploying to production environment...'
                // Add your production deployment commands here
                // Example: kubectl apply -f k8s/production/
                // Or: ansible-playbook deploy-production.yml
            }
        }
    }

    post {
        always {
            // Clean up Docker images
            sh """
                docker rmi ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || true
                docker rmi ${REGISTRY}/${IMAGE_NAME}:latest || true
            """
        }

        success {
            echo 'Pipeline succeeded!'
        }

        failure {
            echo 'Pipeline failed!'
            // Send notification (Slack, email, etc.)
            // emailext subject: "Jenkins Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            //          body: "Check console output at ${env.BUILD_URL}",
            //          to: "team@example.com"
        }
    }
}
