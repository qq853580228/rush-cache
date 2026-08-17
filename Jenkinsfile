pipeline {
    agent {
        docker {
            image 'node:20-alpine' // node版本和项目对齐
            reuseNode true
        }
    }
    environment {
        // github凭证id，对应jenkins配置的凭证ID
        GIT_CREDS = credentials('github-token')
    }
    stages {
        stage('Checkout 拉取代码') {
            steps {
                checkout scm
                sh '''
                    node -v
                    npm -v
                '''
            }
        }

        stage('安装rush全局工具') {
            steps {
                // 全局安装rush
                sh 'npm install -g @microsoft/rush'
                sh 'rush --version'
            }
        }

        stage('Rush 安装依赖') {
            steps {
                // rush install 解析、安装monorepo全部包依赖
                sh 'rush install'
            }
        }

        stage('Rush Build 构建全部包') {
            steps {
                // 构建monorepo所有项目
                sh 'rush build'
                // 如果只构建指定包 rush build --to @your/package-name
            }
        }

        stage('部署（根据你的项目自定义）') {
            when {
                branch 'main' // main分支才执行部署
            }
            steps {
                echo '构建产物在各包下的dist目录'
                // 示例：如果是前端静态包，拷贝dist，或者docker打包镜像、上传服务器
                // sh 'rush deploy' // rush自带deploy可以导出静态产物
            }
        }
    }
    post {
        success {
            echo "流水线构建成功"
        }
        failure {
            echo "流水线失败"
        }
    }
}
