import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../components/ui';
import { Code, Download, Copy, Check } from 'lucide-react';
import { apiClient, AgentAnalysisResponse } from '../services/api';

const CodeGenerator: React.FC = () => {
    const [step, setStep] = useState<'select' | 'configure' | 'generate' | 'download'>('select');
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [problemStatement, setProblemStatement] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [generatedCode, setGeneratedCode] = useState<AgentAnalysisResponse | null>(null);
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
        } catch (err) {
            console.error('Failed to generate code:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate code');
        } finally {
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

    return (
        <div className="min-h-screen bg-transparent text-white pt-32 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                {/* Header */}
                <motion.div variants={fadeInUp} className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black mb-4">Code Generator</h1>
                    <p className="text-gray-400 text-lg">
                        Generate AI-powered boilerplate code tailored to your hackathon project
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-2 mb-12">
                    {['select', 'configure', 'generate', 'download'].map((s, idx) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all ${step === s || (idx < ['select', 'configure', 'generate', 'download'].indexOf(step))
                                    ? 'bg-blue-500'
                                    : 'bg-white/10'
                                }`}
                        />
                    ))}
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div variants={fadeInUp} className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                        {error}
                    </motion.div>
                )}

                {/* Step 1: Select Hackathon */}
                {step === 'select' && (
                    <motion.div variants={fadeInUp}>
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl mb-6">
                            <h2 className="text-2xl font-bold mb-6">Select Your Hackathon</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-3">Hackathon Project *</label>
                                <textarea
                                    value={selectedHackathon}
                                    onChange={(e) => setSelectedHackathon(e.target.value)}
                                    placeholder="Describe your hackathon project or idea..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-3">Problem Statement *</label>
                                <textarea
                                    value={problemStatement}
                                    onChange={(e) => setProblemStatement(e.target.value)}
                                    placeholder="What problem are you solving?..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setStep('configure')}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                                >
                                    Next: Select Skills
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Step 2: Configure Skills */}
                {step === 'configure' && (
                    <motion.div variants={fadeInUp}>
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl mb-6">
                            <h2 className="text-2xl font-bold mb-6">Select Your Skills</h2>

                            <div className="flex flex-wrap gap-3 mb-8">
                                {skills.map((skill) => (
                                    <button
                                        key={skill}
                                        onClick={() =>
                                            setSelectedSkills(
                                                selectedSkills.includes(skill)
                                                    ? selectedSkills.filter((s) => s !== skill)
                                                    : [...selectedSkills, skill]
                                            )
                                        }
                                        className={`px-4 py-2 rounded-full font-semibold transition-all ${selectedSkills.includes(skill)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setStep('select')}
                                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep('generate')}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                                >
                                    Next: Generate Code
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Step 3: Generate */}
                {step === 'generate' && (
                    <motion.div variants={fadeInUp}>
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl text-center">
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="mb-6 flex justify-center"
                                    >
                                        <Code className="w-12 h-12 text-blue-400" />
                                    </motion.div>

                                    <h2 className="text-2xl font-bold mb-3">Generating Your Code...</h2>
                                    <p className="text-gray-400 mb-6">
                                        AI is analyzing your requirements and creating customized boilerplate
                                    </p>

                                    <div className="space-y-2 text-left max-w-xs mx-auto">
                                        {[
                                            'Analyzing problem statement...',
                                            'Selecting frameworks...',
                                            'Generating backend code...',
                                            'Generating frontend code...',
                                            'Creating Docker config...'
                                        ].map((task, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm">
                                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                                <span>{task}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-3">Generate Code</h2>
                                    <p className="text-gray-400 mb-6">
                                        Click the button below to generate AI-powered boilerplate code
                                    </p>

                                    <Button
                                        onClick={handleGenerateCode}
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold"
                                    >
                                        {loading ? 'Generating...' : 'Generate Boilerplate'}
                                    </Button>
                                </>
                            )}
                        </Card>
                    </motion.div>
                )}

                {/* Step 4: Download */}
                {step === 'download' && generatedCode && (
                    <motion.div variants={fadeInUp} className="space-y-6">
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold mb-6">Your Code is Ready! 🎉</h2>

                            {/* Match Info */}
                            {generatedCode.selected_hackathon && (
                                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <h3 className="font-semibold text-blue-300 mb-2">{generatedCode.selected_hackathon.title}</h3>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Difficulty: {generatedCode.selected_hackathon.difficulty}</span>
                                        <span>Win Probability: {((generatedCode.win_probability || 0) * 100).toFixed(0)}%</span>
                                    </div>
                                    {generatedCode.judge_critique && (
                                        <p className="mt-3 text-sm text-gray-400">{generatedCode.judge_critique.substring(0, 150)}...</p>
                                    )}
                                </div>
                            )}

                            {/* Code Preview */}
                            {generatedCode.boilerplate_code?.backend && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3">Backend Code Preview</h3>
                                    <div className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
                                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
                                            {generatedCode.boilerplate_code.backend.substring(0, 500)}...
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Download Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <Button
                                    onClick={handleDownload}
                                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy Backend Code
                                        </>
                                    )}
                                </Button>
                                <Button className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download as ZIP
                                </Button>
                            </div>
                        </Card>

                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
                            <h3 className="font-semibold mb-3">Next Steps:</h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                <li>Review the generated code structure</li>
                                <li>Customize for your specific requirements</li>
                                <li>Set up your development environment</li>
                                <li>Push code to your GitHub repository</li>
                                <li>Start coding and building! 🚀</li>
                            </ol>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default CodeGenerator;
