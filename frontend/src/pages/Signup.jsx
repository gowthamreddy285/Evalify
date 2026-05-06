import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useInterview();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/signup`, { name, email, password });
      login(data.access_token);
      addToast('Registry successful! Welcome to Evalify.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Registry failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/google-login`, {
        credential: credentialResponse.credential,
      });
      login(data.access_token);
      addToast('Welcome to Evalify!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast('Google registry failed', 'error');
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
            <h1 className="text-4xl font-black text-[#F5F5F5] uppercase tracking-tighter mb-2">Registry</h1>
            <p className="text-[#707070] text-sm font-medium tracking-tight">Initiate your performance tracking</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Operative Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                placeholder="Agent Smith"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Email Registry</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                placeholder="commander@evalify.com"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Access Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-widest text-[10px] btn-shine transition-all shadow-xl shadow-[#D4121B]/20"
            >
              {loading ? 'Processing...' : 'Complete Registry'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-[#0A0A0A] text-[#707070] font-black uppercase tracking-widest">Quick Start via</span></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => addToast('Google login failed', 'error')}
              theme="dark"
              shape="pill"
              text="signup_with"
              size="large"
              width="300"
            />
          </div>

          <p className="mt-10 text-center text-[10px] font-bold text-[#707070] uppercase tracking-widest">
            Existing operative? <Link to="/login" className="text-[#D4121B] hover:text-[#FF3B3B] transition-colors ml-1">Secure Entry</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
