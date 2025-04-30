pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Use the NodeJS installation you configured in Jenkins
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
            steps {
                script {
                    def shards = [:]
                    for (int i = 1; i <= 3; i++) {
                        def shardIndex = i
                        shards["shard${shardIndex}"] = {
                            node('any') {
                                withEnv(['CI=true']) {
                                    sh "npx playwright test --shard=${shardIndex}/3"
                                }
                            }
                        }
                    }
                    parallel shards
                }
            }
        }
        stage('Merge Reports') {
            steps {
                sh 'npx playwright merge-reports --reporter html blob-report/'
            }
        }
    }

    post {
        always {
            // Archive the blob report
            archiveArtifacts artifacts: 'blob-report/**/*', allowEmptyArchive: true

            // Archive the HTML report if available (for local runs)
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])

            // Archive any screenshots and videos
            archiveArtifacts artifacts: 'test-results/**/*.png,test-results/**/*.webm', allowEmptyArchive: true
        }
    }
}