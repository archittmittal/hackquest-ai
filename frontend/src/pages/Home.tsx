import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Code2, ShieldCheck, Zap, Search, 
  Loader2, ChevronRight, ClipboardCheck, Sparkles, Plus, X 
} from 'lucide-react';

const HackQuestHome = () => {
  const [loading, setLoading] = useState(false);
  const [githubId, setGithubId] = useState("");
  const [currentStatus, setCurrentStatus] = useState("Initializing...");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(["React", "Python", "FastAPI"]);
  const availableSkills = [
    "TensorFlow", "Solidity", "Tailwind", "Next.js", 
    "PyTorch", "Rust", "Node.js", "PostgreSQL", "AWS", "Docker", "Web3.js"
  ];

  const statusMap: Record<string, string> = {
    "analyze_profile": "Reading your GitHub DNA...",
    "match_hackathons": "Scanning global databases...",
    "judge_simulation": "Simulating judging committee...",
    "generate_boilerplate": "Architecting winning boilerplate...",
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const triggerAgent = () => {
    if (!githubId) return alert("Please enter a GitHub ID");
    setLoading(true);
    setResult(null);
    setCurrentStatus("Opening Secure Connection...");

    const socket = new WebSocket('ws://localhost:8000/ws/agent');

    socket.onopen = () => {
      socket.send(JSON.stringify({ github_id: githubId, skills: selectedSkills }));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.event === "node_complete") {
        setCurrentStatus(statusMap[msg.node] || "Processing...");
        setResult((prev: any) => ({ ...prev, ...msg.data }));
      }
      if (msg.event === "flow_complete") {
        setLoading(false);
        socket.close();
      }
      if (msg.event === "error") {
        alert(`Agent Error: ${msg.message}`);
        setLoading(false);
      }
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Zap size={18} fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight">HackQuest <span className="text-blue-500">AI</span></span>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] font-black mb-8 tracking-[0.2em] uppercase backdrop-blur-md"
          >
            <Sparkles size={12} /> Pro Agent Core Active
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-extrabold tracking-tighter mb-10 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-[0.9]"
          >
            Win your next <br /> hackathon.
          </motion.h1>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-xl mx-auto space-y-12">
            {/* Pro Input */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute inset-y-0 left-6 top-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={24} />
              <input 
                type="text" placeholder="GitHub Username" value={githubId}
                onChange={(e) => setGithubId(e.target.value)}
                className="relative w-full bg-[#0a0a0a] border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            {/* Tag Cloud */}
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2.5">
                {availableSkills.map((skill) => (
                  <motion.button
                    key={skill}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSkill(skill)}
                    className={`px-5 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      selectedSkills.includes(skill) 
                      ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20" 
                      : "bg-[#0a0a0a] border-white/10 text-gray-400 hover:border-white/30"
                    }`}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </div>

            <button 
              onClick={triggerAgent} disabled={loading || !githubId}
              className="group relative px-14 py-5 bg-white text-black rounded-full font-black text-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 mx-auto shadow-2xl shadow-white/10"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> {currentStatus}</>
              ) : (
                <>Start Agentic Flow <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <AnimatePresence>
          {result && (
            <motion.div 
                initial="hidden" animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
            >
              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="md:col-span-2 p-12 rounded-[3rem] bg-[#0a0a0a] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><Zap size={200} /></div>
                <div className="relative z-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-10">Target Hackathon</span>
                    <h3 className="text-5xl font-bold mb-6 tracking-tight">{result.selected_hackathon?.title || "Evaluating..."}</h3>
                    <p className="text-gray-400 text-xl leading-relaxed max-w-2xl">{result.selected_hackathon?.ps}</p>
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="p-12 rounded-[3rem] bg-[#0a0a0a] border border-white/10 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-10">Win Probability</span>
                <div className="relative flex items-center justify-center">
                  <svg className="w-48 h-48 -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                    <motion.circle 
                      cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="553"
                      initial={{ strokeDashoffset: 553 }} animate={{ strokeDashoffset: 553 - (553 * (result.win_probability || 0)) / 100 }}
                      className="text-blue-600" strokeLinecap="round" transition={{ duration: 2, ease: "circOut" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col">
                    <span className="text-7xl font-black tracking-tighter">{result.win_probability || 0}</span>
                    <span className="text-blue-500 text-xs font-black">%</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="md:col-span-1 p-12 rounded-[3rem] bg-[#0a0a0a] border border-white/10">
                <div className="flex items-center gap-3 mb-8 text-blue-500"><ShieldCheck size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Judge Analysis</span></div>
                <p className="text-gray-300 text-lg italic leading-relaxed font-medium">"{result.judge_critique || "Preparing report..."}"</p>
              </motion.div>

              <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="md:col-span-2 p-1 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
                <div className="bg-[#050505] rounded-[2.9rem] p-10 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2 items-center text-gray-500 font-mono text-xs">
                      <div className="flex gap-1.5 mr-4"><div className="w-3 h-3 rounded-full bg-red-500/20" /><div className="w-3 h-3 rounded-full bg-yellow-500/20" /><div className="w-3 h-3 rounded-full bg-green-500/20" /></div>
                      source_boilerplate.py
                    </div>
                    <button onClick={() => copyToClipboard(result.boilerplate_code?.content)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all">
                      {copied ? "Copied!" : "Copy Source"}
                    </button>
                  </div>
                  <pre className="text-blue-100/60 font-mono text-sm leading-relaxed overflow-y-auto max-h-[350px] custom-scrollbar">
                    {result.boilerplate_code?.content || "# Initializing repository structure..."}
                  </pre>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default HackQuestHome;