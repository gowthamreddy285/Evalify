import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const features = [
  { title: 'AI-Powered Questions', desc: 'Questions personalized to your resume and target role — not generic templates.', icon: '🧠', color: '#D4121B' },
  { title: '3-Layer Scoring', desc: 'AI judge + semantic analysis + keyword matching for comprehensive evaluation.', icon: '📊', color: '#E61A23' },
  { title: 'Grammar Analysis', desc: 'Real-time language feedback to polish your communication skills.', icon: '✍️', color: '#D4121B' },
  { title: 'Audio Support', desc: 'Speak your answers aloud and get evaluated on tone and clarity.', icon: '🎙️', color: '#E61A23' },
];

const steps = [
  { num: 1, title: 'Upload Resume', desc: 'Drop your PDF and we extract skills, projects, and experience automatically.' },
  { num: 2, title: 'Pick Difficulty', desc: 'Choose from Easy to Extreme. Adjust question count and depth to match your prep level.' },
  { num: 3, title: 'Get Scored', desc: 'Answer questions by typing or speaking. Get detailed scores and actionable feedback.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-[#F5F5F5]">
      {/* HEADER removed to avoid collision with global Navbar */}

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Floating orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left - copy */}
          <div>
            <motion.h1
              {...fadeUp(0.1)}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-8 uppercase"
            >
              Master The <br />
              <span className="gradient-text">Interview.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.25)}
              className="text-lg text-[#707070] max-w-lg mb-12 leading-relaxed font-medium"
            >
              The most advanced AI interview simulator. Built for high-stakes roles. 
              Upload your CV and start the grind.
            </motion.p>

            <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-5">
              <button
                onClick={() => navigate('/interview/setup')}
                className="px-10 py-4 bg-[#D4121B] hover:bg-[#FF3B3B] text-white font-black uppercase tracking-[0.1em] rounded-xl btn-shine cursor-pointer transition-all shadow-[0_8px_48px_rgba(212,18,27,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                id="hero-start-btn"
              >
                Launch Session →
              </button>
              <a
                href="#how-it-works"
                className="px-10 py-4 rounded-xl border-2 border-white/5 bg-white/[0.02] text-[#707070] hover:text-[#F5F5F5] hover:border-[#D4121B]/30 font-bold uppercase tracking-widest transition-all cursor-pointer backdrop-blur-sm"
              >
                The Process
              </a>
            </motion.div>
          </div>

          {/* Right - preview card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <div className="bg-[#0A0A0A] rounded-[24px] border-2 border-[#1A1A1A] p-8 shadow-[0_12px_64px_rgba(180,18,27,0.15)] noise-overlay relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B4121B]/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-[#B4121B]/15 text-[#B4121B] text-[10px] font-black font-mono tracking-widest uppercase">Question 03</span>
                  <span className="px-4 py-1.5 rounded-full bg-[#1A1A1A] text-[#707070] text-[10px] font-black uppercase tracking-widest">Hard</span>
                </div>
                <p className="text-[#F5F5F5] text-xl font-bold mb-8 leading-snug tracking-[-0.02em]">
                  &ldquo;How do you architect a distributed system to maintain eventual consistency without sacrificing latency?&rdquo;
                </p>
                <div className="flex items-center gap-6 pt-6 border-t border-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl font-black text-[#B4121B]">94</span>
                    <span className="text-[10px] text-[#707070] font-bold uppercase tracking-tighter">Score</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1.5 h-10 bg-[#B4121B]/20 rounded-full overflow-hidden">
                       <div className="w-full h-[94%] bg-[#B4121B]" />
                    </div>
                    <div className="w-1.5 h-10 bg-[#B4121B]/20 rounded-full overflow-hidden">
                       <div className="w-full h-[88%] bg-[#B4121B]/60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-32 px-6 bg-[#030303]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4121B] mb-4">The Blueprint</h2>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase">Human Prep, AI Grit.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-[#0A0A0A] rounded-[20px] border border-[#1A1A1A] p-8 noise-overlay relative group hover:border-[#B4121B]/30 transition-all"
              >
                <div className="relative z-10 text-center md:text-left">
                  <div className="w-14 h-14 rounded-[14px] bg-[#D4121B]/10 border border-[#D4121B]/20 flex items-center justify-center text-lg font-black text-[#D4121B] font-mono mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
                    0{step.num}
                  </div>
                  <h3 className="text-xl font-black text-[#F5F5F5] mb-4 tracking-[-0.01em] uppercase">{step.title}</h3>
                  <p className="text-sm text-[#707070] leading-relaxed font-medium">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="text-center mb-20"
          >
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4121B] mb-4">The Armory</h2>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase">No Placeholder AI.</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-[#0A0A0A] rounded-[20px] border border-[#1A1A1A] p-8 cursor-default noise-overlay transition-all hover:shadow-[0_12px_48px_rgba(180,18,27,0.15)] hover:border-[#B4121B]/40"
              >
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 rounded-[14px] flex items-center justify-center text-2xl mb-6 shadow-inner"
                    style={{ backgroundColor: `${f.color}10` }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-black text-[#F5F5F5] mb-3 tracking-[-0.01em] uppercase">{f.title}</h3>
                  <p className="text-xs text-[#707070] leading-relaxed font-medium">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#1A1A1A] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-[#D4121B] tracking-[-0.01em]">Evalify</p>
          <p className="text-xs text-[#707070]">Built with Groq + React</p>
        </div>
      </footer>
    </div>
  );
}
