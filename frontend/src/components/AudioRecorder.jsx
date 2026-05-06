import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReactMediaRecorder } from 'react-media-recorder';

export default function AudioRecorder({ onSubmit, disabled }) {
  const [seconds, setSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: 'audio/webm' },
  });

  const isRecording = status === 'recording';
  const hasRecording = !!mediaBlobUrl && status === 'stopped';

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            // Final results can be handled if needed
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setLiveTranscript(interim || event.results[event.results.length - 1][0].transcript);
      };
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      setSeconds(0);
      setLiveTranscript('');
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Speech recognition already started or failed", e);
        }
      }
    } else {
      clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleSubmit = async () => {
    if (!mediaBlobUrl || disabled) return;
    const res = await fetch(mediaBlobUrl);
    const blob = await res.blob();
    onSubmit(blob);
    clearBlobUrl();
    setSeconds(0);
    setLiveTranscript('');
  };

  const handleRerecord = () => {
    clearBlobUrl();
    setSeconds(0);
    setLiveTranscript('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      {/* Mic button */}
      <div className="relative mb-8">
        {isRecording && (
          <>
            <div className="pulse-ring" />
            <div className="pulse-ring" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        <motion.button
          whileTap={{ scale: 0.93 }}
          animate={isRecording ? { scale: [1, 1.06, 1], opacity: [1, 0.85, 1] } : {}}
          transition={isRecording ? { repeat: Infinity, duration: 1.5 } : {}}
          onClick={isRecording ? stopRecording : hasRecording ? null : startRecording}
          disabled={disabled || hasRecording}
          className={`relative z-20 w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 disabled:opacity-50 ${isRecording ? 'bg-[#D4121B] shadow-[0_0_32px_rgba(212,18,27,0.4)]' : 'bg-[#1A1A24] border-2 border-[#2A2A3A] hover:border-[#D4121B]'}`}
          id="mic-btn"
        >
          {isRecording ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          ) : (
            <svg className="w-8 h-8 text-[#8B8BA0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
          )}
        </motion.button>
      </div>

      {/* Status text */}
      {!isRecording && !hasRecording && (
        <p className="text-sm text-[#8B8BA0] mb-4 font-medium tracking-tight">Tap to speak your answer</p>
      )}

      {/* Recording indicator + Live Transcript */}
      {isRecording && (
        <div className="flex flex-col items-center gap-6 mb-4 w-full max-w-md">
          <WaveformVisualizer stream={previewStream} isRecording={isRecording} />
          
          <div className="bg-[#0A0A0A]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 w-full min-h-[80px] flex items-center justify-center">
            <p className="text-[#F5F5F5] text-center italic text-sm leading-relaxed opacity-80 animate-pulse">
              {liveTranscript || "Listening..."}
            </p>
          </div>

          <p className="text-sm font-mono text-[#D4121B] font-bold">{fmt(seconds)}</p>
        </div>
      )}

      {/* Playback + actions */}
      {hasRecording && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="w-full max-w-sm space-y-4 relative z-20">
          <div className="bg-[#0A0A0A] rounded-2xl border border-[#2A2A3A] p-2">
            <audio src={mediaBlobUrl} controls className="w-full h-10" />
          </div>
          <p className="text-center text-xs text-[#8B8BA0] font-mono">Recorded • {fmt(seconds)}</p>
          <div className="flex gap-3">
            <button onClick={handleRerecord} className="flex-1 py-3.5 rounded-xl border border-[#2A2A3A] text-[#8B8BA0] hover:text-[#F5F5F5] hover:bg-white/5 transition-all cursor-pointer text-sm font-semibold">Re-record</button>
            <button onClick={handleSubmit} disabled={disabled} className="flex-1 py-3.5 bg-[#D4121B] hover:bg-[#E61A23] disabled:opacity-50 text-white font-bold rounded-xl btn-shine cursor-pointer shadow-lg shadow-[#D4121B]/20">Analyze Audio</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
