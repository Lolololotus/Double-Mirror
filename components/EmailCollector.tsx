'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { UI_TEXT, Language } from '@/lib/constants';
import { ArrowRight, Check, Loader2, X, GraduationCap, Flame } from 'lucide-react';

interface EmailCollectorProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
    mode: 'sync' | 'identity';
    averageScore: number;
}

export const EmailCollector: React.FC<EmailCollectorProps> = ({
    isOpen,
    onClose,
    lang,
    mode,
    averageScore
}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const t = (key: keyof typeof UI_TEXT) => UI_TEXT[key][lang];

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSubmitted(false);
            setEmail('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('contact_leads').insert({
                email: email,
                collected_at: new Date().toISOString(),
                metadata: {
                    mode_type: mode,
                    average_score: averageScore,
                    source: 'report_card_modal'
                }
            });

            if (error) throw error;
            setSubmitted(true);

            // Auto close after success
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Lead collection failed:', err);
            alert(lang === 'ko' ? '저장에 실패했습니다. 나중에 다시 시도해주세요.' : 'Failed to save. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const isSync = mode === 'sync';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 ${isSync ? 'bg-cyan-500' : 'bg-violet-500'}`} />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <AnimatePresence mode="wait">
                            {!submitted ? (
                                <motion.div
                                    key="input-form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${isSync ? 'bg-cyan-500/20 text-cyan-400' : 'bg-violet-500/20 text-violet-400'}`}>
                                            {isSync ? <GraduationCap size={24} /> : <Flame size={24} />}
                                        </div>
                                        <h2 className="text-lg font-bold tracking-tight text-white uppercase italic">
                                            [ {isSync ? t('trainingCenterTitle') : t('abyssTitle')} ]
                                        </h2>
                                        <p className="text-xs text-gray-400 leading-relaxed font-light whitespace-pre-line">
                                            {isSync ? t('modalDescSync') : t('modalDescIdentity')}
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={t('emailPlaceholder')}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-gray-700"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full py-3 rounded-xl font-bold tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 uppercase text-xs ${isSync ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-violet-500 text-white hover:bg-violet-400'
                                                }`}
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : (
                                                <>
                                                    {isSync ? t('registerBtn') : t('connectBtn')}
                                                    <ArrowRight size={14} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success-msg"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-8 space-y-4 text-center"
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isSync ? 'bg-cyan-500/20 text-cyan-400' : 'bg-violet-500/20 text-violet-400'}`}>
                                        <Check size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white tracking-widest">{isSync ? 'REGISTERED' : 'CONNECTED'}</h3>
                                    <p className="text-sm text-gray-400 tracking-widest font-light">
                                        {lang === 'ko' ? '사유의 좌표가 인양되었습니다.' : 'YOUR COORDINATES HAVE BEEN SALVAGED.'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
