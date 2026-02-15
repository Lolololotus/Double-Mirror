'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { UI_TEXT, Language } from '@/lib/constants';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

interface EmailCollectorProps {
    lang: Language;
}

export const EmailCollector: React.FC<EmailCollectorProps> = ({ lang }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const t = (key: string) => {
        const ui = UI_TEXT as any;
        return ui[key] ? ui[key][lang] : key;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('contact_leads').insert({
                email: email,
                collected_at: new Date().toISOString()
            });

            if (error) throw error;

            setSubmitted(true);
        } catch (err) {
            console.error('Lead collection failed:', err);
            alert(lang === 'ko' ? '저장에 실패했습니다. 나중에 다시 시도해주세요.' : 'Failed to save. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 overflow-hidden">
            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        <p className="text-[10px] text-gray-500 tracking-[0.2em] font-medium uppercase">
                            {lang === 'ko' ? '사유의 재회 (REUNION)' : 'SUBSCRIBE TO THE ABYSS'}
                        </p>
                        <form onSubmit={handleSubmit} className="relative flex items-center">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={lang === 'ko' ? '이메일을 남겨주세요' : 'Enter your email'}
                                className="w-full bg-transparent border-b border-white/10 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-colors pr-10 placeholder:text-gray-700"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-0 p-2 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-2 space-y-2 text-center"
                    >
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Check size={16} />
                        </div>
                        <p className="text-[11px] text-gray-400 tracking-widest font-light">
                            {lang === 'ko' ? '좌표가 인양되었습니다.' : 'CONNECTION SECURED.'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
