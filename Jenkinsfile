pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.52.0-noble'
      args '-u root'
    }
  }

  environment {
    CI = 'true' // Enables CI-specific behavior in Playwright config
  }

  stages {
    stage('Install Dependencies') {
      steps {
        sh 'rm -rf node_modules && npm ci'
        sh 'npx playwright install --with-deps'
      }
    }

    stage('Run Playwright Tests') {
      steps {
        sh 'rm -rf playwright-report .blob-report'
        sh 'npx playwright test'
      }
    }

    stage('Generate HTML Report from Blob') {
      steps {
        sh 'npx playwright show-report --reporter=blob --output=playwright-report'
      }
    }

    stage('Archive and Publish Report') {
      steps {
        archiveArtifacts artifacts: 'playwright-report/**/*', fingerprint: true

        publishHTML(target: [
          reportDir: 'playwright-report',
          reportFiles: 'index.html',
          reportName: 'Playwright Test Report',
          allowMissing: false
        ])
      }
    }
  }

  post {
    always {
      echo 'Playwright E2E pipeline completed.'
    }
  }
}
