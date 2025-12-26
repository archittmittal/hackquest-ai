import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../components/ui';
import { config } from '../config';
import { Code, Download, Copy, Check } from 'lucide-react';

export const CodeGenerator: React.FC = () => {
    const [step, setStep] = useState<'select' | 'configure' | 'generate' | 'download'>('select');
    const [selectedHackathon, setSelectedHackathon] = useState('');
    const [problemStatement, setProblemStatement] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [framework, setFramework] = useState('fastapi');
    const [generatedCode, setGeneratedCode] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const skills = [
        'python', 'javascript', 'typescript', 'java', 'react',
        'fastapi', 'nodejs', 'sql', 'mongodb', 'aws'
    ];

    const handleGenerateCode = async () => {
        if (!selectedHackathon || !problemStatement) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${config.api.baseUrl}/api/generate/code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hackathon_id: selectedHackathon,
                    problem_statement: problemStatement,
                    selected_skills: selectedSkills,
                    framework,
                    user_id: 'current_user_id' // TODO: Get from auth
                })
            });

            const data = await response.json();
            if (data.success) {
                setGeneratedCode(data.data);
                setStep('download');
            }
        } catch (error) {
            console.error('Failed to generate code:', error);
            alert('Failed to generate code');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        // In production, this would download a ZIP file
        // For now, we'll copy the backend code
        const code = generatedCode?.backend_code || '';
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
                        Generate boilerplate code tailored to your hackathon project
                    </p>
                </motion.div>

                {/* Progress Steps */}
                <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-2 mb-12">
                    {['select', 'configure', 'generate', 'download'].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all ${step === s || (step > s ? 'bg-blue-500' : 'bg-white/10')
                                }`}
                        />
                    ))}
                </motion.div>

                {/* Step 1: Select Hackathon */}
                {step === 'select' && (
                    <motion.div variants={fadeInUp}>
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl mb-6">
                            <h2 className="text-2xl font-bold mb-6">Select Your Hackathon</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-3">Hackathon</label>
                                <select
                                    value={selectedHackathon}
                                    onChange={(e) => setSelectedHackathon(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">-- Select a hackathon --</option>
                                    <option value="1">HackStart 2024 - Web Development</option>
                                    <option value="2">AI Hackathon - Machine Learning</option>
                                    <option value="3">Smart India Hackathon</option>
                                    <option value="4">Unstop Hackathon</option>
                                </select>
                            </div>

                            <Button
                                disabled={!selectedHackathon}
                                onClick={() => setStep('configure')}
                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold"
                            >
                                Continue
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {/* Step 2: Configure Settings */}
                {step === 'configure' && (
                    <motion.div variants={fadeInUp}>
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl mb-6">
                            <h2 className="text-2xl font-bold mb-6">Configure Your Project</h2>

                            <div className="space-y-6">
                                {/* Problem Statement */}
                                <div>
                                    <label className="block text-sm font-semibold mb-3">Problem Statement *</label>
                                    <textarea
                                        value={problemStatement}
                                        onChange={(e) => setProblemStatement(e.target.value)}
                                        placeholder="Describe your hackathon problem or project idea..."
                                        rows={5}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                                    />
                                    <p className="text-gray-400 text-sm mt-2">
                                        {problemStatement.length} / 2000 characters
                                    </p>
                                </div>

                                {/* Framework Selection */}
                                <div>
                                    <label className="block text-sm font-semibold mb-3">Backend Framework</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['fastapi', 'django', 'nodejs', 'flask'].map((fw) => (
                                            <button
                                                key={fw}
                                                onClick={() => setFramework(fw)}
                                                className={`px-4 py-3 rounded-lg font-semibold transition-all ${framework === fw
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                    }`}
                                            >
                                                {fw.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills Selection */}
                                <div>
                                    <label className="block text-sm font-semibold mb-3">Technologies (Optional)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                                                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedSkills.includes(skill)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                    }`}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button
                                    onClick={() => setStep('select')}
                                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold"
                                >
                                    Back
                                </Button>
                                <Button
                                    disabled={!problemStatement}
                                    onClick={() => setStep('generate')}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold"
                                >
                                    Generate Code
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Step 3: Generate */}
                {step === 'generate' && (
                    <motion.div variants={fadeInUp}>
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl text-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-12 h-12 mx-auto mb-6"
                            >
                                <Code className="w-12 h-12 text-blue-400" />
                            </motion.div>

                            <h2 className="text-2xl font-bold mb-3">Generating Your Code...</h2>
                            <p className="text-gray-400 mb-6">
                                We're creating a customized boilerplate based on your requirements
                            </p>

                            <div className="space-y-2 text-left max-w-xs mx-auto">
                                {['Analyzing problem statement...', 'Selecting appropriate frameworks...', 'Generating backend code...', 'Generating frontend code...', 'Creating Docker configuration...'].map((task, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <span>{task}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={handleGenerateCode}
                                disabled={loading}
                                className="w-full mt-8 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold"
                            >
                                {loading ? 'Generating...' : 'Complete Generation'}
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {/* Step 4: Download */}
                {step === 'download' && generatedCode && (
                    <motion.div variants={fadeInUp} className="space-y-6">
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold mb-6">Your Code is Ready!</h2>

                            {/* Code Preview */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Backend (FastAPI)</h3>
                                <div className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
                                    <pre className="text-sm text-green-400 font-mono">
                                        {generatedCode.backend_code?.substring(0, 500)}...
                                    </pre>
                                </div>
                            </div>

                            {/* Download Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            Copy Code
                                        </>
                                    )}
                                </Button>
                                <Button className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download ZIP
                                </Button>
                            </div>
                        </Card>

                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
                            <h3 className="font-semibold mb-3">Next Steps:</h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                                <li>Download the generated ZIP file</li>
                                <li>Extract and review the code structure</li>
                                <li>Set up your development environment</li>
                                <li>Customize the code for your specific needs</li>
                                <li>Push to GitHub and start developing</li>
                            </ol>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default CodeGenerator;
