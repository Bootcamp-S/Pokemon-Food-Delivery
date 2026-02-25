data "azurerm_application_insights" "ai" {
  name                = "pokedelivery-func"
  resource_group_name = "pokedelivery-rg"
}


resource "azurerm_linux_function_app" "func" {
  app_settings = {
    "AzureWebJobsSecretStorageType" = "files"
    "WEBSITE_RUN_FROM_PACKAGE"      = var.run_from_package_url
  }
  builtin_logging_enabled = false
  client_certificate_mode = "Required"
  ftp_publish_basic_authentication_enabled = false
  https_only = true
  location = "ukwest"
  name                = "pokedelivery-func"
  resource_group_name = "pokedelivery-rg"
  service_plan_id     = var.service_plan_id
  storage_account_name        = azurerm_storage_account.storage.name
  storage_account_access_key  = azurerm_storage_account.storage.primary_access_key
  tags = {
    "hidden-link: /app-insights-resource-id" = var.app_insights_id
  }
  webdeploy_publish_basic_authentication_enabled = false
  site_config {
    application_insights_connection_string = data.azurerm_application_insights.ai.connection_string
    ftps_state = "FtpsOnly"
    application_stack {
      node_version = "22"
    }
    cors {
      allowed_origins     = ["https://portal.azure.com"]
      support_credentials = false
    }
  }
}    
    