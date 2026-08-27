@echo off
title Sambhav ISL AI - Real-time ML Inference Service
echo ========================================================
echo Starting Sambhav ISL AI Real-time Sign Recognition Service
echo Model: BiLSTM 169 Indian Sign Language Classes
echo Port: 8000
echo ========================================================
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
pause
