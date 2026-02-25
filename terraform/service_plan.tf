resource "azurerm_service_plan" "plan" {
  name                = "ASP-pokedeliveryrg-a6a0"
  resource_group_name = "pokedelivery-rg"
  location            = "ukwest"
  os_type             = "Linux"
  sku_name            = "Y1"
}