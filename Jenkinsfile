pipeline {
    agent none

    environment {
        CI = 'true' // ensures blob reporter and proper config behavior
    }

    stages {
        stage('Parallel Test Shards') {
            parallel {
                stage('Shard 1 of 3') {
                    agent any
                    steps {
                        checkout scm
                        withNodejs('NodeJS') {
                            sh 'npm ci'
                            sh 'npx playwright install'
                            sh '''
                                npx playwright test --shard=1/3
                                mv blob-report blob-report-1
                            '''
                            stash includes: 'blob-report-1/**', name: 'report-1'
                        }
                    }
                }

                stage('Shard 2 of 3') {
                    agent any
                    steps {
                        checkout scm
                        withNodejs('NodeJS') {
                            sh 'npm ci'
                            sh 'npx playwright install'
                            sh '''
                                npx playwright test --shard=2/3
                                mv blob-report blob-report-2
                            '''
                            stash includes: 'blob-report-2/**', name: 'report-2'
                        }
                    }
                }

                stage('Shard 3 of 3') {
                    agent any
                    steps {
                        checkout scm
                        withNodejs('NodeJS') {
                            sh 'npm ci'
                            sh 'npx playwright install'
                            sh '''
                                npx playwright test --shard=3/3
                                mv blob-report blob-report-3
                            '''
                            stash includes: 'blob-report-3/**', name: 'report-3'
                        }
                    }
                }
            }
        }

        stage('Merge Reports') {
            agent any
            steps {
                unstash 'report-1'
                unstash 'report-2'
                unstash 'report-3'

                withNodejs('NodeJS') {
                    sh '''
                        npx playwright merge-reports blob-report-1 blob-report-2 blob-report-3
                        npx playwright show-report --report-dir merged-html-report
                    '''
                }
            }
        }
    }

    post {
        always {
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'merged-html-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Merged Report'
            ])

            archiveArtifacts artifacts: '**/test-results/**/*.png,**/test-results/**/*.webm,**/.playwright/**/*,blob-report-*/**'', allowEmptyArchive: true
        }
    }
}
