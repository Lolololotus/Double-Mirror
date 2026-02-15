'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS, UI_TEXT, Language } from '@/lib/constants';
import { analyzeReflection } from './actions';
import { ScanningOverlay } from '@/components/ScanningOverlay';
import { DualGauge } from '@/components/DualGauge';
import { supabase } from '@/lib/supabase';
import clsx from 'clsx';
import { Disc, Languages, Lock, ChevronDown, ChevronUp, Zap, ArrowRight, Award } from 'lucide-react';

type Mode = 'sync' | 'identity';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // App State
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTIONS[0]);
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [result, setResult] = useState<{
    syncScore: number;
    identityScore: number;
    standardAnswer: string;
    feedback?: string;
    trainingTip?: string;
  } | null>(null);
  const [lang, setLang] = useState<Language>('ko');
  const [mode, setMode] = useState<Mode>('sync');

  // Stale Request Prevention
  const latestRequestId = useRef<number>(0);

  // UI State
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [showStandard, setShowStandard] = useState(false);
  const [showPhilosophy, setShowPhilosophy] = useState(false);

  // Auth States
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const t = (key: keyof typeof UI_TEXT) => UI_TEXT[key][lang];

  const handleSignOut = async () => {
    setLoadingSession(true);
    await supabase.auth.signOut();
    window.location.reload();
  };

  // 1. Auth Check on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Login Logic
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : '' }
    });
    if (error) {
      console.error("Google Login failed:", error.message);
      alert(`Google 로그인 실패: ${error.message}`);
    }
  };

  const handleMagicLinkLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    setLoading(false);

    if (error) {
      console.error("Magic Link failed:", error.message);
      alert(`매직 링크 전송 실패: ${error.message}`);
    } else {
      setEmailSent(true);
      alert(t('checkEmail'));
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    if (!session) {
      alert(t('loginRequired'));
      return;
    }

    setIsScanning(true);
    setResult(null);

    const currentRequestId = Date.now();
    latestRequestId.current = currentRequestId;

    const formData = new FormData();
    formData.append('text', inputText);
    formData.append('questionId', selectedQuestion.id);
    formData.append('lang', lang);
    formData.append('mode', mode);

    let attempt = 0;
    const maxAttempts = 3;
    const delays = [1000, 2000, 3000];

    while (attempt < maxAttempts) {
      attempt++;

      try {
        const statuses = [t('scanning'), t('extracting'), t('refining'), t('polishing')];
        setScanStatus(statuses[attempt - 1] || t('polishing'));

        if (latestRequestId.current !== currentRequestId) return;

        const timeoutMs = 15000; // 15s fixed for stability

        // Wrap server action with timeout
        const analysisPromise = analyzeReflection(formData);
        const analysisResult = await Promise.race([
          analysisPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs))
        ]) as any;

        if (latestRequestId.current !== currentRequestId) return;

        setResult(analysisResult);

        // [Critical Fix] Supabase Save with Full Data
        const { error: saveError } = await supabase.from('reflections').insert({
          email: session.user.email,
          selected_protocol: selectedQuestion.id,
          user_input: inputText,
          sync_score: analysisResult.syncScore,
          identity_score: analysisResult.identityScore,
          feedback: analysisResult.feedback, // Ensure these columns exist in DB
          training_tip: analysisResult.trainingTip,
          mode: mode
        });

        if (saveError) {
          console.error('❌ Supabase Save Error Detail:', JSON.stringify(saveError, null, 2));
        }

        setIsScanning(false);
        setScanStatus('');
        return;

      } catch (error: any) {
        if (latestRequestId.current !== currentRequestId) return;
        console.warn(`Attempt ${attempt} failed:`, error.message);

        if (attempt === maxAttempts) {
          alert("거울의 심도가 너무 깊어 잠시 연결이 지연되고 있습니다.\n(System Busy: Please try again later)");
        } else {
          await new Promise(r => setTimeout(r, delays[attempt - 1]));
        }
      }
    }

    setIsScanning(false);
    setScanStatus('');
  };

  const toggleLang = () => setLang(prev => prev === 'ko' ? 'en' : 'ko');

  const theme = mode === 'sync' ? {
    primary: 'cyan',
    accent: 'cyan-500',
    bgAccent: 'cyan-950/20',
    shadow: 'shadow-cyan-500/20',
    border: 'border-cyan-500/50'
  } : {
    primary: 'violet',
    accent: 'violet-500',
    bgAccent: 'violet-950/20',
    shadow: 'shadow-violet-500/20',
    border: 'border-violet-500/50'
  };

  if (loadingSession) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">INITIALIZING MIRROR...</div>;
  }

  if (!session) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-center text-white font-sans overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-50"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 max-w-md w-full space-y-12"
        >
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-thin tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              DOUBLE MIRROR
            </h1>
            <p className="text-sm md:text-base text-gray-400 font-light tracking-widest leading-loose whitespace-pre-line">
              {t('gatewayTitle')}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full group relative px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? t('waiting') : t('loginGoogle')} <ArrowRight size={14} />
              </span>
            </button>

            <div className="pt-4 border-t border-white/10">
              {!emailSent ? (
                <form onSubmit={handleMagicLinkLogin} className="space-y-3">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-white/20 text-center text-white text-sm py-3 px-4 focus:outline-none focus:border-white/50 transition-colors placeholder:text-gray-700"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-xs text-gray-400 uppercase tracking-widest hover:text-white transition-colors py-2"
                  >
                    {loading ? t('waiting') : t('sendMagicLink')}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-cyan-400 text-sm tracking-widest uppercase">{t('checkEmail')}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPhilosophy(true)}
              className="mt-8 text-[10px] text-gray-600 uppercase tracking-[0.3em] hover:text-gray-400 transition-all border-b border-transparent hover:border-gray-600 pb-1"
            >
              {t('philosophyBtn')}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showPhilosophy && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
            >
              <div className="max-w-xl w-full text-center space-y-12">
                <h2 className="text-xs text-cyan-500 uppercase tracking-[0.4em]">{t('philosophyTitle')}</h2>
                <p className="text-sm md:text-base text-gray-300 font-light leading-loose tracking-wide whitespace-pre-wrap">{t('philosophyBody')}</p>
                <button onClick={() => setShowPhilosophy(false)} className="text-xs text-white/50 hover:text-white uppercase tracking-widest transition-colors py-4 px-8 border border-white/10 rounded-full">{t('close')}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <footer className="absolute bottom-8 text-[10px] text-gray-700 font-mono">DOUBLE MIRROR PROTOCOL v1.1-DEBUG</footer>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden flex flex-col md:flex-row font-sans selection:bg-white/30">
      <AnimatePresence>{isScanning && <ScanningOverlay />}</AnimatePresence>

      {/* LEFT: User Input */}
      <section className="flex-1 p-8 md:p-12 flex flex-col justify-start relative border-r border-white/10 bg-gradient-to-b from-gray-900 to-black">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
        <div className="flex justify-between items-center mb-12 z-10">
          <h1 className={clsx("text-sm font-bold tracking-[0.3em] uppercase transition-colors duration-500", `text-${theme.primary}-500`)}>{t('title')}</h1>
          <div className="flex gap-4 items-center">
            <span className="text-xs text-gray-600 hidden md:inline-block">{session.user.email}</span>
            <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest">{t('signOut')}</button>
            <button onClick={toggleLang} className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-xs font-medium"><Languages size={14} /> {lang === 'ko' ? 'EN' : 'KR'}</button>
          </div>
        </div>

        <div className="max-w-xl mx-auto w-full z-10 flex-1 flex flex-col justify-center">
          <div className="flex justify-center mb-8">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button onClick={() => setIsTrainingMode(false)} className={clsx("px-4 py-2 text-xs font-bold tracking-wider rounded-md transition-all", !isTrainingMode ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300")}>{t('testMode')}</button>
              <button onClick={() => setIsTrainingMode(true)} className={clsx("px-4 py-2 text-xs font-bold tracking-wider rounded-md transition-all flex items-center gap-2", isTrainingMode ? (mode === 'sync' ? "bg-cyan-500/20 text-cyan-400" : "bg-violet-500/20 text-violet-400") : "text-gray-500 hover:text-gray-300")}>
                {mode === 'sync' ? t('trainingMode') : t('identityMode')}
                {isTrainingMode && <span className={clsx("text-[10px] px-1 rounded font-bold", mode === 'sync' ? "bg-cyan-500 text-black" : "bg-violet-500 text-black")}>{mode === 'sync' ? "PRO" : "BETA"}</span>}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isTrainingMode && mode === 'identity' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
                <div className="space-y-12">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }} transition={{ duration: 3, repeat: Infinity }} className="text-8xl text-violet-500">⚓</motion.div>
                  <p className="text-xs text-violet-300 tracking-[0.5em] uppercase font-light border-t border-violet-900/30 pt-8">{t('anchorText')}</p>
                  <button onClick={() => setIsTrainingMode(false)} className="text-xs text-gray-600 hover:text-gray-400 uppercase tracking-widest mt-8">{t('close')}</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 mb-8">
            <button onClick={() => { setMode('sync'); setIsTrainingMode(false); }} className={clsx("flex-1 py-3 text-sm tracking-widest uppercase border-b-2 transition-all", mode === 'sync' ? "border-cyan-500 text-cyan-500" : "border-transparent text-gray-600")}>{t('syncMode')}</button>
            <button onClick={() => { setMode('identity'); setIsTrainingMode(false); }} className={clsx("flex-1 py-3 text-sm tracking-widest uppercase border-b-2 transition-all", mode === 'identity' ? "border-violet-500 text-violet-500" : "border-transparent text-gray-600")}>{t('identityMode')}</button>
          </div>

          <div className="space-y-6 mb-10">
            <label className="text-xs text-gray-500 uppercase tracking-wider">{t('selectTopic')}</label>
            <div className="grid gap-4">
              {QUESTIONS.map((q) => (
                <button key={q.id} onClick={() => { setSelectedQuestion(q); setResult(null); }} className={clsx("text-left p-4 rounded-xl border transition-all", selectedQuestion.id === q.id ? `${theme.border} ${theme.bgAccent} text-white` : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10")}>
                  <p className="font-medium">{q.text[lang]}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs text-gray-500 uppercase tracking-wider">{t('yourReflection')}</label>
            <div className="relative">
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={t('placeholder')} className={clsx("w-full h-40 bg-white/5 border rounded-xl p-4 text-base focus:outline-none transition-all resize-none", inputText.length >= 50 ? `border-white/10 focus:${theme.border}` : "border-red-500/30")} />
              <div className={clsx("absolute bottom-4 right-4 text-xs font-mono transition-colors", inputText.length >= 50 ? "text-cyan-400" : "text-gray-600")}>{inputText.length} / 50</div>
            </div>
          </div>

          <button onClick={handleAnalyze} disabled={isScanning || inputText.length < 50} className={clsx("mt-8 w-full py-4 rounded-xl font-bold tracking-widest transition-all duration-500 uppercase text-sm", (isScanning || inputText.length < 50) ? "bg-gray-800 text-gray-500 opacity-50" : theme.primary === 'cyan' ? "bg-cyan-50 text-black hover:bg-cyan-100" : "bg-violet-50 text-black hover:bg-violet-100")}>
            {isScanning ? scanStatus : t('analyzeBtn')}
          </button>
        </div>
      </section>

      {/* RIGHT: AI Result */}
      <section className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center relative bg-black">
        <div className={clsx("absolute inset-0 bg-gradient-to-t pointer-events-none opacity-30 transition-colors duration-1000", mode === 'sync' ? "from-cyan-900/40" : "from-violet-900/40")}></div>
        <div className="max-w-xl w-full z-10 text-center">
          {!result && !isScanning && <div className="text-gray-600 flex flex-col items-center gap-4"><Disc className="w-12 h-12 opacity-20" /><p className="text-sm tracking-widest opacity-50">{t('waiting')}</p></div>}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                <DualGauge syncScore={result.syncScore} identityScore={result.identityScore} />
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-left">
                  <h3 className="text-xs text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Award size={14} /> {lang === 'ko' ? '논리 비교 분석' : 'Logic Comparison'}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{result.feedback}</p>
                </div>
                {isTrainingMode && (
                  <div className="space-y-4">
                    <button onClick={() => setShowStandard(!showStandard)} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl text-left"><span className="text-xs uppercase tracking-widest text-cyan-400 flex items-center gap-2"><Zap size={14} /> {t('viewStandard')}</span>{showStandard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                    <AnimatePresence>{showStandard && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left"><p className="text-gray-300 italic font-light">"{result.standardAnswer}"</p></div></motion.div>}</AnimatePresence>
                    {result.trainingTip && (
                      <div className="p-6 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-left">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-cyan-500/20 rounded-lg"><Zap className="text-cyan-400" size={20} /></div>
                          <div><h4 className="text-sm font-bold text-cyan-400 mb-1">{lang === 'ko' ? '동기화 팁' : 'Sync Tip'}</h4><p className="text-xs text-gray-300">{result.trainingTip}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="pt-8 border-t border-white/5">
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">{t('analysisResult')}</p>
                  <h2 className="text-3xl font-light text-white">{result.syncScore > 80 ? (lang === 'ko' ? "고도 동기화 상태" : "HIGHLY SYNCHRONIZED") : (lang === 'ko' ? "독자적 정체성 확보" : "DISTINCT IDENTITY")}</h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}