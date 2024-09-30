function Copy-PluginFiles {
    $cb = Get-Clipboard
    if (-not (Test-Path $cb -PathType Container)) {
        "Run this .ps1 after coping vault folder path." | Write-Host -ForegroundColor Red
        return
    }

    $obsidianPath = $cb | Join-Path -ChildPath ".obsidian\plugins\obsidian-bookscrap"
    if (-not (Test-Path $obsidianPath -PathType Container)) {
        New-Item $obsidianPath -ItemType Directory
    }

    Get-ChildItem -Path @("main.js", "styles.css", "manifest.json") | Copy-Item -Destination $obsidianPath
}

Copy-PluginFiles
