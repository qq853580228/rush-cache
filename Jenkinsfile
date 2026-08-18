pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-v /root/.pnpm-store:/root/.pnpm-store'
        }
    }
    environment {
        CI = 'true'
        // 分支映射mode，和my‑app下.env.*后缀严格对齐
        MODE = """${sh(
            script: '''
                case "${BRANCH_NAME}" in
                    dev)    echo "dev" ;;
                    test)   echo "test" ;;
                    pre)    echo "pre" ;;
                    prod)   echo "prod" ;;
                    *)      echo "unknown" ;;
                esac
            ''',
            returnStdout: true
        )}""".trim()
    }

    stages {
        stage('Setup') {
            steps {
                sh '''
                    apk add --no-cache git
                    echo "BRANCH_NAME=${BRANCH_NAME}"
                    echo "MODE=${MODE}"
                '''
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

        stage('Build my‑app') {
            when {
                expression { env.MODE != 'unknown' }
            }
            steps {
                sh '''
                    export MODE="${MODE}"
                    # build‑to 只构建my‑app以及它依赖的components
                    node common/scripts/install-run-rush.js build-to my-app --verbose
                '''
            }
        }

        stage('Deploy') {
            when {
                expression { env.MODE != 'unknown' }
            }
            steps {
                sh '''
                    echo "产物目录 my‑app/dist"
                    case "${MODE}" in
                        dev)
                            echo "部署开发环境"
                            ;;
                        test)
                            echo "部署测试环境"
                            ;;
                        pre)
                            echo "部署预发环境"
                            ;;
                        prod)
                            echo "部署生产环境"
                            ;;
                    esac
                '''
            }
        }
    }
    post {
        success { echo "✅构建完成，mode=${MODE}" }
        failure { echo "❌流水线失败，mode=${MODE}" }
    }
}
