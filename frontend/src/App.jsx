import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { InterviewProvider } from './context/InterviewContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ToastContainer from './components/Toast';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Session from './pages/Session';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  return children;
}



function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <Router>
          <div className="min-h-screen bg-[#030303] text-[#F5F5F5] overflow-x-hidden selection:bg-[#D4121B]/30">
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Landing />} />
                
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
              </Routes>
            </AnimatePresence>
            <ToastContainer />
          </div>
        </Router>
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App;
