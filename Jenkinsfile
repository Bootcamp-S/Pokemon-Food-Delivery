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
                dir("./api") {
                    sh '''
                        echo "Building..."
                        # Beispiel: Node Function App
                        npm install
                        zip -r build.zip .
                    '''
                }
            }
        }
        stage('Azure Login') {
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
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy to Azure Function') {
            steps {
                sh '''
                    echo "PWD = $(pwd)"
                    echo "WORKSPACE = $WORKSPACE"
                    ls -al $WORKSPACE
                    ls -al $WORKSPACE/api
                    
                    az functionapp deployment source config-zip \
                      -g $RESOURCE_GROUP \
                      -n $FUNCTION_APP_NAME \
                      --src api/build.zip
                '''
            }
        }
    }

}   
