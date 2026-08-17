pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        PROJECT_NAME = 'your-app-name'
        IMAGE_NAME = 'your-dockerhub-id/rush-cache'
        IMAGE_TAG = "${env.GIT_COMMIT}"
        CONTAINER_NAME = 'rush-cache-app'
        HOST_PORT = '8081'
        CONTAINER_PORT = '8080'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Rush & Install Dependencies') {
            steps {
                sh "node common/scripts/install-run-rush.js install"
            }
        }

        stage('Build Project') {
            steps {
                sh "node common/scripts/install-run-rush.js build --to ${PROJECT_NAME}"
            }
        }

        stage('Deploy with rush deploy') {
            steps {
                sh "node common/scripts/install-run-rush.js deploy --project ${PROJECT_NAME}"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f Dockerfile.deploy ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
            }
        }

        stage('Run Container') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm ${CONTAINER_NAME} || true"
                sh """
                    docker run -d \
                    --name ${CONTAINER_NAME} \
                    -p ${HOST_PORT}:${CONTAINER_PORT} \
                    ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }
    }

    post {
        failure {
            echo 'Pipeline failed!'
        }
        success {
            echo 'Pipeline succeeded! Application is deployed.'
        }
    }
}
