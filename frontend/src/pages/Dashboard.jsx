import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
    ? Math.round(history.reduce((a, b) => a + b.overall_score, 0) / history.length) 
    : 0;

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
          {/* Performance Graph */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-[32px] p-8 noise-overlay shadow-xl h-[400px]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-[#F5F5F5] uppercase tracking-tight">Performance Matrix</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D4121B]" />
                <span className="text-[10px] font-black text-[#707070] uppercase tracking-widest">Efficiency Index</span>
              </div>
            </div>
            
            <div className="h-[280px] w-full">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4121B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4121B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#707070', fontSize: 10, fontWeight: 900 }}
                      dy={10}
                    />
                    <YAxis 
                      hide={true} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#D4121B', fontWeight: 900 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#D4121B" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-[#707070] text-[10px] font-black uppercase tracking-widest">No data points available</p>
                </div>
              )}
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
          className="mt-12 bg-[#0A0A0A] border border-white/5 rounded-[32px] overflow-hidden noise-overlay shadow-xl"
        >
          <div className="p-8 border-b border-white/5">
            <h2 className="text-lg font-black text-[#F5F5F5] uppercase tracking-tight">Archive Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] font-black text-[#707070] uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#707070] uppercase tracking-widest">Job Objective</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#707070] uppercase tracking-widest">Complexity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#707070] uppercase tracking-widest text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length > 0 ? history.map((h, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6 text-sm font-medium text-[#F5F5F5] opacity-60">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-[#F5F5F5] uppercase tracking-tight">
                      {h.job_role}
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-[10px] font-black uppercase tracking-widest text-[#707070] border border-white/5">
                        {h.difficulty}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-lg font-black" style={{ color: h.overall_score >= 80 ? '#D4121B' : '#F5F5F5' }}>
                        {h.overall_score}%
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center text-[#333] font-black uppercase tracking-[0.3em] text-xs">
                      No session records found in the archive
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
