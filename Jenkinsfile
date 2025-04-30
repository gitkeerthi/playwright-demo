pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    parameters {
        int(name: 'SHARD_COUNT', defaultValue: 4, description: 'Number of shards to split tests across')
    }

    stages {
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
            parallel {
                stage('Shard 1') {
                    steps {
                        runShard(shardIndex: 0, shardTotal: params.SHARD_COUNT)
                    }
                }
                stage('Shard 2') {
                    steps {
                        runShard(shardIndex: 1, shardTotal: params.SHARD_COUNT)
                    }
                }
                stage('Shard 3') {
                    steps {
                        runShard(shardIndex: 2, shardTotal: params.SHARD_COUNT)
                    }
                }
                stage('Shard 4') {
                    steps {
                        runShard(shardIndex: 3, shardTotal: params.SHARD_COUNT)
                    }
                }
            }
        }
    }

    post {
        always {
            // Combine all blob reports from shards
            sh '''
                mkdir -p combined-blob-report
                find . -path "*/blob-report/*.json" -exec cp {} combined-blob-report/ \\;
            '''

            // Archive the combined blob report
            archiveArtifacts artifacts: 'combined-blob-report/**/*', allowEmptyArchive: true

            // Generate and publish HTML report from combined blob reports
            script {
                if (fileExists('combined-blob-report/')) {
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
            }

            // Archive any screenshots and videos from all shards
            archiveArtifacts artifacts: '**/test-results/**/*.png,**/test-results/**/*.webm', allowEmptyArchive: true
        }
    }
}

def runShard(Map args) {
    withEnv(['CI=true']) {
        // Create unique output directories for each shard
        def shardDir = "shard-${args.shardIndex}"

        sh """
            mkdir -p ${shardDir}
            npx playwright test --shard=${args.shardIndex + 1}/${args.shardTotal} \
                               --output=${shardDir}/test-results \
                               --reporter=blob,${shardDir}/blob-report/blob.json
        """
    }
}