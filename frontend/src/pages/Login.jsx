import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useInterview();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return addToast('Please enter a valid email address', 'error');
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, { email, password });
      login(data.access_token);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Login failed', 'error');
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
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast('Google login failed', 'error');
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
            <h1 className="text-4xl font-black text-[#F5F5F5] uppercase tracking-tighter mb-2">Login</h1>
            <p className="text-[#707070] text-sm font-medium tracking-tight">Welcome back! Please enter your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-widest text-[10px] btn-shine transition-all shadow-xl shadow-[#D4121B]/20"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-[#0A0A0A] text-[#707070] font-black uppercase tracking-widest">Or login with</span></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => addToast('Google login failed', 'error')}
              theme="dark"
              shape="pill"
              text="signin_with"
              size="large"
              width="300"
            />
          </div>

          <p className="mt-10 text-center text-[10px] font-bold text-[#707070] uppercase tracking-widest">
            Don't have an account? <Link to="/signup" className="text-[#D4121B] hover:text-[#FF3B3B] transition-colors ml-1">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
