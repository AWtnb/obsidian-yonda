function Copy-PluginFiles {
    param(
        [string]$vaultDir
    )
    if (-not (Test-Path $vaultDir -PathType Container)) {
        "Vault path not found on this computer." | Write-Host -ForegroundColor Red
        return
    }

    $obsidianPath = $vaultDir | Join-Path -ChildPath ".obsidian\plugins\obsidian-yonda"
    if (-not (Test-Path $obsidianPath -PathType Container)) {
        New-Item $obsidianPath -ItemType Directory
    }
    Get-ChildItem -Path @("main.js", "styles.css", "manifest.json") | Copy-Item -Destination $obsidianPath
}

Copy-PluginFiles -vaultDir $args[0]
