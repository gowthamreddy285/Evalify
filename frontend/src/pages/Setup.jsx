import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '../context/InterviewContext';
import { generateQuestions } from '../utils/api';
import Stepper from '../components/Stepper';
import ResumeUpload from '../components/ResumeUpload';
import JDInput from '../components/JDInput';
import DifficultyPicker from '../components/DifficultyPicker';

export default function Setup() {
  const navigate = useNavigate();
  const { state, dispatch, addToast } = useInterview();
  const [step, setStep] = useState(1);

  const handleStart = async () => {
    if (!state.resumeData) { addToast('Please upload your resume first', 'error'); return; }
    if (!state.jdData) { addToast('Please add a job description', 'error'); return; }

    try {
      addToast('Generating questions...', 'info');
      const data = await generateQuestions({
        resume_data: state.resumeData,
        jd_data: state.jdData,
        difficulty: state.difficulty,
      });
      dispatch({ type: 'SET_QUESTIONS', payload: data.questions || data });
      addToast('Questions ready! Let\'s go.', 'success');
      navigate('/interview/session');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to generate questions', 'error');
    }
  };

  return (
    <div className="min-h-screen py-20 px-6 bg-[#030303]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black mb-4 tracking-[-0.03em] uppercase"
          >
            Configure <span className="gradient-text">Simulator</span>
          </motion.h1>
          <p className="text-[#707070] text-sm font-medium tracking-tight">Complete each step to calibrate your mock interview experience.</p>
        </div>

        <div className="mb-16">
          <Stepper currentStep={step} />
        </div>

        <div className="bg-[#0A0A0A] rounded-[24px] border border-white/5 p-10 noise-overlay shadow-2xl min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.4}} className="flex-1 flex flex-col">
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-2 tracking-tight">Upload Your Resume</h2>
                  <p className="text-xs text-[#707070]">We extract your skills and experience to generate relevant questions.</p>
                </div>
                <ResumeUpload onComplete={() => setStep(2)} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.4}} className="flex-1 flex flex-col">
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-2 tracking-tight">Job Description</h2>
                  <p className="text-xs text-[#707070]">Paste the target role details to align the interview focus.</p>
                </div>
                <JDInput onComplete={() => setStep(3)} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.4}} className="flex-1 flex flex-col">
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-2 tracking-tight">Interview Settings</h2>
                  <p className="text-xs text-[#707070]">Choose the difficulty level that matches your career goals.</p>
                </div>
                <DifficultyPicker onStart={handleStart} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back button */}
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="mt-12 mx-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#707070] hover:text-[#D4121B] transition-all cursor-pointer group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}
