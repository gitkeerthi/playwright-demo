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
                    // Set default value if parameter is empty
                    if (!params.SHARD_COUNT?.trim()) {
                        params.SHARD_COUNT = '4'
                    }

                    // Validate SHARD_COUNT is a number between 1-8
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
                sh 'npx playwright install'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    def shardCount = env.VALIDATED_SHARD_COUNT.toInteger()
                    def parallelStages = [:]

                    for (int i = 0; i < shardCount; i++) {
                        def shardIndex = i
                        parallelStages["Shard ${i + 1}"] = {
                            runShard(shardIndex: shardIndex, shardTotal: shardCount)
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
                // Combine all blob reports from shards
                sh '''
                    mkdir -p combined-blob-report
                    find . -path "*/blob-report/*.json" -exec cp -- "{}" combined-blob-report/ \\;
                '''

                // Archive the combined blob report
                archiveArtifacts artifacts: 'combined-blob-report/**/*', allowEmptyArchive: true

                // Generate and publish HTML report if we have any blob reports
                def blobFiles = findFiles(glob: 'combined-blob-report/*.json')
                if (blobFiles.length > 0) {
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

                // Archive any screenshots and videos from all shards
                archiveArtifacts artifacts: '**/test-results/**/*.png,**/test-results/**/*.webm', allowEmptyArchive: true
            }
        }
    }
}

def runShard(Map args) {
    withEnv(['CI=true']) {
        def shardDir = "shard-${args.shardIndex}"

        sh """
            mkdir -p ${shardDir}
            npx playwright test --shard=${args.shardIndex + 1}/${args.shardTotal} \
                               --output=${shardDir}/test-results \
                               --reporter=blob,${shardDir}/blob-report/blob.json
        """
    }
}