'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { UI_TEXT, Language, PERSONA_TIERS } from '@/lib/constants';
import clsx from 'clsx';
import { Download, ShieldCheck, Cpu, Fingerprint, Info } from 'lucide-react';
import { EmailCollector } from './EmailCollector';

interface ReportCardProps {
    mode: 'sync' | 'identity';
    lang: Language;
    scores: Array<{ sync: number; identity: number }>;
    onClose: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ mode, lang, scores, onClose }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const t = (key: keyof typeof UI_TEXT) => UI_TEXT[key][lang];

    const validScores = scores.filter(s => typeof s.sync === 'number' && typeof s.identity === 'number');
    const displayScores = validScores.length > 0 ? validScores : [{ sync: 0, identity: 0 }];

    const avgSync = Math.round(displayScores.reduce((acc, s) => acc + s.sync, 0) / displayScores.length);
    const avgIdentity = Math.round(displayScores.reduce((acc, s) => acc + s.identity, 0) / displayScores.length);

    const mainScore = mode === 'sync' ? avgSync : avgIdentity;
    const isSync = mode === 'sync';

    // Tier Selection Logic
    const tierList = isSync ? PERSONA_TIERS.sync : PERSONA_TIERS.identity;
    const currentPersona = tierList.find(t => mainScore <= t.threshold) || tierList[tierList.length - 1];

    // Auto-trigger email modal after 1.5s
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowEmailModal(true);
        }, 3000); // Increased delay to let user read the deep analysis
        return () => clearTimeout(timer);
    }, []);

    const handleDownload = async () => {
        if (reportRef.current === null) return;
        try {
            const dataUrl = await toPng(reportRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `double-mirror-${currentPersona.title.en}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('oops, something went wrong!', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full space-y-6 pt-20 pb-10"
            >
                {/* REPORT CONTAINER */}
                <div
                    ref={reportRef}
                    className={clsx(
                        "relative p-6 pt-12 rounded-3xl border-2 overflow-hidden bg-black flex flex-col shadow-2xl transition-all duration-1000",
                        mainScore === 0 ? "border-white/5" : isSync ? "border-cyan-500/30 shadow-cyan-500/10" : "border-violet-500/30 shadow-violet-500/10"
                    )}
                >
                    {/* BACKGROUND EFFECTS */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {isSync ? (
                            <div className="absolute inset-0 opacity-[0.03] bg-[size:32px_32px] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]" />
                        ) : (
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,_var(--tw-gradient-stops))] from-violet-900/40 via-black to-black" />
                        )}
                        <div className={clsx(
                            "absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[120px] opacity-20 transition-colors duration-1000",
                            isSync ? "bg-cyan-500" : "bg-violet-600"
                        )} />
                    </div>

                    {/* TOP TYPE LABEL */}
                    <div className="relative z-10 text-center mb-8">
                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[10px] text-gray-500 tracking-[0.5em] font-bold uppercase mb-2"
                        >
                            {isSync ? 'Silicon Synthesis Type' : 'Identity Resonance Type'}
                        </motion.p>
                        <motion.h2
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 10 }}
                            className={clsx(
                                "text-4xl font-black tracking-tighter uppercase italic leading-none drop-shadow-2xl",
                                isSync ? "text-cyan-400" : "text-violet-400"
                            )}
                        >
                            {currentPersona.title[lang]}
                        </motion.h2>
                    </div>

                    {/* IMAGE AREA (The Persona Icon) */}
                    <div className="relative z-10 flex justify-center mb-10 h-64">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative aspect-square w-full max-w-[240px]"
                        >
                            {/* FALLBACK ICON IF IMAGE NOT GENERATED YET */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                {isSync ? <Cpu size={120} className="text-cyan-500" /> : <Fingerprint size={120} className="text-violet-500" />}
                            </div>
                            <img
                                src={currentPersona.image}
                                alt="Persona avatar"
                                className="w-full h-full object-contain mix-blend-screen drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </motion.div>
                    </div>

                    {/* SCORE HIGHLIGHT */}
                    <div className="relative z-10 flex flex-col items-center mb-8">
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black text-white">{mainScore}</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">/ 100</span>
                        </div>
                        <div className={clsx(
                            "h-1 w-24 rounded-full mt-2",
                            isSync ? "bg-cyan-500/50" : "bg-violet-500/50"
                        )} />
                    </div>

                    {/* DEEP ANALYSIS SECTION */}
                    <div className="relative z-10 p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm mb-8">
                        <div className="flex items-center gap-2 mb-4 opacity-50 text-[10px] font-mono tracking-widest text-gray-400">
                            <Info size={12} />
                            <span>THE ANALYSIS (사유 분석기)</span>
                        </div>

                        {/* THE FORMULA */}
                        <div className="font-serif italic text-center mb-6 text-gray-400 py-2 border-y border-white/5">
                            <span className="text-sm">ΔM = </span>
                            <span className="text-[10px] space-x-2">
                                <span className={isSync ? 'text-cyan-400 underline font-bold' : 'text-gray-600'}>Sync</span>
                                <span>/</span>
                                <span className={!isSync ? 'text-violet-400 underline font-bold' : 'text-gray-600'}>Identity</span>
                            </span>
                        </div>

                        <p className="text-sm text-gray-300 leading-relaxed font-light text-center">
                            {currentPersona.analysis[lang]}
                        </p>
                    </div>

                    {/* ACTION TEASER (Training Center) */}
                    <div className="relative z-10 text-center mb-6">
                        <p className="text-[10px] text-gray-600 animate-pulse">
                            {isSync ? 'AI 동조율 1%에 도달하시겠습니까?' : '당신의 영혼은 기계로 환원되지 않습니다.'}
                        </p>
                    </div>

                    {/* METADATA FOOTER */}
                    <div className="relative z-10 border-t border-white/5 pt-4 flex justify-between items-end">
                        <div className="text-[8px] font-mono text-gray-700 leading-tight">
                            SYSTEM: DOUBLE_MIRROR_PROTOCOL_v3.2<br />
                            TARGET: {isSync ? 'SILICON_ADAPT' : 'SPIRIT_PRESERVE'}<br />
                            STAMP: {new Date().toISOString().slice(0, 19).replace('T', '_')}
                        </div>
                        <div className="opacity-20 flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-0.5 h-4 bg-gray-500" style={{ height: `${20 + Math.random() * 80}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* MODAL TRIGGERED LATER */}
                <EmailCollector
                    isOpen={showEmailModal}
                    onClose={() => setShowEmailModal(false)}
                    lang={lang}
                    mode={mode}
                    averageScore={mainScore}
                />

                {/* BOTTOM ACTIONS (Outside PNG) */}
                <div className="grid gap-4 z-20 relative">
                    <button
                        onClick={handleDownload}
                        className={clsx(
                            "w-full py-5 rounded-2xl font-black tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 uppercase text-sm shadow-2xl",
                            isSync ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-violet-600 text-white hover:bg-violet-500"
                        )}
                    >
                        <Download size={20} /> {t('saveReport')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 text-[10px] text-gray-500 hover:text-white uppercase tracking-[0.4em] font-bold transition-all"
                    >
                        {t('close')} (탈출)
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
