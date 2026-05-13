import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPw) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/signup`, { name: name.trim(), email, password });
      login(data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.post(`${API_BASE}/auth/google`, { token: credentialResponse.credential });
      login(data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const pwColors = ['', '#D4121B', '#E6A817', '#22C55E'];
  const pwLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] px-6 relative overflow-hidden">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#D4121B] opacity-[0.04] blur-[120px] -top-40 -right-40 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#B4121B] opacity-[0.03] blur-[100px] bottom-0 left-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-[32px] p-10 md:p-12 noise-overlay shadow-[0_24px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-[#D4121B] to-transparent" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2.5 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4121B] shadow-[0_0_12px_#D4121B]" />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#F5F5F5]">Evalify</span>
              </div>
              <h1 className="text-3xl font-black text-[#F5F5F5] uppercase tracking-[-0.03em] mb-2">Create Account</h1>
              <p className="text-sm text-[#707070] font-medium">Begin your interview mastery journey</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-[#D4121B]/10 border border-[#D4121B]/20">
                <p className="text-xs text-[#D4121B] font-bold text-center">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-[#707070] uppercase tracking-[0.2em] mb-3 ml-1" htmlFor="signup-name">Username</label>
                <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name"
                  className="w-full bg-[#030303] border border-white/[0.06] rounded-2xl px-5 py-4 text-[#F5F5F5] text-sm font-medium placeholder:text-[#333] focus:border-[#D4121B]/40 focus:ring-1 focus:ring-[#D4121B]/30 outline-none transition-all" required />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#707070] uppercase tracking-[0.2em] mb-3 ml-1" htmlFor="signup-email">Email Address</label>
                <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-[#030303] border border-white/[0.06] rounded-2xl px-5 py-4 text-[#F5F5F5] text-sm font-medium placeholder:text-[#333] focus:border-[#D4121B]/40 focus:ring-1 focus:ring-[#D4121B]/30 outline-none transition-all" required autoComplete="email" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#707070] uppercase tracking-[0.2em] mb-3 ml-1" htmlFor="signup-password">Password</label>
                <div className="relative">
                  <input id="signup-password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters"
                    className="w-full bg-[#030303] border border-white/[0.06] rounded-2xl px-5 pr-14 py-4 text-[#F5F5F5] text-sm font-medium placeholder:text-[#333] focus:border-[#D4121B]/40 focus:ring-1 focus:ring-[#D4121B]/30 outline-none transition-all" required autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#707070] hover:text-[#F5F5F5] uppercase tracking-wider transition-colors cursor-pointer" tabIndex={-1}>
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex items-center gap-3 mt-3 ml-1">
                    <div className="flex gap-1.5 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300" style={{ backgroundColor: i <= pwStrength ? pwColors[pwStrength] : '#1A1A1A' }} />
                      ))}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#707070] uppercase tracking-[0.2em] mb-3 ml-1" htmlFor="signup-confirm">Confirm Password</label>
                <input id="signup-confirm" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Re-enter password"
                  className="w-full bg-[#030303] border border-white/[0.06] rounded-2xl px-5 py-4 text-[#F5F5F5] text-sm font-medium placeholder:text-[#333] focus:border-[#D4121B]/40 focus:ring-1 focus:ring-[#D4121B]/30 outline-none transition-all" required autoComplete="new-password" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-3 py-4 bg-[#D4121B] hover:bg-[#E61A23] disabled:opacity-50 text-white font-black uppercase tracking-[0.15em] text-[11px] rounded-2xl btn-shine cursor-pointer transition-all shadow-[0_8px_32px_rgba(212,18,27,0.3)] hover:shadow-[0_12px_48px_rgba(212,18,27,0.4)] active:scale-[0.98]">
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : 'Create Account →'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-[1px] bg-white/[0.04]" />
              <span className="text-[10px] font-bold text-[#333] uppercase tracking-widest">OR</span>
              <div className="flex-1 h-[1px] bg-white/[0.04]" />
            </div>

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="signup_with"
              />
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-[1px] bg-white/[0.04]" />
              <span className="text-[10px] font-bold text-[#333] uppercase tracking-widest">Already registered?</span>
              <div className="flex-1 h-[1px] bg-white/[0.04]" />
            </div>

            <Link to="/login" className="block w-full py-4 text-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-[#707070] hover:text-[#F5F5F5] hover:border-[#D4121B]/30 hover:bg-white/[0.04] font-black uppercase tracking-[0.15em] text-[11px] transition-all">
              Sign In Instead
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
