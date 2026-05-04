import { motion } from 'framer-motion';

const steps = [
  { num: 1, label: 'Resume', icon: DocIcon },
  { num: 2, label: 'Job', icon: BriefcaseIcon },
  { num: 3, label: 'Settings', icon: GearIcon },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
      {steps.map((step, i) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;

        return (
          <div key={step.num} className="flex items-center gap-1 sm:gap-2">
            <motion.div
              layout
              className={`
                flex items-center gap-3 px-4 sm:px-6 py-3 rounded-xl border transition-all duration-300 select-none
                ${isActive
                  ? 'bg-[#D4121B]/10 border-[#D4121B] shadow-[0_0_20px_rgba(212,18,27,0.15)]'
                  : isCompleted
                    ? 'bg-white/5 border-[#D4121B]/30'
                    : 'bg-[#0A0A0A] border-white/5'
                }
              `}
            >
              <div className={`
                w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black
                ${isActive
                  ? 'bg-[#D4121B] text-white shadow-[0_0_10px_rgba(212,18,27,0.4)]'
                  : isCompleted
                    ? 'bg-[#D4121B]/20 text-[#D4121B]'
                    : 'bg-white/5 text-[#707070]'
                }
              `}>
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span className={`hidden sm:inline text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[#F5F5F5]' : isCompleted ? 'text-[#D4121B]' : 'text-[#707070]'}`}>
                {step.label}
              </span>
            </motion.div>

            {i < steps.length - 1 && (
              <div className="w-8 sm:w-16 h-[2px] mx-1" style={{
                backgroundImage: currentStep > step.num
                  ? 'linear-gradient(90deg, #D4121B, #D4121B)'
                  : 'repeating-linear-gradient(90deg, #222 0px, #222 4px, transparent 4px, transparent 8px)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function BriefcaseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function GearIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
