# Start Sambhav ML Python Service on Port 8000
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting Sambhav ISL ML Service (Port 8000) " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

$env:PYTHONPATH = "."
python -m uvicorn ml_service.app:app --host 127.0.0.1 --port 8000 --reload
