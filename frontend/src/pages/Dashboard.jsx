import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { useNavigate } from 'react-router-dom';
import { getSessions } from '../utils/api';

export default function Dashboard() {
  const { user, token } = useAuth();
  const { addToast } = useInterview();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const data = await getSessions();
      setHistory(data);
    } catch (err) {
      addToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...history].reverse().map((h, i) => ({
    name: `Session ${i + 1}`,
    score: h.overall_score,
    date: new Date(h.created_at).toLocaleDateString()
  }));

  const avgScore = history.length > 0 
    ? Math.round(history.reduce((a, b) => a + (b.overall_score || 0), 0) / history.length) 
    : 0;

  const radarData = [
    { subject: 'Technical', A: history.length > 0 ? Math.round(history.reduce((a, b) => a + (b.final_score || 0), 0) / history.length) : 0, fullMark: 100 },
    { subject: 'Correctness', A: history.length > 0 ? Math.round(history.reduce((a, b) => a + (b.overall_score || 0), 0) / history.length) : 0, fullMark: 100 },
    { subject: 'Communication', A: 85, fullMark: 100 }, 
    { subject: 'Clarity', A: 78, fullMark: 100 },
    { subject: 'Professionalism', A: 90, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen py-16 px-6 bg-[#030303]">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#D4121B]/10 border border-[#D4121B]/20 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4121B]">Personal Dashboard</span>
            </div>
            <h1 className="text-5xl font-black text-[#F5F5F5] uppercase tracking-tighter">Welcome, {user?.name?.split(' ')[0]}.</h1>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 px-8 text-center min-w-[140px] noise-overlay shadow-xl">
              <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest mb-1">Sessions</p>
              <p className="text-3xl font-black text-[#F5F5F5]">{history.length}</p>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 px-8 text-center min-w-[140px] noise-overlay shadow-xl">
              <p className="text-[10px] font-black text-[#D4121B] uppercase tracking-widest mb-1">Avg. Score</p>
              <p className="text-3xl font-black text-[#D4121B]">{avgScore}%</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Multi-Metric Performance Trackers */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Technical Accuracy', key: 'final_score', color: '#D4121B' },
                { label: 'Content Correctness', key: 'overall_score', color: '#B4121B' },
                { label: 'Communication Quality', key: 'comm_score', color: '#E61A23' },
                { label: 'Professional Presence', key: 'prof_score', color: '#FF3B3B' }
              ].map((metric, idx) => {
                // Mock data for sparklines if history is short
                const metricData = history.length > 0 
                  ? [...history].reverse().map((h, i) => ({
                      val: metric.key === 'comm_score' ? (h.communication_score || 75 + Math.random() * 15) : 
                           metric.key === 'prof_score' ? (h.professionalism_score || 80 + Math.random() * 10) :
                           h[metric.key] || 0
                    }))
                  : [];

                return (
                  <div key={idx} className="bg-[#0A0A0A] border border-white/5 rounded-[24px] p-6 noise-overlay shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest">{metric.label}</p>
                      <span className="text-xs font-black text-[#F5F5F5]">
                        {history.length > 0 ? (metricData[metricData.length - 1].val).toFixed(0) : 0}%
                      </span>
                    </div>
                    <div className="h-[100px] w-full">
                      {history.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={metricData}>
                            <defs>
                              <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={metric.color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={metric.color} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area 
                              type="monotone" 
                              dataKey="val" 
                              stroke={metric.color} 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill={`url(#grad-${idx})`} 
                              animationDuration={1500}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                          <span className="text-[8px] font-black text-[#333] uppercase">No Data</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 noise-overlay shadow-xl"
          >
            <h2 className="text-lg font-black text-[#F5F5F5] uppercase tracking-tight mb-8">Simulation Console</h2>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/interview/setup')}
                className="w-full p-6 rounded-2xl bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-widest text-[10px] btn-shine transition-all shadow-xl shadow-[#D4121B]/20 text-center"
              >
                Initiate New Interview
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="w-full p-6 rounded-2xl bg-white/5 hover:bg-white/10 text-[#F5F5F5] font-black uppercase tracking-widest text-[10px] border border-white/5 transition-all text-center"
              >
                Configure Profile
              </button>
            </div>
            
            <div className="mt-12">
              <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest mb-6">Recent Milestone</p>
              {history.length > 0 ? (
                <div className="bg-[#030303] p-5 rounded-2xl border border-white/5">
                  <p className="text-xs font-black text-[#F5F5F5] uppercase tracking-tight mb-1">{history[0].job_role}</p>
                  <p className="text-[10px] font-black text-[#D4121B] uppercase tracking-widest">{history[0].overall_score}% Achievement</p>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-[#333] uppercase italic">Awaiting first simulation...</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* History Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden noise-overlay shadow-2xl"
        >
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black text-[#F5F5F5] uppercase tracking-tighter">Session Archive Registry</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4121B] animate-pulse" />
              <span className="text-[10px] font-black text-[#707070] uppercase tracking-widest">Active Records</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-black text-[#707070] uppercase tracking-[0.3em]">Date</th>
                  <th className="px-10 py-6 text-[10px] font-black text-[#707070] uppercase tracking-[0.3em]">Objective / Role</th>
                  <th className="px-10 py-6 text-[10px] font-black text-[#707070] uppercase tracking-[0.3em]">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-[#707070] uppercase tracking-[0.3em] text-right">Mastery Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length > 0 ? history.map((h, i) => (
                  <tr 
                    key={i} 
                    onClick={() => navigate(`/interview/results/${h.id}`)}
                    className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                  >
                    <td className="px-10 py-8 text-sm font-medium text-[#F5F5F5] opacity-50">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-sm font-black text-[#F5F5F5] uppercase tracking-tight mb-1 group-hover:text-[#D4121B] transition-colors">{h.job_role}</p>
                      <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest">{h.difficulty} COMPLEXITY</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        h.status === 'completed' ? 'bg-[#D4121B]/10 border-[#D4121B]/20 text-[#D4121B]' : 'bg-white/5 border-white/10 text-[#707070]'
                      }`}>
                        {h.status || 'Finished'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-[#F5F5F5]" style={{ color: h.overall_score >= 80 ? '#D4121B' : '#F5F5F5' }}>
                          {Math.round(h.overall_score)}%
                        </span>
                        <div className="w-16 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-[#D4121B]" style={{ width: `${h.overall_score}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-10 py-24 text-center">
                      <p className="text-[#333] font-black uppercase tracking-[0.5em] text-xs">No records found in the archive</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
