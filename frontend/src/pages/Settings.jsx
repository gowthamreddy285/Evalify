import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { useNavigate } from 'react-router-dom';
import { deleteAccount } from '../utils/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const { addToast } = useInterview();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you absolutely sure? This will wipe your entire simulation history.');
    if (confirmed) {
      try {
        await deleteAccount();
        addToast('Account deleted successfully', 'success');
        logout();
        navigate('/');
      } catch (err) {
        addToast('Failed to delete account', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen py-24 px-6 bg-[#030303]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-12 noise-overlay shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-[#F5F5F5] uppercase tracking-tighter mb-12">Core Settings.</h1>

            <div className="space-y-8">
              <div className="p-8 rounded-3xl bg-[#030303] border border-white/5">
                <h2 className="text-[10px] font-black text-[#707070] uppercase tracking-widest mb-8">Security Protocol</h2>
                <div className="space-y-6">
                  <button onClick={() => navigate('/profile')} className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-[#F5F5F5] font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/5 text-left transition-all cursor-pointer">
                    Reset Authentication Key (Password)
                  </button>
                  <button onClick={() => navigate('/profile')} className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-[#F5F5F5] font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/5 text-left transition-all cursor-pointer">
                    Update Profile Details
                  </button>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#D4121B]/5 border border-[#D4121B]/10">
                <h2 className="text-[10px] font-black text-[#D4121B] uppercase tracking-widest mb-6">Danger Zone</h2>
                <p className="text-[#707070] text-xs font-medium mb-8 leading-relaxed">Permanently delete your account and purge all session data.</p>
                <button onClick={handleDelete}
                  className="py-4 px-8 bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-widest text-[10px] rounded-xl btn-shine transition-all cursor-pointer">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
