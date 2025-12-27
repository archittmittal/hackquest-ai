import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Clock, Trophy } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { apiClient } from '../services/api';
const Dashboard = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [stats, setStats] = useState({
        totalMatches: 0,
        avgWinProbability: 0,
        bestMatch: null,
    });
    useEffect(() => {
        fetchMatches();
    }, []);
    const fetchMatches = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.getMatches(10);
            const matchesData = response.data || [];
            setMatches(matchesData);
            if (matchesData.length > 0) {
                setStats({
                    totalMatches: matchesData.length,
                    avgWinProbability: matchesData.reduce((acc, m) => acc + m.win_probability, 0) / matchesData.length,
                    bestMatch: matchesData[0],
                });
            }
        }
        catch (err) {
            console.error('Failed to fetch matches:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch matches');
        }
        finally {
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
    return (_jsx("div", { className: "min-h-screen bg-transparent text-white pt-32", children: _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs(motion.div, { variants: fadeInUp, className: "mb-12", children: [_jsx("h1", { className: "text-5xl md:text-6xl font-black mb-4", children: "Your Hackathon Dashboard" }), _jsx("p", { className: "text-gray-400 text-lg max-w-2xl", children: "Discover personalized hackathon opportunities matched to your unique skill signature" })] }), _jsxs(motion.div, { variants: fadeInUp, className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12", children: [_jsx(Card, { className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm mb-2", children: "Total Matches" }), _jsx("p", { className: "text-4xl font-bold", children: stats.totalMatches })] }), _jsx(motion.div, { whileHover: { scale: 1.1 }, className: "p-3 bg-blue-500/10 rounded-lg", children: _jsx(Target, { className: "w-8 h-8 text-blue-400" }) })] }) }), _jsx(Card, { className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm mb-2", children: "Avg Win Probability" }), _jsxs("p", { className: "text-4xl font-bold", children: [(stats.avgWinProbability * 100).toFixed(1), "%"] })] }), _jsx(motion.div, { whileHover: { scale: 1.1 }, className: "p-3 bg-green-500/10 rounded-lg", children: _jsx(TrendingUp, { className: "w-8 h-8 text-green-400" }) })] }) }), _jsx(Card, { className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 rounded-2xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-400 text-sm mb-2", children: "Best Prize Pool" }), _jsx("p", { className: "text-4xl font-bold", children: stats.bestMatch?.prize_pool ? `$${(stats.bestMatch.prize_pool / 1000).toFixed(1)}K` : 'N/A' })] }), _jsx(motion.div, { whileHover: { scale: 1.1 }, className: "p-3 bg-yellow-500/10 rounded-lg", children: _jsx(Trophy, { className: "w-8 h-8 text-yellow-400" }) })] }) })] }), error && (_jsx(motion.div, { variants: fadeInUp, className: "mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400", children: error })), _jsxs(motion.div, { variants: fadeInUp, className: "mb-12", children: [_jsx("h2", { className: "text-3xl font-bold mb-6", children: "Featured Matches" }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "inline-block animate-spin", children: _jsx(Zap, { className: "w-8 h-8 text-blue-400" }) }), _jsx("p", { className: "text-gray-400 mt-4", children: "Finding your perfect matches..." })] })) : matches.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("p", { className: "text-gray-400", children: "No matches found. Try updating your profile with more skills." }), _jsx(Button, { className: "mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg", children: "Update Profile" })] })) : (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: matches.map((match) => (_jsxs(motion.div, { variants: fadeInUp, whileHover: { scale: 1.02 }, className: "bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 cursor-pointer", onClick: () => setSelectedMatch(match), children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-blue-400 text-sm font-semibold mb-2", children: match.platform }), _jsx("h3", { className: "text-xl font-bold", children: match.title })] }), _jsx("span", { className: "px-3 py-1 bg-white/10 rounded-full text-xs font-semibold", children: match.difficulty })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [_jsxs("div", { className: "bg-white/5 rounded-lg p-3", children: [_jsx("p", { className: "text-gray-400 text-xs mb-1", children: "Skill Match" }), _jsxs("p", { className: "text-lg font-bold text-green-400", children: [(match.skills_match * 100).toFixed(0), "%"] })] }), _jsxs("div", { className: "bg-white/5 rounded-lg p-3", children: [_jsx("p", { className: "text-gray-400 text-xs mb-1", children: "Win Prob." }), _jsxs("p", { className: "text-lg font-bold text-blue-400", children: [(match.win_probability * 100).toFixed(0), "%"] })] }), _jsxs("div", { className: "bg-white/5 rounded-lg p-3", children: [_jsx("p", { className: "text-gray-400 text-xs mb-1", children: "Prize" }), _jsxs("p", { className: "text-lg font-bold text-yellow-400", children: ["$", (match.prize_pool || 0) / 1000, "K"] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-gray-400 text-xs mb-2", children: "Matched Skills" }), _jsxs("div", { className: "flex flex-wrap gap-1", children: [match.matched_skills.slice(0, 3).map((skill) => (_jsx("span", { className: "px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded", children: skill }, skill))), match.matched_skills.length > 3 && (_jsxs("span", { className: "px-2 py-1 text-xs text-gray-400", children: ["+", match.matched_skills.length - 3] }))] })] }), _jsxs("div", { className: "flex items-center gap-2 text-gray-400 text-sm mb-4", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsxs("span", { children: ["Deadline: ", new Date(match.end_date).toLocaleDateString()] }), _jsx(Button, { className: "flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm", children: "View Details" }), _jsx(Button, { className: "flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm", children: "Generate Code" })] })] }, match.id))) }))] })] }) }));
};
export default Dashboard;
