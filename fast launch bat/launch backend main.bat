@echo off
cd /d "your path"

REM Initialize conda for this shell
CALL "%USERPROFILE%\"

REM Activate your environment (change 'base' to your env name if needed)
CALL conda activate base

echo Starting main.py with Anaconda env...
python main.py

pause
