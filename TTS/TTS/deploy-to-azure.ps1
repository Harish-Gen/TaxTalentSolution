# Deploy TTS FastAPI to Azure App Service (zip deploy).
# Visual Studio "Publish" is disabled for Python projects — use this script instead.
#
# Prerequisites:
#   az login
#   Azure CLI: https://learn.microsoft.com/cli/azure/install-azure-cli
#
# Usage:
#   .\deploy-to-azure.ps1 -ResourceGroup "your-rg-name" -WebAppName "tax-talent-dev-app"

param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroup,
    [string]$WebAppName = "tax-talent-dev-app"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$ZipPath = Join-Path $env:TEMP "tts-api-deploy.zip"

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI (az) not found. Install: https://learn.microsoft.com/cli/azure/install-azure-cli"
}

$items = @(
    "TTS.py",
    "requirements.txt",
    "startup.sh",
    "appsettings.json",
    "appsettings.Development.json",
    "appsettings.Production.json",
    "controllers",
    "config",
    "models",
    "repository",
    "interfaces",
    "utils"
)

Push-Location $ProjectRoot
try {
    foreach ($item in $items) {
        if (-not (Test-Path $item)) {
            Write-Error "Missing required path: $item"
        }
    }

    if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }

    Write-Host "Creating deployment package..."
    Compress-Archive -Path $items -DestinationPath $ZipPath -Force

    Write-Host "Deploying to $WebAppName (resource group: $ResourceGroup)..."
    az webapp deploy `
        --resource-group $ResourceGroup `
        --name $WebAppName `
        --src-path $ZipPath `
        --type zip `
        --async false

    Write-Host ""
    Write-Host "Done. Verify:"
    Write-Host "  https://$WebAppName.azurewebsites.net/"
    Write-Host "  https://$WebAppName.azurewebsites.net/docs"
    Write-Host ""
    Write-Host "Portal: Configuration -> Startup Command = startup.sh"
    Write-Host "        Application settings -> ENVIRONMENT = Production"
}
finally {
    Pop-Location
}
