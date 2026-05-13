@echo off
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Ensuring required packages are installed...
pip install google-auth

echo Starting FastAPI Backend...
python main.py
pause
