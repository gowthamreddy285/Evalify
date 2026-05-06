import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { InterviewProvider } from './context/InterviewContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ToastContainer from './components/Toast';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Session from './pages/Session';
import Results from './pages/Results';
import SessionDetail from './pages/SessionDetail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303]">
      <div className="w-10 h-10 border-4 border-[#D4121B]/20 border-t-[#D4121B] rounded-full animate-spin"></div>
    </div>
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <InterviewProvider>
          <Router>
            <div className="min-h-screen bg-[#030303] text-[#F5F5F5] overflow-x-hidden selection:bg-[#D4121B]/30">
              <Navbar />
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>
                  } />

                  <Route path="/settings" element={
                    <ProtectedRoute><Settings /></ProtectedRoute>
                  } />

                  <Route path="/interview/setup" element={
                    <ProtectedRoute><Setup /></ProtectedRoute>
                  } />
                  <Route path="/interview/session" element={
                    <ProtectedRoute><Session /></ProtectedRoute>
                  } />
                  <Route path="/interview/results" element={
                    <ProtectedRoute><Results /></ProtectedRoute>
                  } />
                  <Route path="/interview/results/:sessionId" element={
                    <ProtectedRoute><SessionDetail /></ProtectedRoute>
                  } />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
              <ToastContainer />
            </div>
          </Router>
        </InterviewProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
