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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return addToast('Please enter a valid email address', 'error');
    }

    // 2. Password Validation (Min 8 chars)
    if (password.length < 8) {
      return addToast('Password must be at least 8 characters long', 'error');
    }

    if (password !== confirmPassword) {
      return addToast('Passwords do not match', 'error');
    }
    if (!agree) {
      return addToast('You must agree to the terms', 'error');
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/signup`, { name, email, password });
      login(data.access_token);
      addToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Sign up failed', 'error');
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
      addToast(err.response?.data?.detail || 'Google login failed', 'error');
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
            <h1 className="text-4xl font-black text-[#F5F5F5] uppercase tracking-tighter mb-2">Create Account</h1>
            <p className="text-[#707070] text-sm font-medium tracking-tight">Start your interview preparation journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 pr-12 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#F5F5F5] transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m1.414-1.414A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.101-2.101L3 3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 pr-12 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all"
                    placeholder="Repeat password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#F5F5F5] transition-colors p-1"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m1.414-1.414A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.101-2.101L3 3" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-2">
              <input 
                type="checkbox" 
                id="terms"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 rounded border-white/5 bg-[#030303] text-[#D4121B] focus:ring-[#D4121B] accent-[#D4121B]"
              />
              <label htmlFor="terms" className="text-[10px] font-bold text-[#707070] uppercase tracking-widest cursor-pointer">
                I agree to the terms and conditions
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-widest text-[10px] btn-shine transition-all shadow-xl shadow-[#D4121B]/20"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-[#0A0A0A] text-[#707070] font-black uppercase tracking-widest">Or sign up with</span></div>
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
            Already have an account? <Link to="/login" className="text-[#D4121B] hover:text-[#FF3B3B] transition-colors ml-1">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
