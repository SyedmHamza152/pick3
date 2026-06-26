# Dev server with auto-reload + opens index.html in browser
$py = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $py)) {
    Write-Host "Create venv first:"
    Write-Host "  python -m venv .venv"
    Write-Host "  .\.venv\Scripts\python.exe -m pip install -r requirements.txt"
    exit 1
}
Set-Location $PSScriptRoot
& $py run_dev.py
