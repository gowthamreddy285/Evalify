import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout, token, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Hide Navbar during active interview session
  if (loading || location.pathname === '/interview/session') return null;

  return (
    <motion.nav 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between pointer-events-none"
    >
      <div className="flex items-center gap-6 pointer-events-auto">
        <button 
          onClick={() => navigate('/')} 
          className="bg-[#0A0A0A] border border-white/5 px-4 py-2.5 rounded-xl noise-overlay cursor-pointer hover:border-[#D4121B]/50 transition-all text-[10px] font-black uppercase tracking-widest text-[#707070] hover:text-[#D4121B]"
        >
          Home
        </button>
        <div className="flex items-center gap-2.5 ml-2">
          <div className="w-2 h-2 rounded-full bg-[#D4121B] shadow-[0_0_8px_#D4121B]" />
          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#F5F5F5] select-none">Evalify</span>
        </div>
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">
        {token ? (
          <>
            <button onClick={() => navigate('/dashboard')} className="group flex items-center gap-3 bg-[#0A0A0A] border border-white/5 px-5 py-2.5 rounded-2xl noise-overlay cursor-pointer transition-all hover:border-[#D4121B]/30 mr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4121B] opacity-50" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F5F5F5]">Dashboard</span>
            </button>
            <div className="w-[1px] h-4 bg-white/5 mx-2" />
            
            <button 
              onClick={() => navigate('/profile')} 
              className="w-10 h-10 flex items-center justify-center bg-[#D4121B] rounded-xl text-xs font-black text-white hover:bg-[#E61A23] transition-all cursor-pointer shadow-lg shadow-[#D4121B]/10 uppercase" 
              title="Profile"
            >
              {user?.name?.[0] || 'U'}
            </button>

            <button onClick={logout} className="ml-4 bg-[#D4121B]/10 border border-[#D4121B]/20 px-4 py-2.5 rounded-xl noise-overlay cursor-pointer hover:bg-[#D4121B] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest text-[#D4121B]">
              Logout
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => navigate('/login')} 
              className="text-[10px] font-black uppercase tracking-widest text-[#707070] hover:text-[#F5F5F5] transition-all cursor-pointer px-4"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-[#D4121B] text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] btn-shine cursor-pointer shadow-lg shadow-[#D4121B]/20"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
