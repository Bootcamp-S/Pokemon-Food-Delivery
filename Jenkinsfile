pipeline {
    agent { label 'agent01' }

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
