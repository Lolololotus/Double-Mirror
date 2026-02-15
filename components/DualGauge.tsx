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
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-light tracking-widest mb-2 uppercase">AI 동조율 (AI Sync)</span>
                <GaugeCircle score={syncScore} color="#a1a1aa" label="SYNC (SILVER)" />
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-light tracking-widest mb-2 uppercase">인간적 정체성 (Human Identity)</span>
                <GaugeCircle score={identityScore} color="#4b5563" label="IDENTITY (OBSIDIAN)" />
            </div>
        </div>
    );
}
