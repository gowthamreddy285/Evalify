import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSessionDetail } from '../utils/api';
import { useInterview } from '../context/InterviewContext';
import ScoreCircle from '../components/ScoreCircle';
import FeedbackAccordion from '../components/FeedbackAccordion';
import LoadingOverlay from '../components/LoadingOverlay';

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useInterview();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [sessionId]);

  const fetchDetail = async () => {
    try {
      const data = await getSessionDetail(sessionId);
      setSession(data);
    } catch (err) {
      addToast('Failed to load session details', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay show={true} />;
  if (!session) return null;

  return (
    <div className="min-h-screen py-24 px-6 bg-[#030303]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <motion.button 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#707070] hover:text-[#D4121B] transition-all"
          >
            <span>←</span> Back to Dashboard
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#D4121B]/10 border border-[#D4121B]/20 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4121B]">Archive Review</span>
            </div>
            <h1 className="text-5xl font-black text-[#F5F5F5] uppercase tracking-tighter mb-4">
              {session.jd_data?.job_role || 'General Interview'}
            </h1>
            <p className="text-[#707070] font-medium tracking-tight mb-8">
              Conducted on {new Date(session.created_at).toLocaleDateString()}
            </p>
            
            <div className="flex gap-4">
              <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 px-8 noise-overlay">
                <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest mb-1">Difficulty</p>
                <p className="text-xl font-black text-[#F5F5F5] uppercase tracking-tight">{session.difficulty}</p>
              </div>
              <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 px-8 noise-overlay">
                <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest mb-1">Mode</p>
                <p className="text-xl font-black text-[#F5F5F5] uppercase tracking-tight">{session.answer_mode}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center bg-[#0A0A0A] border border-white/5 rounded-[40px] p-12 noise-overlay shadow-2xl"
          >
             <ScoreCircle score={session.final_score || 0} />
             <p className="mt-8 text-[10px] font-black text-[#707070] uppercase tracking-[0.4em]">Final Index</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-xl font-black uppercase tracking-tight">Performance Registry</h2>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          
          <FeedbackAccordion 
            results={session.questions.map(q => q.answer).filter(a => a !== null)} 
            questions={session.questions} 
          />
        </motion.div>
      </div>
    </div>
  );
}

