pipeline {
    agent any

        tools {nodejs "recent node"}

        environment {
        AZURE_CLIENT_ID     = credentials('AZURE_CLIENT_ID')
        AZURE_CLIENT_SECRET = credentials('AZURE_CLIENT_SECRET')
        AZURE_TENANT_ID     = credentials('AZURE_TENANT_ID')
        AZURE_SUBSCRIPTION_ID = credentials('AZURE_SUBSCRIPTION_ID')
        AZURE_FUNCTION_KEY = credentials('AZURE_FUNCTION_KEY')
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
        stage('Send Logs to Azure Function') {
            steps {
                script {
                    // Fetch full console log as a String List
                    def logLines = currentBuild.rawBuild.getLog(999999)
                    def fullLog = logLines.join("\n")
 
                    httpRequest(
                        url: "https://pokedelivery-func.azurewebsites.net/api/getPokemon?code=$AZURE_FUNCTION_KEY",
                        httpMode: "POST",
                        contentType: "APPLICATION_JSON",
                        requestBody: fullLog
                    )
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
