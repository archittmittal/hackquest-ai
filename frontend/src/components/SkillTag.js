import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const SkillTag = ({ skill, selected, onToggle, removable = false, variant = "default", }) => {
    return (_jsxs(motion.button, { whileHover: { y: -2 }, whileTap: { scale: 0.95 }, onClick: () => onToggle(skill), className: cn("relative group px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200", "flex items-center gap-2", selected
            ? "bg-blue-600/90 border-blue-500 text-white shadow-lg shadow-blue-600/30 backdrop-blur-sm"
            : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10"), "aria-pressed": selected, "aria-label": `${selected ? "Remove" : "Add"} ${skill} skill`, children: [skill, removable && selected && (_jsx(X, { size: 14, className: "ml-1 group-hover:scale-110 transition-transform" }))] }));
};
export const SkillGrid = ({ skills, selectedSkills, onToggle, maxItems, }) => {
    const displaySkills = maxItems ? skills.slice(0, maxItems) : skills;
    return (_jsx("div", { className: "flex flex-wrap justify-center gap-2.5", children: displaySkills.map((skill) => (_jsx(SkillTag, { skill: skill, selected: selectedSkills.includes(skill), onToggle: onToggle, removable: selectedSkills.includes(skill) }, skill))) }));
};
SkillTag.displayName = "SkillTag";
SkillGrid.displayName = "SkillGrid";
