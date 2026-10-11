@echo off
title Sambhav ISL AI - Real-time ML Inference Service
echo ========================================================
echo Starting Sambhav ISL AI Saanket BiLSTM Sign Recognition Service
echo Model: Saanket BiLSTM (126 features - 169 ISL Classes)
echo Port: 8000
echo ========================================================
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
pause
