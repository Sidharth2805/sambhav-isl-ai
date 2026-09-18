@echo off
title Sambhav ISL AI - Real-time ML Inference Service
echo ========================================================
echo Starting Sambhav ISL AI Parquet BiLSTM Sign Recognition Service
echo Model: Parquet BiLSTM (252 features - 171 ISL Classes)
echo Port: 8000
echo ========================================================
python -m uvicorn parquet_backend:app --host 0.0.0.0 --port 8000 --reload
pause
