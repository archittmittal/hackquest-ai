import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../components/ui';
import { Code, Download, Copy, Check } from 'lucide-react';
import { apiClient } from '../services/api';
const CodeGenerator = () => {
    const [step, setStep] = useState('select');
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [problemStatement, setProblemStatement] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const skills = [
        'python', 'javascript', 'typescript', 'java', 'react',
        'fastapi', 'nodejs', 'sql', 'mongodb', 'aws'
    ];
    const handleGenerateCode = async () => {
        if (!selectedHackathon || !problemStatement) {
            setError('Please fill in all required fields');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await apiClient.analyzeUser({
                user_id: user.id || 'user_' + Date.now(),
                skills: selectedSkills.length > 0 ? selectedSkills : ['python', 'react'],
                github_summary: problemStatement
            });
            if (response) {
                setGeneratedCode(response);
                setStep('download');
            }
        }
        catch (err) {
            console.error('Failed to generate code:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate code');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDownload = () => {
        const code = generatedCode?.boilerplate_code?.backend || '';
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };
    return (_jsx("div", { className: "min-h-screen bg-transparent text-white pt-32 pb-20", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs(motion.div, { variants: fadeInUp, className: "mb-12", children: [_jsx("h1", { className: "text-5xl md:text-6xl font-black mb-4", children: "Code Generator" }), _jsx("p", { className: "text-gray-400 text-lg", children: "Generate AI-powered boilerplate code tailored to your hackathon project" })] }), _jsx(motion.div, { variants: fadeInUp, className: "grid grid-cols-4 gap-2 mb-12", children: ['select', 'configure', 'generate', 'download'].map((s, idx) => (_jsx("div", { className: `h-2 rounded-full transition-all ${step === s || (idx < ['select', 'configure', 'generate', 'download'].indexOf(step))
                            ? 'bg-blue-500'
                            : 'bg-white/10'}` }, s))) }), error && (_jsx(motion.div, { variants: fadeInUp, className: "mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400", children: error })), step === 'select' && (_jsx(motion.div, { variants: fadeInUp, children: _jsxs(Card, { className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl mb-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Select Your Hackathon" }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-semibold mb-3", children: "Hackathon Project *" }), _jsx("textarea", { value: selectedHackathon, onChange: (e) => setSelectedHackathon(e.target.value), placeholder: "Describe your hackathon project or idea...", rows: 4, className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-semibold mb-3", children: "Problem Statement *" }), _jsx("textarea", { value: problemStatement, onChange: (e) => setProblemStatement(e.target.value), placeholder: "What problem are you solving?...", rows: 3, className: "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" })] }), _jsx("div", { className: "flex gap-3", children: _jsx(Button, { onClick: () => setStep('configure'), className: "flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold", children: "Next: Select Skills" }) })] }) })), step === 'configure' && (_jsx(motion.div, { variants: fadeInUp, children: _jsxs(Card, { className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl mb-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Select Your Skills" }), _jsx("div", { className: "flex flex-wrap gap-3 mb-8", children: skills.map((skill) => (_jsx("button", { onClick: () => setSelectedSkills(selectedSkills.includes(skill)
                                        ? selectedSkills.filter((s) => s !== skill)
                                        : [...selectedSkills, skill]), className: `px-4 py-2 rounded-full font-semibold transition-all ${selectedSkills.includes(skill)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'}`, children: skill }, skill))) }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: () => setStep('select'), className: "flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold", children: "Back" }), _jsx(Button, { onClick: () => setStep('generate'), className: "flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold", children: "Next: Generate Code" })] })] }) })), step === 'generate' && (_jsx(motion.div, { variants: fadeInUp, children: _jsx(Card, { className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl text-center", children: loading ? (_jsxs(_Fragment, { children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: 'linear' }, className: "mb-6 flex justify-center", children: _jsx(Code, { className: "w-12 h-12 text-blue-400" }) }), _jsx("h2", { className: "text-2xl font-bold mb-3", children: "Generating Your Code..." }), _jsx("p", { className: "text-gray-400 mb-6", children: "AI is analyzing your requirements and creating customized boilerplate" }), _jsx("div", { className: "space-y-2 text-left max-w-xs mx-auto", children: [
                                        'Analyzing problem statement...',
                                        'Selecting frameworks...',
                                        'Generating backend code...',
                                        'Generating frontend code...',
                                        'Creating Docker config...'
                                    ].map((task, idx) => (_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-green-400" }), _jsx("span", { children: task })] }, idx))) })] })) : (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-2xl font-bold mb-3", children: "Generate Code" }), _jsx("p", { className: "text-gray-400 mb-6", children: "Click the button below to generate AI-powered boilerplate code" }), _jsx(Button, { onClick: handleGenerateCode, disabled: loading, className: "w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold", children: loading ? 'Generating...' : 'Generate Boilerplate' })] })) }) })), step === 'download' && generatedCode && (_jsxs(motion.div, { variants: fadeInUp, className: "space-y-6", children: [_jsxs(Card, { className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Your Code is Ready! \uD83C\uDF89" }), generatedCode.selected_hackathon && (_jsxs("div", { className: "mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-blue-300 mb-2", children: generatedCode.selected_hackathon.title }), _jsxs("div", { className: "flex justify-between text-sm text-gray-300", children: [_jsxs("span", { children: ["Difficulty: ", generatedCode.selected_hackathon.difficulty] }), _jsxs("span", { children: ["Win Probability: ", ((generatedCode.win_probability || 0) * 100).toFixed(0), "%"] })] }), generatedCode.judge_critique && (_jsxs("p", { className: "mt-3 text-sm text-gray-400", children: [generatedCode.judge_critique.substring(0, 150), "..."] }))] })), generatedCode.boilerplate_code?.backend && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-3", children: "Backend Code Preview" }), _jsx("div", { className: "bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto", children: _jsxs("pre", { className: "text-xs text-green-400 font-mono whitespace-pre-wrap break-words", children: [generatedCode.boilerplate_code.backend.substring(0, 500), "..."] }) })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6", children: [_jsx(Button, { onClick: handleDownload, className: "px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2", children: copied ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "w-4 h-4" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(Copy, { className: "w-4 h-4" }), "Copy Backend Code"] })) }), _jsxs(Button, { className: "px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center justify-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), "Download as ZIP"] })] })] }), _jsxs(Card, { className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Next Steps:" }), _jsxs("ol", { className: "list-decimal list-inside space-y-2 text-gray-300", children: [_jsx("li", { children: "Review the generated code structure" }), _jsx("li", { children: "Customize for your specific requirements" }), _jsx("li", { children: "Set up your development environment" }), _jsx("li", { children: "Push code to your GitHub repository" }), _jsx("li", { children: "Start coding and building! \uD83D\uDE80" })] })] })] }))] }) }));
};
export default CodeGenerator;
