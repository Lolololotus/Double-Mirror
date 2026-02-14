'use client';

import { motion } from 'framer-motion';

export function ScanningOverlay() {
    return (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden flex flex-col justify-center items-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white text-2xl font-light tracking-[0.2em] mb-8"
            >
                ANALYZING PATTERNS...
            </motion.div>

            <div className="relative w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50">
                <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-cyan-400 blur-md"
                    animate={{
                        y: [-250, 250, -250],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        ease: "linear",
                        repeat: Infinity
                    }}
                />
            </div>
            <motion.div
                className="absolute w-full h-1 bg-cyan-500 shadow-[0_0_20px_5px_rgba(6,182,212,0.5)]"
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity
                }}
            />
        </div>
    );
}
