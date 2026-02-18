Jenkinsfile (Declarative Pipeline)
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                azureFunctionAppPublish azureCredentialsId: '<credential_id>',
                        resourceGroup: '<resource_group_name>', appName: '<app_name>',
                        filePath: '**/*.js,**/*.json'
            }
        }
    }
}
