import { useEffect, useRef } from 'react';

export default function WaveformVisualizer({ stream, isRecording }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (isRecording && stream) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => stopVisualization();
  }, [isRecording, stream]);

  const startVisualization = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256;

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Use a gradient-like color
        ctx.fillStyle = `rgba(212, 18, 27, ${dataArray[i] / 255 + 0.1})`;
        
        // Draw symmetric bars
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  return (
    <div className="w-full h-16 flex items-center justify-center overflow-hidden rounded-xl bg-black/20 border border-white/5 relative group">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={64} 
        className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
      />
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="flex gap-1">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="w-1 h-2 bg-white/5 rounded-full" />
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
