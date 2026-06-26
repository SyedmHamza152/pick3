# Start backend and frontend servers
$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$python = Join-Path $backend ".venv\Scripts\python.exe"
$node = "npm"

# Check backend virtual environment
if (-not (Test-Path $python)) {
    Write-Host "Backend virtual env not found. Run once:"
    Write-Host "  cd backend"
    Write-Host "  python -m venv .venv"
    Write-Host "  .\.venv\Scripts\python.exe -m pip install -r requirements.txt"
    exit 1
}

# Check frontend node_modules
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "Frontend dependencies not found. Installing..."
    Set-Location $frontend
    & $node install
    Set-Location $root
}

Write-Host "Starting backend API on port 8000..."
$backendJob = Start-Job -ScriptBlock {
    $python = Join-Path $using:backend ".venv\Scripts\python.exe"
    Set-Location $using:backend
    & $python run_dev.py
}

Write-Host "Starting Next.js frontend on port 3000..."
Set-Location $frontend
& $node run dev

# Cleanup when frontend stops
Stop-Job $backendJob
Remove-Job $backendJob
