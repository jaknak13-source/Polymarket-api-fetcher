@echo off
cd /d "your path "

REM Activate venv if you use one (uncomment and adjust next line)
REM call ".venv\Scripts\activate.bat"

echo Starting run_public_api.py...
python run_public_api.py

pause
