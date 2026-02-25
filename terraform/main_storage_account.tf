resource "azurerm_storage_account" "storage" {
  name                     = "pokedeliverystorage01"
  resource_group_name      = "pokedelivery-rg"
  location                 = "westeurope"
  account_tier             = "Standard"
  account_replication_type = "LRS"
  allow_nested_items_to_be_public = false
  min_tls_version = "TLS1_0"
}