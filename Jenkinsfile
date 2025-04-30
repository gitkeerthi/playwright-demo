pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    parameters {
        string(name: 'SHARD_COUNT', defaultValue: '4', description: 'Number of parallel test shards (1-8)')
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    // Validate shard count
                    try {
                        env.SHARDS = params.SHARD_COUNT.toInteger()
                        if (env.SHARDS < 1 || env.SHARDS > 8) {
                            error("SHARD_COUNT must be between 1-8")
                        }
                    } catch (Exception e) {
                        error("SHARD_COUNT must be a number between 1-8")
                    }

                    checkout scm
                    sh 'npm ci && npx playwright install --with-deps'
                }
            }
        }

        stage('Execute Tests') {
            steps {
                script {
                    def tests = [:]
                    for (int i = 0; i < env.SHARDS; i++) {
                        def shardNum = i
                        tests["Shard ${i+1}"] = {
                            withEnv(["CI=true"]) {
                                sh """
                                    mkdir -p shard-${shardNum}
                                    npx playwright test \
                                        --shard=${shardNum+1}/${env.SHARDS} \
                                        --output=shard-${shardNum}/test-results \
                                        --reporter=blob,shard-${shardNum}/blob-report/blob.json
                                """
                            }
                        }
                    }
                    parallel tests
                }
            }
        }
    }

    post {
        always {
            script {
                // Combine all reports
                sh 'mkdir -p combined-reports && find . -name "*.json" -path "*/blob-report/*" -exec cp {} combined-reports/ \\;'

                // Generate HTML report if any exist
                if (fileExists('combined-reports/') && sh(script: 'ls combined-reports/*.json 2>/dev/null | wc -l', returnStdout: true).trim() != "0") {
                    sh 'npx playwright merge-reports combined-reports --reporter html'
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report'
                    ])
                }

                // Archive all artifacts
                archiveArtifacts artifacts: '**/test-results/**,combined-reports/**', allowEmptyArchive: true
            }
        }
    }
}