import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillTagProps {
    skill: string;
    selected: boolean;
    onToggle: (skill: string) => void;
    removable?: boolean;
    variant?: "default" | "filled";
}

export const SkillTag: React.FC<SkillTagProps> = ({
    skill,
    selected,
    onToggle,
    removable = false,
    variant = "default",
}) => {
    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(skill)}
            className={cn(
                "relative group px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200",
                "flex items-center gap-2",
                selected
                    ? "bg-blue-600/90 border-blue-500 text-white shadow-lg shadow-blue-600/30 backdrop-blur-sm"
                    : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/10"
            )}
            aria-pressed={selected}
            aria-label={`${selected ? "Remove" : "Add"} ${skill} skill`}
        >
            {skill}
            {removable && selected && (
                <X
                    size={14}
                    className="ml-1 group-hover:scale-110 transition-transform"
                />
            )}
        </motion.button>
    );
};

interface SkillGridProps {
    skills: string[];
    selectedSkills: string[];
    onToggle: (skill: string) => void;
    maxItems?: number;
}

export const SkillGrid: React.FC<SkillGridProps> = ({
    skills,
    selectedSkills,
    onToggle,
    maxItems,
}) => {
    const displaySkills = maxItems ? skills.slice(0, maxItems) : skills;

    return (
        <div className="flex flex-wrap justify-center gap-2.5">
            {displaySkills.map((skill) => (
                <SkillTag
                    key={skill}
                    skill={skill}
                    selected={selectedSkills.includes(skill)}
                    onToggle={onToggle}
                    removable={selectedSkills.includes(skill)}
                />
            ))}
        </div>
    );
};

SkillTag.displayName = "SkillTag";
SkillGrid.displayName = "SkillGrid";
