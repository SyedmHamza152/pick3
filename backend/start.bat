@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Create venv first: python -m venv .venv
  exit /b 1
)
.venv\Scripts\python.exe run_dev.py
