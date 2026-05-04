import whisper
import os

try:
    print("Loading model...")
    model = whisper.load_model("base")
    print("Model loaded successfully.")
    # Create a dummy silent audio file or just check if it loads
except Exception as e:
    print(f"Error loading whisper: {e}")
