import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { changePassword, deleteAccount, updateProfile } from '../utils/api';
import { useInterview } from '../context/InterviewContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const { addToast } = useInterview();
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user?.name) setEditedName(user.name);
  }, [user]);

  const handleUpdateName = async () => {
    if (!editedName.trim()) return addToast('Name cannot be empty', 'error');
    setLoading(true);
    try {
      await updateProfile({ name: editedName });
      addToast('Profile updated!', 'success');
      setIsEditingName(false);
      refreshUser();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to update name', 'error');
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return addToast('Passwords do not match', 'error');
    if (newPassword.length < 8) return addToast('Password must be at least 8 characters', 'error');
    setLoading(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      addToast('Password updated!', 'success');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to change password', 'error');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      addToast('Account deleted. All data purged.', 'success');
      logout();
      navigate('/');
    } catch (err) {
      addToast('Failed to delete account', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-24 px-6 bg-[#030303]">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#F5F5F5] uppercase tracking-tighter mb-2">Profile.</h1>
            <p className="text-[#707070] text-sm font-medium tracking-tight">Manage your account settings</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] rounded-xl transition-all cursor-pointer">
            ← Back to Dashboard
          </button>
        </div>

        <div className="space-y-8">
          {/* Identity Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0A0A0A] border border-white/5 rounded-[32px] p-10 noise-overlay shadow-2xl">
            <p className="text-[10px] font-black text-[#707070] uppercase tracking-[0.3em] mb-10">Identity Details</p>
            <div className="flex items-center gap-8 mb-12">
              <div className="w-20 h-20 bg-[#D4121B] rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-[#D4121B]/20 uppercase">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1">
                {isEditingName ? (
                  <div className="flex items-center gap-4">
                    <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)}
                      className="bg-[#030303] border border-[#D4121B]/40 rounded-xl px-4 py-2 text-xl font-black text-[#F5F5F5] uppercase outline-none focus:ring-1 focus:ring-[#D4121B] transition-all w-full max-w-sm" autoFocus />
                    <button onClick={handleUpdateName} className="text-[10px] font-black uppercase text-[#D4121B] hover:text-[#FF3B3B] transition-all cursor-pointer">Save</button>
                    <button onClick={() => { setIsEditingName(false); setEditedName(user?.name); }} className="text-[10px] font-black uppercase text-[#707070] hover:text-[#F5F5F5] transition-all cursor-pointer">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 group">
                    <p className="text-2xl font-black text-[#F5F5F5] uppercase tracking-tight">{user?.name}</p>
                    <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase text-[#707070] hover:text-[#D4121B] cursor-pointer">Edit</button>
                  </div>
                )}
                <p className="text-[#707070] text-sm font-medium mt-1">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6 pt-8 border-t border-white/5">
              <p className="text-[10px] font-black text-[#D4121B] uppercase tracking-[0.2em] mb-6">Change Password</p>
              <div>
                <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-3 ml-1">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-3 ml-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#707070] uppercase tracking-widest mb-3 ml-1">Confirm New</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#030303] border border-white/5 rounded-2xl p-4 text-[#F5F5F5] focus:border-[#D4121B]/50 focus:ring-1 focus:ring-[#D4121B]/50 outline-none transition-all" required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="mt-4 px-8 py-4 bg-[#D4121B] hover:bg-[#E61A23] text-white font-bold rounded-xl transition-all uppercase tracking-widest text-[10px] disabled:opacity-50 cursor-pointer shadow-lg shadow-[#D4121B]/10">
                Update Password
              </button>
            </form>
          </motion.div>

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#0A0A0A] border border-[#D4121B]/10 rounded-[32px] p-10 noise-overlay shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4121B]/20" />
            <p className="text-[10px] font-black text-[#D4121B] uppercase tracking-[0.3em] mb-6">Danger Zone</p>
            <p className="text-[#707070] text-sm mb-10 leading-relaxed max-w-lg">Permanently delete your account and all session data. This cannot be reversed.</p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="px-10 py-4 bg-[#D4121B]/10 border border-[#D4121B]/20 text-[#D4121B] hover:bg-[#D4121B] hover:text-white font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px] cursor-pointer">
                Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={handleDeleteAccount} disabled={loading}
                  className="px-10 py-4 bg-[#D4121B] text-white hover:bg-[#E61A23] font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px] cursor-pointer">
                  Yes, Delete Everything
                </button>
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="px-10 py-4 border border-white/10 text-[#707070] hover:text-[#F5F5F5] font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px] cursor-pointer">
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
