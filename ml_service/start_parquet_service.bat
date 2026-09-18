@echo off
title Sambhav ISL AI - Parquet BiLSTM 252-Feature Real-time Recognition
echo ========================================================
echo Starting Sambhav ISL AI Parquet BiLSTM ML Service
echo Model: Parquet BiLSTM (126 landmarks + 126 velocity = 252 features)
echo Port: 8000
echo Realtime Endpoint: ws://127.0.0.1:8000/ws/realtime
echo ========================================================
python -m uvicorn parquet_backend:app --host 0.0.0.0 --port 8000 --reload
pause
