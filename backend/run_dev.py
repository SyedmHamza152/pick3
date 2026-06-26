"""
Local dev: opens http://127.0.0.1:8000/ (index.html) in your browser, then starts uvicorn --reload.

Usage (from backend folder):
  .\.venv\Scripts\python.exe run_dev.py
"""
import subprocess
import sys
import threading
import time
import webbrowser

def _app_url() -> str:
    # Cache-bust so external browsers never show an old saved index.html
    return f"http://127.0.0.1:8000/?v={int(time.time())}"


def _open_browser() -> None:
    url = _app_url()
    time.sleep(1.2)
    webbrowser.open(url)
    print(f"\n  Browser opened -> {url}\n")


if __name__ == "__main__":
    threading.Thread(target=_open_browser, daemon=True).start()
    raise SystemExit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.main:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
            ]
        )
    )
