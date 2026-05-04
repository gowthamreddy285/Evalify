import { useInterview } from '../context/InterviewContext';
import { useEffect, useState } from 'react';

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(() => onRemove(toast.id), 300);
      return () => clearTimeout(timer);
    }
  }, [exiting, toast.id, onRemove]);

  const bgMap = {
    success: 'bg-[#00D4AA]/10 border-[#00D4AA]/30',
    error: 'bg-[#FF6B6B]/10 border-[#FF6B6B]/30',
    info: 'bg-[#6C63FF]/10 border-[#6C63FF]/30',
  };

  const iconMap = {
    success: (
      <svg className="w-5 h-5 text-[#00D4AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-[14px] border backdrop-blur-xl shadow-lg ${bgMap[toast.type] || bgMap.info} ${exiting ? 'toast-exit' : 'toast-enter'}`}
    >
      {iconMap[toast.type] || iconMap.info}
      <span className="text-sm font-medium text-[#F0F0FF]">{toast.message}</span>
    </div>
  );
}

export default function ToastContainer() {
  const { state, dispatch } = useInterview();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm" id="toast-container">
      {state.toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={(id) => dispatch({ type: 'REMOVE_TOAST', payload: id })}
        />
      ))}
    </div>
  );
}
