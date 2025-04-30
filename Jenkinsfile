pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    parameters {
        string(name: 'SHARD_COUNT', defaultValue: '4', description: 'Number of shards to split tests across (1-8)')
    }

    stages {
        stage('Validate Parameters') {
            steps {
                script {
                    // Set default if empty and validate
                    def shardCount = params.SHARD_COUNT ?: '4'
                    try {
                        env.VALIDATED_SHARD_COUNT = shardCount.toInteger()
                        if (env.VALIDATED_SHARD_COUNT < 1 || env.VALIDATED_SHARD_COUNT > 8) {
                            error("SHARD_COUNT must be between 1 and 8")
                        }
                    } catch (Exception e) {
                        error("SHARD_COUNT must be a valid number between 1 and 8")
                    }
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    def shardCount = env.VALIDATED_SHARD_COUNT.toInteger()
                    def parallelStages = [:]

                    for (int i = 0; i < shardCount; i++) {
                        def index = i
                        parallelStages["Shard ${i + 1}"] = {
                            runShard(shardIndex: index, shardTotal: shardCount)
                        }
                    }

                    parallel parallelStages
                }
            }
        }
    }

    post {
        always {
            script {
                // Combine all blob reports
                sh 'mkdir -p combined-blob-report'
                sh 'find . -path "*/blob-report/*.json" -exec cp -- "{}" combined-blob-report/ \\;'

                // Archive combined reports
                archiveArtifacts artifacts: 'combined-blob-report/**/*', allowEmptyArchive: true

                // Check if we have any reports using shell command
                def hasReports = sh(script: 'test -n "$(ls combined-blob-report/*.json 2>/dev/null)"', returnStatus: true) == 0

                if (hasReports) {
                    sh 'npx playwright merge-reports ./combined-blob-report/ --reporter html'
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report'
                    ])
                }

                // Archive test results
                archiveArtifacts artifacts: '**/test-results/**/*', allowEmptyArchive: true
            }
        }
    }
}

def runShard(Map args) {
    withEnv(['CI=true']) {
        def shardDir = "shard-${args.shardIndex}"
        sh """
            mkdir -p ${shardDir}
            npx playwright test \
                --shard=${args.shardIndex + 1}/${args.shardTotal} \
                --output=${shardDir}/test-results \
                --reporter=blob,${shardDir}/blob-report/blob.json
        """
    }
}