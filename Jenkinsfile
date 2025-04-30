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
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                // Set CI environment variable to true for proper reporter configuration
                withEnv(['CI=true']) {
                    sh 'npx playwright test'
                }
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