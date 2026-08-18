pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-v /root/.pnpm-store:/root/.pnpm-store'
        }
    }
    environment {
        CI = 'true'
        // 根据分支得到环境标识 dev / test / pre / prod
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
        stage('环境打印') {
            steps {
                sh '''
                    apk add --no-cache git
                    echo "分支：${BRANCH_NAME}"
                    echo "部署环境MODE：${MODE}"
                '''
            }
        }

        stage('Install依赖') {
            steps {
                sh '''
                    corepack enable
                    node common/scripts/install-run-rush.js install
                '''
            }
        }

        stage('Build编译打包') {
            when { expression { env.MODE != 'unknown' } }
            steps {
                sh '''
                    export MODE="${MODE}"
                    node common/scripts/install-run-rush.js build --to my-app --verbose
                '''
            }
        }

        stage('发布：拷贝产物到宿主机磁盘【模拟上传服务器】') {
            when { expression { env.MODE != 'unknown' } }
            steps {
                sh '''
                    # /var/jenkins_home 容器内映射 Windows D:\jenkins_home
                    mkdir -p /var/jenkins_home/build_output/${MODE}
                    # 把容器内构建出来的dist全部复制到jenkins挂载目录，落到Windows磁盘
                    cp -r my-app/dist/*  /var/jenkins_home/build_output/${MODE}/
                    echo "======================================"
                    echo "✅打包产物已经输出到Windows宿主机："
                    echo "D:\\jenkins_home\\build_output\\${MODE}"
                    echo "======================================"
                '''
            }
        }
    }
    post {
        success { echo "✅流水线全部完成，可访问本地nginx查看页面" }
        failure { echo "❌流水线执行失败" }
    }
}
