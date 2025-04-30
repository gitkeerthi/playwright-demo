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
                    if (!params.SHARD_COUNT?.trim()) {
                        params.SHARD_COUNT = '4'
                    }
                    try {
                        env.VALIDATED_SHARD_COUNT = params.SHARD_COUNT.toInteger()
                        if (env.VALIDATED_SHARD_COUNT < 1 || env.VALIDATED_SHARD_COUNT > 8) {
                            error("SHARD_COUNT must be between 1 and 8")
                        }
                    } catch (NumberFormatException e) {
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
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    def shardCount = env.VALIDATED_SHARD_COUNT.toInteger()
                    def parallelStages = [:]

                    (0..<shardCount).each { i ->
                        parallelStages["Shard ${i + 1}"] = {
                            runShard(shardIndex: i, shardTotal: shardCount)
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
                // Create directory for combined reports
                sh 'mkdir -p combined-blob-report'

                // Find and copy all blob reports (fixed escaping)
                sh 'find . -path "*/blob-report/*.json" -exec cp -- "{}" combined-blob-report/ ";"'

                // Archive the combined reports
                archiveArtifacts artifacts: 'combined-blob-report/**/*', allowEmptyArchive: true

                // Check if any reports exist
                def hasReports = sh(
                    script: 'test $(ls combined-blob-report/*.json 2>/dev/null | wc -l) -gt 0',
                    returnStatus: true
                ) == 0

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

                // Archive all test results
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