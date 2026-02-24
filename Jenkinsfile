pipeline {
    agent any

        tools {nodejs "recent node"}

        environment {
        AZURE_CLIENT_ID     = credentials('AZURE_CLIENT_ID')
        AZURE_CLIENT_SECRET = credentials('AZURE_CLIENT_SECRET')
        AZURE_TENANT_ID     = credentials('AZURE_TENANT_ID')
        AZURE_SUBSCRIPTION_ID = credentials('AZURE_SUBSCRIPTION_ID')
        FUNCTION_APP_NAME   = "pokedelivery-func"
        RESOURCE_GROUP      = "pokedelivery-rg"
        }

    stages {
        stage('Build') {
            steps {
                dir("api") {
                    sh '''
                        echo "Building..."
                        # Beispiel: Node Function App
                        npm install
                        zip -r build.zip .
                    '''
                }
            }
        }
        stage('Test') {
            steps {
                dir("api") {
                    echo 'Testing..'
                    sh 'npm test'
                }
            }
        }
        stage('Install Bruno (local)') {
            steps {
                dir("api") {
                    sh '''
                        echo "Installing Bruno CLI locally..."
                        npm install -D @usebruno/cli
                    '''
                }
            }
        }
        stage('Start Local API (Node wrapper)') {
            steps {
                dir("api") {
                    sh '''
                        echo "Starting local test server..."
                        PORT 5050 nohup node server.js > server.log 2>&1 &
                        echo $! > server.pid

                        # Wait for readiness
                        for i in {1..20}; do
                          if curl -fsS http://127.0.0.1:5050/api/index >/dev/null; then
                            echo "Server is up."
                            exit 0
                          fi
                          echo "Waiting for server (attempt $i)..."
                          sleep 1
                        done
                        echo "Server did not start in time."
                        exit 1
                    '''
                }
            }
        }
        stage('API Tests (Bruno)') {
            steps {
                dir("api") {
                    sh '''
                        echo "Running Bruno API tests..."
                        mkdir -p reports
                        npx bru run bruno/collection \
                          --env bruno/envs/local.env \
                          --reporter junit \
                          --output reports/bruno-junit.xml \
                          --ci
                    '''
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'api/reports/bruno-junit.xml'
                }
            }
        }
        stage('Azure Login') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    az login --service-principal \
                      -u $AZURE_CLIENT_ID \
                      -p $AZURE_CLIENT_SECRET \
                      --tenant $AZURE_TENANT_ID
                    az account set -s $AZURE_SUBSCRIPTION_ID
                '''
            }
        }
        stage('Deploy to Azure Function') {
            when {
                branch 'main'
            } 
            steps {
                sh '''
                    az functionapp deployment source config-zip \
                      -g $RESOURCE_GROUP \
                      -n $FUNCTION_APP_NAME \
                      --src api/build.zip
                '''
            }
        }
    }

}   
