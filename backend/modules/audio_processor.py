import os
from groq import Groq

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ✅ FIX: Whole-word regex patterns
import re
FILLER_PATTERNS = [
    re.compile(rf"\b{word}\b", re.IGNORECASE)
    for word in ["um", "uh", "like", "basically", "actually"]
]

def transcribe_audio(file_path):
    """Uses Groq's high-speed Whisper API with local Whisper fallback"""
    
    # 1. Try Groq first (Fastest)
    if GROQ_API_KEY:
        print(f"[audio_processor] Attempting Groq transcription: {file_path}")
        client = Groq(api_key=GROQ_API_KEY)
        try:
            with open(file_path, "rb") as file:
                transcription = client.audio.transcriptions.create(
                    file=(os.path.basename(file_path), file),
                    model="whisper-large-v3",
                    response_format="json",
                    language="en"
                )
            print(f"[audio_processor] Groq Transcription successful: {transcription.text[:50]}...")
            return transcription.text
        except Exception as e:
            print(f"[audio_processor] Groq API Error: {str(e)}. Falling back to local Whisper...")
    
    # 2. Fallback to Local Whisper (Robust)
    try:
        import whisper
        print(f"[audio_processor] Loading local Whisper model...")
        model = whisper.load_model("base")
        print(f"[audio_processor] Transcribing locally: {file_path}")
        result = model.transcribe(file_path)
        print(f"[audio_processor] Local Transcription successful: {result['text'][:50]}...")
        return result['text']
    except Exception as e:
        print(f"[audio_processor] Local Whisper Error: {str(e)}")
        raise ValueError(f"Transcription failed on both Groq and Local: {str(e)}")



def detect_fillers(text):
    return sum(len(pattern.findall(text)) for pattern in FILLER_PATTERNS)


def evaluate_audio(file_path):
    """MAIN FUNCTION — transcribes audio and returns delivery score"""
    try:
        text = transcribe_audio(file_path)
        if not text or not text.strip():
            return {
                "transcription": "[No speech detected]",
                "delivery_score": 0,
                "filler_count": 0
            }
            
        filler_count = detect_fillers(text)
        delivery_score = max(0, 100 - filler_count * 8)

        return {
            "transcription": text,
            "delivery_score": delivery_score,
            "filler_count": filler_count
        }
    except Exception as e:
        print(f"[audio_processor] Full Evaluation Error: {e}")
        raise e
