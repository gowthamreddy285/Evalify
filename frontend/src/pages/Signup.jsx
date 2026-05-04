import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useInterview();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/signup', { name, email, password });
      login(res.data.access_token);
      addToast('Account created successfully', 'success');
      navigate('/interview/setup');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#030303]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#0A0A0A] border border-white/5 rounded-[32px] p-10 noise-overlay shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#F5F5F5] uppercase tracking-tighter mb-2">Initialize.</h1>
            <p className="text-[#707070] text-xs font-black uppercase tracking-[0.2em]">Create your assessment profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-xl px-5 py-4 text-[#F5F5F5] focus:border-[#D4121B] focus:outline-none transition-all font-medium"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-xl px-5 py-4 text-[#F5F5F5] focus:border-[#D4121B] focus:outline-none transition-all font-medium"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-xl px-5 py-4 text-[#F5F5F5] focus:border-[#D4121B] focus:outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl btn-shine transition-all shadow-xl shadow-[#D4121B]/20 disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating Account...' : 'Create Profile →'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#707070] text-[10px] font-black uppercase tracking-widest">
              Already have an profile? <Link to="/login" className="text-[#D4121B] hover:text-[#FF3B3B] transition-colors ml-1">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
