pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-v /root/.pnpm-store:/root/.pnpm-store'
        }
    }

    environment { CI = 'true' }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/qq853580228/rush-cache.git'
            }
        }

        stage('Setup') {
            steps {
                sh 'apk add --no-cache git'
            }
        }

        stage('Install') {
            steps {
                sh '''
                    corepack enable
                    node common/scripts/install-run-rush.js install
                '''
            }
        }

        stage('Build') {
            steps {
                sh 'node common/scripts/install-run-rush.js build --verbose'
            }
        }
    }

    post {
        success { echo 'Build Success!' }
        failure { echo 'Build Failed!' }
    }
}
