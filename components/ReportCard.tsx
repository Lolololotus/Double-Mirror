'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { UI_TEXT, Language } from '@/lib/constants';
import clsx from 'clsx';
import { Download, ShieldCheck, Cpu, Fingerprint } from 'lucide-react';
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

    // Auto-trigger email modal after 1.5s
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowEmailModal(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleDownload = async () => {
        if (reportRef.current === null) return;
        try {
            const dataUrl = await toPng(reportRef.current, { cacheBust: true });
            const link = document.createElement('a');
            link.download = `double-mirror-${mode}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('oops, something went wrong!', err);
        }
    };

    const isSync = mode === 'sync';

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full space-y-8"
            >

                {/* REPORT CONTAINER */}
                <div
                    ref={reportRef}
                    className={clsx(
                        "relative p-8 rounded-2xl border-4 overflow-hidden bg-black aspect-[3/4] flex flex-col justify-between shadow-2xl transition-all duration-700",
                        (isSync ? avgSync : avgIdentity) === 0
                            ? "border-gray-800 shadow-none"
                            : isSync ? "border-cyan-500 shadow-cyan-500/20" : "border-violet-500 shadow-violet-500/20"
                    )}
                >
                    {/* BACKGROUND EFFECTS */}
                    {isSync ? (
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    ) : (
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/40 via-black to-black"></div>
                    )}

                    {/* HEADER */}
                    <div className="relative z-10 space-y-2">
                        <div className="flex justify-between items-start">
                            <div className={clsx(
                                "p-2 rounded-lg transition-colors",
                                (isSync ? avgSync : avgIdentity) === 0 ? "bg-gray-900 text-gray-600" : isSync ? "bg-cyan-500/20 text-cyan-400" : "bg-violet-500/20 text-violet-400"
                            )}>
                                {isSync ? <Cpu size={24} /> : <Fingerprint size={24} />}
                            </div>
                            <div className="text-right font-mono text-[8px] text-gray-600 leading-tight tracking-tighter">
                                COORDINATES_MAP_v2.1<br />
                                {isSync ? "SILICON_DOMAIN" : "ABYSS_RESIDUAL"}<br />
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-500 tracking-[0.3em] font-bold">관찰의 시작</p>
                            <h1 className={clsx(
                                "text-xl font-black tracking-tight uppercase italic leading-none",
                                (isSync ? avgSync : avgIdentity) === 0 ? "text-gray-500" : isSync ? "text-cyan-400" : "text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-fuchsia-300"
                            )}>
                                [ {isSync ? t('reportSyncTitle') : t('reportIdentityTitle')} ]
                            </h1>
                            <p className="text-[10px] text-gray-600 font-light">{t('reportSubtitle')}</p>
                        </div>
                    </div>

                    {/* MAIN SCORE / NO SIGNAL */}
                    <div className="relative z-10 py-4 flex flex-col items-center justify-center">
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={clsx(
                                    "text-8xl font-black tracking-tighter tabular-nums",
                                    (isSync ? avgSync : avgIdentity) === 0
                                        ? "text-gray-800"
                                        : "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                )}
                            >
                                {(isSync ? avgSync : avgIdentity) === 0 ? "N/A" : (isSync ? avgSync : avgIdentity) + "%"}
                            </motion.div>
                            <div className={clsx(
                                "absolute -bottom-2 right-0 px-2 py-0.5 text-[10px] font-bold rounded",
                                (isSync ? avgSync : avgIdentity) === 0
                                    ? "bg-gray-800 text-gray-500"
                                    : isSync ? "bg-cyan-500 text-black" : "bg-violet-500 text-white"
                            )}>
                                {(isSync ? avgSync : avgIdentity) === 0 ? "NO_SIGNAL" : isSync ? "SYNC_COORD" : "ID_COORD"}
                            </div>
                        </div>
                    </div>

                    {/* METRICS */}
                    <div className="relative z-10 grid gap-4">
                        <p className="text-xs text-gray-500 tracking-[0.2em] font-bold mb-1">버려진 것과 남겨진 것</p>
                        {[1, 2, 3].map((i) => {
                            const labelKey = `syncLabel${i}` as keyof typeof UI_TEXT;
                            const idLabelKey = `identityLabel${i}` as keyof typeof UI_TEXT;
                            const label = isSync ? t(labelKey) : t(idLabelKey);
                            const subScore = (isSync ? avgSync : avgIdentity) === 0
                                ? 0
                                : Math.min(100, Math.max(5, (isSync ? avgSync : avgIdentity) + (i - 2) * 5 + Math.floor(Math.random() * 5)));

                            return (
                                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                                    <div className="space-y-1.5">
                                        <p className="text-[12px] text-gray-400 uppercase tracking-widest font-medium">{label}</p>
                                        <div className={clsx("h-1.5 w-32 rounded-full overflow-hidden bg-white/5")}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${subScore === 0 ? 2 : subScore}%` }}
                                                className={clsx("h-full", subScore === 0 ? "bg-gray-800" : isSync ? "bg-cyan-500" : "bg-violet-500")}
                                            />
                                        </div>
                                    </div>
                                    <span className={clsx("font-mono text-sm", subScore === 0 ? "text-gray-700" : "text-white")}>
                                        {subScore === 0 ? "---" : subScore + "%"}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* FOOTER GRAPHICS & CREDO */}
                    <div className="relative z-10 flex flex-col pt-6 gap-4">
                        <p className="text-[13px] md:text-sm text-white font-bold italic tracking-tight leading-relaxed whitespace-pre-line">
                            "{t('finalCredo')}"
                        </p>
                        <div className="flex justify-between items-end">
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-500 font-serif italic whitespace-pre-line leading-tight">
                                    Double Mirror Protocol v1.2-ULTRA
                                    Analysis generated by Silicon Core
                                </p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                {isSync ? (
                                    <div className="flex gap-[1px] h-6 items-end opacity-40 grayscale">
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="bg-white" style={{ width: Math.random() < 0.3 ? '2px' : '1px', height: `${40 + Math.random() * 60}%` }} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative w-10 h-10 flex items-center justify-center opacity-50 grayscale">
                                        <ShieldCheck className="relative z-10 text-white" size={20} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FOOTER GRAPHICS & CREDO moved back to main layout, EmailCollector removed from here */}
                </div>

                {/* EMAIL COLLECTION MODAL (Outside reportRef to exclude from PNG) */}
                <EmailCollector
                    isOpen={showEmailModal}
                    onClose={() => setShowEmailModal(false)}
                    lang={lang}
                    mode={mode}
                    averageScore={isSync ? avgSync : avgIdentity}
                />

                {/* ACTIONS */}
                <div className="grid gap-3 pt-4">
                    <button
                        onClick={handleDownload}
                        className={clsx(
                            "w-full py-4 rounded-xl font-black tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 uppercase text-sm",
                            isSync ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "bg-violet-500 text-white hover:bg-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                        )}
                    >
                        <Download size={18} /> {t('saveReport')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-xs text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                    >
                        {t('close')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
