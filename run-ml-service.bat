@echo off
title Sambhav ISL ML Service (Port 8000)
echo ===================================================
echo  Starting Sambhav ISL ML Python Service on Port 8000
echo ===================================================
set PYTHONPATH=.
python -m uvicorn ml_service.app:app --host 127.0.0.1 --port 8000 --reload
pause
