pipeline {
    agent any

    parameters {
        choice(
            name: 'DEPLOY_ENV',
            choices: ['dev', 'staging', 'production'],
            description: '请选择要部署的环境'
        )
    }

    environment {
        // ========== 关键：添加下面这一行 ==========
        DOCKER_HOST = 'tcp://host.docker.internal:2375'
        // ==========================================
        IMAGE_NAME = 'rush-cache-app'
    }

    stages {
        // ... 其他 stages 保持不变 ...
        
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
                    // 这里可以加上端口判断逻辑（参考之前的配置）
                    def port = (params.DEPLOY_ENV == 'production') ? '8890' : (params.DEPLOY_ENV == 'staging' ? '8889' : '8888')
                    sh """
                        docker rm -f ${IMAGE_NAME} || true
                        docker run -d \
                            --name ${IMAGE_NAME} \
                            -p ${port}:80 \
                            ${IMAGE_NAME}:${env.BUILD_ID}
                    """
                    echo "部署环境: ${params.DEPLOY_ENV}, 端口: ${port}"
                }
            }
        }
    }
}
