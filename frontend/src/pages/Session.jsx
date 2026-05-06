import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '../context/InterviewContext';
import { evaluateText, evaluateAudio, transcribe } from '../utils/api';
import { DIFFICULTIES } from '../utils/constants';
import QuestionCard from '../components/QuestionCard';
import TextAnswerInput from '../components/TextAnswerInput';
import AudioRecorder from '../components/AudioRecorder';
import ScoreCard from '../components/ScoreCard';
import LoadingOverlay from '../components/LoadingOverlay';
import ProgressBar from '../components/ProgressBar';

export default function Session() {
  const navigate = useNavigate();
  const { state, dispatch, addToast } = useInterview();
  const { questions, currentQuestionIndex, answerMode, difficulty } = state;

  const [processing, setProcessing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  const total = questions.length;
  const current = questions[currentQuestionIndex];
  const diffConfig = DIFFICULTIES.find(d => d.key === difficulty);
  const isLast = currentQuestionIndex >= total - 1;

  // Redirect if no questions
  useEffect(() => {
    if (!Array.isArray(questions) || !questions.length) {
      addToast('No interview session active. Please set up your interview.', 'warning');
      navigate('/interview/setup');
    }
  }, [questions, navigate, addToast]);

  const handleTextSubmit = (text) => {
    dispatch({ type: 'ADD_ANSWER', payload: { type: 'text', content: text } });
    handleNext();
  };

  const handleAudioSubmit = async (blob) => {
    setProcessing(true);
    try {
      const res = await transcribe(blob);
      setLastTranscript(res.transcription);
      // We don't dispatch yet, we let the user edit first
    } catch (err) {
      addToast('Transcription failed. Please try typing.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmTranscript = () => {
    dispatch({ type: 'ADD_ANSWER', payload: { type: 'audio', content: lastTranscript } });
    setLastTranscript('');
    handleNext();
  };

  const handleDiscardTranscript = () => {
    setLastTranscript('');
  };

  const handleNext = () => {
    if (isLast) {
      navigate('/interview/results');
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
      setLastTranscript('');
    }
  };

  const handleSkip = () => {
    dispatch({ type: 'ADD_ANSWER', payload: { type: 'skip', content: '[Skipped]' } });
    handleNext();
  };

  if (!current) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#030303] pt-0">
      {/* Top progress bar */}
      <div className="w-full">
        <ProgressBar value={currentQuestionIndex + 1} max={total} height="h-[4px]" color="#D4121B" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#707070] font-bold mb-1">Session Progress</span>
            <span className="text-sm font-mono text-[#707070]">
              <span className="text-[#F5F5F5] font-bold">{currentQuestionIndex + 1}</span>
              <span className="mx-1">/</span>
              <span>{total}</span>
            </span>
          </div>
          <div className="h-8 w-[1px] bg-white/5" />
          {diffConfig && (
            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border" style={{ backgroundColor: `${diffConfig.color}10`, color: diffConfig.color, borderColor: `${diffConfig.color}20` }}>
              {diffConfig.label}
            </span>
          )}
        </div>
        <button onClick={handleSkip} className="text-xs font-bold uppercase tracking-widest text-[#707070] hover:text-[#D4121B] transition-all cursor-pointer flex items-center gap-2 group">
          Skip Question
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 grid lg:grid-cols-2 gap-8 p-8 max-w-[1600px] mx-auto w-full">
        {/* Left - Question */}
        <div className="flex flex-col h-full">
          <AnimatePresence mode="wait">
            <QuestionCard key={currentQuestionIndex} question={current} index={currentQuestionIndex} total={total} />
          </AnimatePresence>
        </div>

        {/* Right - Input Area */}
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestionIndex + (lastTranscript ? '-edit' : '-input')} 
              initial={{opacity:0, y: 20}} 
              animate={{opacity:1, y: 0}} 
              exit={{opacity:0, y: -20}} 
              transition={{duration:0.4, ease: [0.23, 1, 0.32, 1]}} 
              className="h-full"
            >
              <div className="bg-[#0A0A0A] rounded-[24px] border border-white/5 p-8 h-full relative noise-overlay shadow-2xl">
                <div className="relative z-10 h-full flex flex-col">
                  {/* Mode Switcher */}
                  {!lastTranscript && !processing && (
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-sm font-bold text-[#F5F5F5] tracking-tight">Your Response</h3>
                      <div className="bg-[#030303] rounded-full p-1 border border-white/5 flex items-center shadow-inner">
                        <button 
                          onClick={() => dispatch({ type: 'SET_ANSWER_MODE', payload: 'speak' })}
                          className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${answerMode === 'speak' ? 'bg-[#D4121B] text-white shadow-lg shadow-[#D4121B]/20' : 'text-[#707070] hover:text-[#F5F5F5]'}`}
                        >
                          Voice
                        </button>
                        <button 
                          onClick={() => dispatch({ type: 'SET_ANSWER_MODE', payload: 'type' })}
                          className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${answerMode === 'type' ? 'bg-[#D4121B] text-white shadow-lg shadow-[#D4121B]/20' : 'text-[#707070] hover:text-[#F5F5F5]'}`}
                        >
                          Text
                        </button>
                      </div>
                    </div>
                  )}

                  {lastTranscript ? (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex-1 flex flex-col h-full">
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-[#F5F5F5] mb-2">Review Transcription</h3>
                        <p className="text-xs text-[#707070]">We've converted your speech to text. You can edit it below if there are any mistakes.</p>
                      </div>
                      
                      <div className="flex-1 relative mb-6">
                        <textarea
                          value={lastTranscript}
                          onChange={(e) => setLastTranscript(e.target.value)}
                          className="w-full h-full bg-[#030303] border border-white/10 rounded-2xl p-6 text-[#F5F5F5] text-lg leading-relaxed focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all resize-none font-medium"
                          placeholder="Your transcribed answer..."
                        />
                        <div className="absolute bottom-4 right-4 pointer-events-none">
                          <span className="text-[10px] font-bold text-[#707070] uppercase tracking-widest bg-[#0A0A0A] px-2 py-1 rounded border border-white/5">Editable</span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button 
                          onClick={handleDiscardTranscript}
                          className="flex-1 py-4 rounded-xl border border-white/10 text-[#707070] hover:text-[#F5F5F5] hover:bg-white/5 transition-all font-bold text-sm cursor-pointer"
                        >
                          Discard & Re-take
                        </button>
                        <button 
                          onClick={handleConfirmTranscript}
                          className="flex-[1.5] py-4 bg-[#D4121B] hover:bg-[#E61A23] text-white font-bold rounded-xl shadow-xl shadow-[#D4121B]/20 transition-all cursor-pointer btn-shine"
                        >
                          Confirm & Continue
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      {answerMode === 'type' ? (
                        <TextAnswerInput onSubmit={handleTextSubmit} disabled={processing} />
                      ) : (
                        <AudioRecorder onSubmit={handleAudioSubmit} disabled={processing} />
                      )}
                    </div>
                  )}
                </div>
                <LoadingOverlay show={processing} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
