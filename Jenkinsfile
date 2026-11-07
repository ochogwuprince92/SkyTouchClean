pipeline {
    agent any

    parameters {
        string(name: 'STAGING_SITE_URL', defaultValue: 'http://localhost:3001', description: 'Public URL for the staging deployment')
        string(name: 'PRODUCTION_SITE_URL', defaultValue: 'http://localhost:3000', description: 'Public URL for the production deployment')
    }

    environment {
        // Docker image name and tag
        IMAGE_NAME = 'ochogwuprince/skytouchclean'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        REGISTRY = 'docker.io'
        REGISTRY_CREDENTIALS = 'docker-registry-credentials'

        MONGODB_URI = credentials('mongodb-uri')
        MONGODB_DB = 'skytouchclean_ci'
        SESSION_SECRET = credentials('session-secret')
        PAYSTACK_SECRET_KEY = credentials('paystack-secret-key')
        NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = credentials('paystack-public-key')
        NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
    }

     triggers {
        pollSCM('H/5 * * * *')  // Poll every 5 minutes
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
            when {
                anyOf {
                    expression { currentBuild.previousBuild == null }
                    changeset 'src/**'
                    changeset 'public/**'
                    changeset 'package.json'
                    changeset 'package-lock.json'
                    changeset 'Dockerfile'
                    changeset 'next.config.js'
                    changeset 'postcss.config.js'
                    changeset 'tsconfig.json'
                }
            }
            steps {
                script {
                    def siteUrl = env.BRANCH_NAME == 'develop'
                        ? params.STAGING_SITE_URL
                        : params.PRODUCTION_SITE_URL
                    docker.build(
                        "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}",
                        "--build-arg NODE_ENV=production --build-arg NEXT_PUBLIC_SITE_URL=${siteUrl}"
                    )
                }
            }
        }

        stage('Tag Docker Image') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        branch 'master'
                        branch 'develop'
                    }
                    anyOf {
                        expression { currentBuild.previousBuild == null }
                        changeset 'src/**'
                        changeset 'public/**'
                        changeset 'package.json'
                        changeset 'package-lock.json'
                        changeset 'Dockerfile'
                        changeset 'next.config.js'
                        changeset 'postcss.config.js'
                        changeset 'tsconfig.json'
                    }
                }
            }
            steps {
                script {
                    docker.image("${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}").tag('latest')
                }
            }
        }

        stage('Push Docker Image') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        branch 'master'
                        branch 'develop'
                    }
                    anyOf {
                        expression { currentBuild.previousBuild == null }
                        changeset 'src/**'
                        changeset 'public/**'
                        changeset 'package.json'
                        changeset 'package-lock.json'
                        changeset 'Dockerfile'
                        changeset 'next.config.js'
                        changeset 'postcss.config.js'
                        changeset 'tsconfig.json'
                    }
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
                allOf {
                    branch 'develop'
                    anyOf {
                        expression { currentBuild.previousBuild == null }
                        changeset 'src/**'
                        changeset 'public/**'
                        changeset 'package.json'
                        changeset 'package-lock.json'
                        changeset 'Dockerfile'
                        changeset 'next.config.js'
                        changeset 'postcss.config.js'
                        changeset 'tsconfig.json'
                    }
                }
            }
            steps {
                withEnv(["MONGODB_DB=skytouchclean_staging", "NEXT_PUBLIC_SITE_URL=${params.STAGING_SITE_URL}"]) {
                    sh '''
                        docker rm -f skytouchclean-staging 2>/dev/null || true
                        docker run --detach --restart unless-stopped \
                            --name skytouchclean-staging \
                            --publish 3001:3000 \
                            --env MONGODB_URI \
                            --env MONGODB_DB \
                            --env SESSION_SECRET \
                            --env PAYSTACK_SECRET_KEY \
                            --env NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY \
                            --env NEXT_PUBLIC_SITE_URL \
                            "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    anyOf {
                        expression { currentBuild.previousBuild == null }
                        changeset 'src/**'
                        changeset 'public/**'
                        changeset 'package.json'
                        changeset 'package-lock.json'
                        changeset 'Dockerfile'
                        changeset 'next.config.js'
                        changeset 'postcss.config.js'
                        changeset 'tsconfig.json'
                    }
                }
            }
            input {
                message 'Deploy to production?'
                ok 'Deploy'
                submitter 'admin'
            }
            steps {
                withCredentials([
                    string(credentialsId: 'mongodb-uri-production', variable: 'MONGODB_URI'),
                    string(credentialsId: 'session-secret-production', variable: 'SESSION_SECRET'),
                    string(credentialsId: 'paystack-secret-key-production', variable: 'PAYSTACK_SECRET_KEY'),
                    string(credentialsId: 'paystack-public-key-production', variable: 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY')
                ]) {
                    withEnv(["MONGODB_DB=skytouchclean", "NEXT_PUBLIC_SITE_URL=${params.PRODUCTION_SITE_URL}"]) {
                        sh '''
                            docker rm -f skytouchclean-production 2>/dev/null || true
                            docker run --detach --restart unless-stopped \
                                --name skytouchclean-production \
                                --publish 3000:3000 \
                                --env MONGODB_URI \
                                --env MONGODB_DB \
                                --env SESSION_SECRET \
                                --env PAYSTACK_SECRET_KEY \
                                --env NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY \
                                --env NEXT_PUBLIC_SITE_URL \
                                "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                        '''
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up Docker images
            sh """
                docker rmi ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true
                docker rmi ${REGISTRY}/${IMAGE_NAME}:latest 2>/dev/null || true
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
