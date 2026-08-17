pipeline {
    agent any

    environment {
        // 定义部署的项目名称，请根据你的 rush.json 修改
        PROJECT_NAME = 'rush-cache'
        // 定义 Docker 镜像名称
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
                script {
                    // 获取 Node.js 工具
                    def nodeHome = tool name: 'Node-18', type: 'nodejs'
                    // 将 node 加入 PATH
                    withEnv(["PATH+EXTRA=${nodeHome}/bin"]) {
                        sh "node common/scripts/install-run-rush.js install"
                    }
                }
            }
        }

        stage('Build Project') {
            steps {
                script {
                    // 2. 使用 install-run-rush.js 执行构建
                    //    如果只需要构建特定项目及其依赖，使用 --to 参数
                    sh "node common/scripts/install-run-rush.js build --to ${PROJECT_NAME}"
                    
                    // 3. (可选) 如果项目有专门的 "ship" 构建配置，可以这样用
                    // sh "node common/scripts/install-run-rush.js rebuild --ship --verbose"
                }
            }
        }

        stage('Deploy with rush deploy') {
            steps {
                script {
                    // 4. 使用 rush deploy 将特定项目及其生产依赖提取到 common/deploy 文件夹
                    //    首先需要运行 rush init-deploy --project <你的项目名> 来生成配置文件
                    sh "node common/scripts/install-run-rush.js deploy --project ${PROJECT_NAME}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // 5. 构建 Docker 镜像：将 common/deploy 文件夹作为构建上下文
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -f Dockerfile.deploy ."
                    sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Run Container') {
            steps {
                script {
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
