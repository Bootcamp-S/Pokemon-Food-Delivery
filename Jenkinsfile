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
                azureFunctionAppPublish azureCredentialsId: 'poke-delivery',
                        resourceGroup: 'pokedelivery-rg', appName: 'pokedelivery-func',
                        filePath: '**/*.js,**/*.json'
            }
        }
    }
}
