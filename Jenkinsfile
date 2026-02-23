pipeline {
  agent any
 
  tools { nodejs "recent node" }
 
  options {
    // Optional but helpful for debugging
    timestamps()
  }
 
  environment {
    // From Jenkins Credentials (Secret Text). Keep your existing IDs:
    AZURE_CLIENT_ID        = credentials('AZURE_CLIENT_ID')
    AZURE_CLIENT_SECRET    = credentials('AZURE_CLIENT_SECRET')
    AZURE_TENANT_ID        = credentials('AZURE_TENANT_ID')
    AZURE_SUBSCRIPTION_ID  = credentials('AZURE_SUBSCRIPTION_ID')
 
    // Your existing Azure Function deployment config:
    FUNCTION_APP_NAME = "pokedelivery-func"
    RESOURCE_GROUP    = "pokedelivery-rg"
 
    // 🔴 Your final Logs Ingestion API endpoint (from your DCR/DCE)
    AZ_INGEST_URL = "https://jenkins-dce-vbfb.germanywestcentral-1.ingest.monitor.azure.com/dataCollectionRules/dcr-d7a452b068424568a3765630ed992d23/streams/custom-logs:jenkinsbuilds2_CL?api-version=2023-01-01%22
  }
 
  stages {
    stage('Build') {
      steps {
        dir("api") {
          sh '''
            echo "Building..."
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
      when { branch 'main' }
      steps {
        sh '''
          set -e
          az login --service-principal \
            -u "$AZURE_CLIENT_ID" \
            -p "$AZURE_CLIENT_SECRET" \
            --tenant "$AZURE_TENANT_ID"
          az account set -s "$AZURE_SUBSCRIPTION_ID"
        '''
      }
    }
 
    stage('Deploy to Azure Function') {
      when { branch 'main' }
      steps {
        sh '''
          set -e
          az functionapp deployment source config-zip \
            -g "$RESOURCE_GROUP" \
            -n "$FUNCTION_APP_NAME" \
            --src api/build.zip
        '''
      }
    }
  }
 
  // 🔵 Always send a pipeline event to Azure Log Analytics (Logs Ingestion API)
  post {
    always {
      script {
        // Prepare a minimal event; add any fields you want (branch, commit, etc.)
        def event = [[
          TimeGenerated: new Date().format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", TimeZone.getTimeZone('UTC')),
          Job          : env.JOB_NAME,
          Build        : env.BUILD_NUMBER,
          Status       : currentBuild.currentResult ?: 'UNKNOWN',
          Branch       : env.BRANCH_NAME,
          GitCommit    : env.GIT_COMMIT,
          BuildUrl     : env.BUILD_URL
        ]]
 
        writeFile file: 'pipeline-log.json', text: groovy.json.JsonOutput.toJson(event)
 
        // Acquire Azure AD token and POST to Logs Ingestion API
        // (Parse JSON with Node to avoid needing jq)
        sh '''
          set -euo pipefail
 
          TOKEN=$(curl -s -X POST \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "client_id=${AZURE_CLIENT_ID}&client_secret=${AZURE_CLIENT_SECRET}&grant_type=client_credentials&scope=https%3A%2F%2Fmonitor.azure.com%2F.default" \
            "https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token" \
            | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).access_token))")
 
          # Simple retry (exponential backoff)
          ATTEMPTS=0
          until [ $ATTEMPTS -ge 5 ]; do
            HTTP_CODE=$(curl -s -o /tmp/ingest_resp.txt -w "%{http_code}" -X POST "${AZ_INGEST_URL}" \
              -H "Authorization: Bearer ${TOKEN}" \
              -H "Content-Type: application/json" \
              --data-binary @pipeline-log.json)
 
            if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
              echo "Logs ingestion succeeded (HTTP $HTTP_CODE)"
              break
            fi
 
            echo "Logs ingestion failed (HTTP $HTTP_CODE), retrying..."
            ATTEMPTS=$((ATTEMPTS+1))
            sleep $((2**ATTEMPTS))
          done
 
          # If we exhausted retries, fail the post step (but won't change build result unless you want to)
          if [ $ATTEMPTS -ge 5 ]; then
            echo "Logs ingestion failed after retries. Response:"
            cat /tmp/ingest_resp.txt || true
          fi
        '''
      }
    }
  }
}
