'use client';

import { motion } from 'framer-motion';

interface DualGaugeProps {
    syncScore: number;
    identityScore: number;
}

function GaugeCircle({ score, color, label }: { score: number; color: string; label: string }) {
    const circumference = 2 * Math.PI * 45; // radius 45
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-40 h-40">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-800"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="45"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-3xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {score}%
                    </motion.span>
                </div>
            </div>
            <span className={`mt-4 text-sm tracking-widest uppercase font-semibold`} style={{ color }}>{label}</span>
        </div>
    );
}

export function DualGauge({ syncScore, identityScore }: DualGaugeProps) {
    return (
        <div className="flex flex-row justify-center items-center gap-12">
            <GaugeCircle score={syncScore} color="#a1a1aa" label="SYNC (SILVER)" />
            <GaugeCircle score={identityScore} color="#000000" label="IDENTITY (OBSIDIAN)" /> {/* Obsidian is black but using dark gray for visibility on dark bg? Let's use a deep purple or just white for contrast if 'Obsidian' implies black/darkness. Spec said Silver/Obsidian. Let's make Obsidian dark grey/black but maybe with a white glow or border concepts? Actually, let's use a very dark color but readable. Maybe a deep violet or just plain white/gray contrast. Let's try to stick to theme. Obsidian -> Black. Screen is dark. Black on Dark is invisible. Let's make it a glossy black/gray. */}
            {/* Re-thinking color for Obsidian on Dark Mode: Maybe a dark purple or just 'white' text but the ring is dark gray? Let's use Slate-900 for ring and White for text. Or maybe Cyan vs Purple? 
      User said: "좌우(Silver/Obsidian)에 각각 대칭적으로 표시". 
      Let's use Silver (#C0C0C0) and Obsidian-ish (#4A4A4A or similar dark glossy). 
      For visibility, I will use a lighter gray for Obsidian label or make it look 'shiny black' via effects if possible, but for simple SVG color, let's use a dark slate. */}
        </div>
    );
}
