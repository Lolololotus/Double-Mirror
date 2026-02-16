'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ScanningOverlayProps {
    quote?: string;
}

export function ScanningOverlay({ quote }: ScanningOverlayProps) {
    return (
        <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden flex flex-col justify-center items-center bg-black/80 backdrop-blur-xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={quote}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -10 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-white text-lg md:text-2xl font-light tracking-[0.2em] mb-12 text-center max-w-2xl px-8 italic font-serif leading-relaxed"
                >
                    {quote || "ANALYZING PATTERNS..."}
                </motion.div>
            </AnimatePresence>

            <div className="relative w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent">
                <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-cyan-400 blur-sm"
                    animate={{
                        y: [-250, 250, -250],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 2.5,
                        ease: "linear",
                        repeat: Infinity
                    }}
                />
            </div>

            <motion.div
                className="absolute w-full h-[2px] bg-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]"
                initial={{ top: '0%' }}
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity
                }}
            />

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                <span className="text-[10px] text-cyan-500/50 uppercase tracking-[0.5em] font-mono">Scoring in progress...</span>
            </div>
        </div>
    );
}
