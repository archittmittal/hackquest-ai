import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Clock, Trophy } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { config } from '../config';

interface Match {
    id: string;
    title: string;
    platform: string;
    skills_match: number;
    win_probability: number;
    prize?: number;
    difficulty: string;
    deadline: string;
    link: string;
}

export const Dashboard: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [stats, setStats] = useState({
        totalMatches: 0,
        avgWinProbability: 0,
        bestMatch: null as Match | null,
    });

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.api.baseUrl}/api/matches/hackathons`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setMatches(data.data || []);

            if (data.data && data.data.length > 0) {
                setStats({
                    totalMatches: data.data.length,
                    avgWinProbability:
                        data.data.reduce((acc: number, m: Match) => acc + m.win_probability, 0) / data.data.length,
                    bestMatch: data.data[0],
                });
            }
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    return (
        <div className="min-h-screen bg-transparent text-white pt-32">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                {/* Header */}
                <motion.div variants={fadeInUp} className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-black mb-4">Your Hackathon Dashboard</h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Discover personalized hackathon opportunities matched to your unique skill signature
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Total Matches */}
                    <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Total Matches</p>
                                <p className="text-4xl font-bold">{stats.totalMatches}</p>
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }} className="p-3 bg-blue-500/10 rounded-lg">
                                <Target className="w-8 h-8 text-blue-400" />
                            </motion.div>
                        </div>
                    </Card>

                    {/* Avg Win Probability */}
                    <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Avg Win Probability</p>
                                <p className="text-4xl font-bold">{(stats.avgWinProbability * 100).toFixed(1)}%</p>
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }} className="p-3 bg-green-500/10 rounded-lg">
                                <TrendingUp className="w-8 h-8 text-green-400" />
                            </motion.div>
                        </div>
                    </Card>

                    {/* Best Prize */}
                    <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Best Prize Pool</p>
                                <p className="text-4xl font-bold">
                                    {stats.bestMatch?.prize ? `$${(stats.bestMatch.prize / 1000).toFixed(1)}K` : 'N/A'}
                                </p>
                            </div>
                            <motion.div whileHover={{ scale: 1.1 }} className="p-3 bg-yellow-500/10 rounded-lg">
                                <Trophy className="w-8 h-8 text-yellow-400" />
                            </motion.div>
                        </div>
                    </Card>
                </motion.div>

                {/* Matches Grid */}
                <motion.div variants={fadeInUp} className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Featured Matches</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin">
                                <Zap className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-gray-400 mt-4">Finding your perfect matches...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {matches.map((match, idx) => (
                                <motion.div
                                    key={match.id}
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 cursor-pointer"
                                    onClick={() => setSelectedMatch(match)}
                                >
                                    {/* Match Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-blue-400 text-sm font-semibold mb-2">{match.platform}</p>
                                            <h3 className="text-xl font-bold">{match.title}</h3>
                                        </div>
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">
                                            {match.difficulty}
                                        </span>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-gray-400 text-xs mb-1">Skill Match</p>
                                            <p className="text-lg font-bold text-green-400">{(match.skills_match * 100).toFixed(0)}%</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-gray-400 text-xs mb-1">Win Prob.</p>
                                            <p className="text-lg font-bold text-blue-400">{(match.win_probability * 100).toFixed(0)}%</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-gray-400 text-xs mb-1">Prize</p>
                                            <p className="text-lg font-bold text-yellow-400">${(match.prize || 0) / 1000}K</p>
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                        <Clock className="w-4 h-4" />
                                        <span>Deadline: {new Date(match.deadline).toLocaleDateString()}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                                            View Details
                                        </Button>
                                        <Button className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                                            Generate Code
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
