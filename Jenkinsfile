pipeline {
    agent any

    environment {
        IMAGE_NAME = 'rush-cache-app'
        HOST_PORT = '8888'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    docker.image('node:18-alpine').inside {
                        sh 'npm install'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def appImage = docker.build("${IMAGE_NAME}:${env.BUILD_ID}")
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh """
                        docker rm -f ${IMAGE_NAME} || true
                        docker run -d \
                            --name ${IMAGE_NAME} \
                            -p ${HOST_PORT}:80 \
                            ${IMAGE_NAME}:${env.BUILD_ID}
                    """
                }
            }
        }
    }
}
