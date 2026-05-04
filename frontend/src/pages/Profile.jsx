import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import axios from 'axios';

export default function Profile() {
  const { user, token } = useAuth();
  const { addToast } = useInterview();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const handleUpdate = async () => {
    // Note: Backend profile update endpoint not yet implemented, but UI is ready
    addToast('Profile update feature coming soon', 'info');
    setEditing(false);
  };

  return (
    <div className="min-h-screen py-24 px-6 bg-[#030303]">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0A0A0A] border border-white/5 rounded-[40px] p-12 noise-overlay shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-24 h-24 rounded-3xl bg-[#D4121B] flex items-center justify-center text-4xl font-black text-white mb-6 shadow-2xl shadow-[#D4121B]/40">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h1 className="text-3xl font-black text-[#F5F5F5] uppercase tracking-tighter mb-2">{user?.name}</h1>
              <p className="text-[#707070] text-[10px] font-black uppercase tracking-[0.3em]">{user?.email}</p>
            </div>

            <div className="space-y-8">
              <div className="p-8 rounded-3xl bg-[#030303] border border-white/5">
                <p className="text-[10px] font-black text-[#707070] uppercase tracking-widest mb-6 italic">Identity Matrix</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-[#333] uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    {editing ? (
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#D4121B]/30 rounded-xl px-5 py-4 text-[#F5F5F5] focus:border-[#D4121B] focus:outline-none transition-all font-bold"
                      />
                    ) : (
                      <p className="text-lg font-black text-[#F5F5F5] tracking-tight uppercase px-1">{user?.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-[#333] uppercase tracking-widest mb-2 ml-1">Email Authority</label>
                    <p className="text-lg font-black text-[#707070] tracking-tight uppercase px-1">{user?.email}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#333] uppercase tracking-widest mb-2 ml-1">Archive Induction</label>
                    <p className="text-lg font-black text-[#707070] tracking-tight uppercase px-1">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {editing ? (
                  <>
                    <button onClick={handleUpdate} className="flex-1 py-4 bg-[#D4121B] text-white font-black uppercase tracking-widest text-xs rounded-xl btn-shine shadow-xl shadow-[#D4121B]/20">Commit Changes</button>
                    <button onClick={() => setEditing(false)} className="px-8 py-4 bg-white/5 text-[#F5F5F5] font-black uppercase tracking-widest text-xs rounded-xl border border-white/5">Abort</button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-[#F5F5F5] font-black uppercase tracking-widest text-xs rounded-xl border border-white/5 transition-all">Modify Identity Profile</button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
