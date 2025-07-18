function Copy-PluginFiles {
    param(
        [string]$vaultDir
    )
    if (-not (Test-Path $vaultDir -PathType Container)) {
        "Vault path not found on this computer." | Write-Host -ForegroundColor Red
        return
    }

    $extensionDir = $vaultDir | Join-Path -ChildPath ".obsidian\plugins\obsidian-yonda"
    if (-not (Test-Path $extensionDir -PathType Container)) {
        New-Item $extensionDir -ItemType Directory
    }
    Get-ChildItem $PSScriptRoot | Where-Object {$_.Name -in @("main.js", "styles.css", "manifest.json")} | Copy-Item -Destination $extensionDir
}

Copy-PluginFiles -vaultDir $args[0]
