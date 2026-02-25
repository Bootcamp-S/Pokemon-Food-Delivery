variable "run_from_package_url" {
  description = "SAS URL for the function app package"
  type        = string
  sensitive   = true
}

variable "service_plan_id" {
  description = "App Service Plan ID"
  type        = string
  sensitive = true
}

variable "app_insights_id" {
  description = "Application Insights Resource ID"
  type        = string
  sensitive = true
}