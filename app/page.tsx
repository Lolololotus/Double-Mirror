'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS, UI_TEXT, Language } from '@/lib/constants';
import { analyzeReflection } from './actions';
import { ScanningOverlay } from '@/components/ScanningOverlay';
import { DualGauge } from '@/components/DualGauge';
import { ReportCard } from '@/components/ReportCard';
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
  const [accumulatedScores, setAccumulatedScores] = useState<Array<{ sync: number; identity: number }>>([]);
  const [showFinalReport, setShowFinalReport] = useState(false);

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

  // 1. Auth Check - Redirect to Anonymous by Default
  useEffect(() => {
    // We treat everyone as a Guest now to break the auth barrier.
    (window as any).isGuest = true;
    setSession({ user: { email: 'anonymous@double-mirror.io' } });
    setLoadingSession(false);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Optional: Keep listener if we want to support login later, 
      // but for now, we don't block the UI.
      if (session) setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1b. Reset Input on Question Change
  useEffect(() => {
    setInputText('');
    setResult(null);
  }, [selectedQuestion.id]);


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

    if (!session && !((window as any).isGuest)) {
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
        setAccumulatedScores(prev => {
          const next = [...prev, { sync: analysisResult.syncScore, identity: analysisResult.identityScore }];
          console.log('📈 Score Accumulated:', { count: next.length, last: next[next.length - 1] });
          return next;
        });

        if (session && !((window as any).isGuest)) {
          // Only attempt to save to reflections if we have a real session
          const { error: saveError } = await supabase.from('reflections').insert({
            email: session.user.email,
            selected_protocol: selectedQuestion.id,
            user_input: inputText,
            sync_score: analysisResult.syncScore,
            identity_score: analysisResult.identityScore,
            feedback: analysisResult.feedback,
            training_tip: analysisResult.trainingTip,
            mode: mode
          });

          if (saveError) {
            console.error('❌ Supabase Save Error Detail:', JSON.stringify(saveError, null, 2));
          }
        } else {
          console.log("💾 [Anonymous Mode] Skipping Supabase reflection save.");
        }

        setIsScanning(false);
        setScanStatus('');
        return;

      } catch (error: any) {
        if (latestRequestId.current !== currentRequestId) return;
        console.warn(`Attempt ${attempt} failed:`, error.message);

        if (attempt === maxAttempts) {
          console.error("🏁 [Client] All attempts exhausted. Final Error:", error.message);
          alert(`시스템 연결 장애가 지속되고 있습니다.\n\n[진단 정보]: ${error.message}\n\n잠시 후 다시 시도해 주세요.`);
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

  // No more blocking login screen! 🚀
  if (false && !session) {
    // This block is now unreachable to bypass login.
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden flex flex-col md:flex-row font-sans selection:bg-white/30">
      <AnimatePresence>{isScanning && <ScanningOverlay />}</AnimatePresence>

      {/* LEFT: User Input */}
      <section className="flex-1 p-8 md:p-12 flex flex-col justify-start relative border-r border-white/10 bg-gradient-to-b from-gray-900 to-black">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
        <div className="flex justify-between items-center mb-12 z-10">
          <h1
            className={clsx(
              "text-base md:text-lg font-black tracking-[0.3em] uppercase transition-all duration-700",
              mode === 'sync' ? "text-cyan-400" : "text-violet-400"
            )}
            style={{
              textShadow: mode === 'sync' ? '0 0 15px rgba(34,211,238,0.8)' : '0 0 15px rgba(167,139,250,0.8)'
            }}
          >
            {t('title')}
          </h1>
          <div className="flex gap-4 items-center">
            {session && session.user.email !== 'anonymous@double-mirror.io' && (
              <span className="text-xs text-gray-600 hidden md:inline-block">{session.user.email}</span>
            )}
            <button onClick={toggleLang} className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold tracking-widest"><Languages size={14} /> {lang === 'ko' ? 'EN' : 'KR'}</button>
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
            <button
              onClick={() => { setMode('sync'); setIsTrainingMode(false); }}
              title="AI처럼 생각하기 (Think like an AI)"
              className={clsx("flex-1 py-3 text-sm tracking-widest uppercase border-b-2 transition-all", mode === 'sync' ? "border-cyan-500 text-cyan-500" : "border-transparent text-gray-600 hover:text-gray-400")}
            >
              {t('syncMode')}
            </button>
            <button
              onClick={() => { setMode('identity'); setIsTrainingMode(false); }}
              title="인간답게 사유하기 (Think like a Human)"
              className={clsx("flex-1 py-3 text-sm tracking-widest uppercase border-b-2 transition-all", mode === 'identity' ? "border-violet-500 text-violet-500" : "border-transparent text-gray-600 hover:text-gray-400")}
            >
              {t('identityMode')}
            </button>
          </div>

          <div className="space-y-6 mb-10">
            <label className="text-xs text-gray-500 uppercase tracking-wider">{t('selectTopic')}</label>
            <div className="grid gap-4">
              {QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => { setSelectedQuestion(q); setResult(null); }}
                  className={clsx(
                    "relative text-left p-4 rounded-xl border transition-all duration-300",
                    selectedQuestion.id === q.id
                      ? `${mode === 'sync' ? 'border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] bg-cyan-950/40 border-[3px]' : 'border-violet-500/80 shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-violet-950/40 border-[3px]'} text-white`
                      : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium pr-8">{q.text[lang]}</p>
                    {accumulatedScores.some(s => true) && ( // Placeholder for per-question completion check if needed
                      <div className="text-[10px] text-gray-600">
                        {/* Optional: Add checkmark if this specific question was answered */}
                      </div>
                    )}
                  </div>
                  {selectedQuestion.id === q.id && (
                    <motion.div layoutId="active-indicator" className={clsx("absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full", mode === 'sync' ? "bg-cyan-500" : "bg-violet-500")} />
                  )}
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
                  <h2 className="text-2xl md:text-3xl font-light text-white leading-relaxed">
                    {mode === 'sync' ? (
                      result.syncScore === 0 ? (
                        <span className="text-gray-500 italic text-lg whitespace-pre-line">{t('zeroSyncAnalysis')}</span>
                      ) : result.syncScore === 100 ? (
                        <span className="font-bold text-cyan-400">{lang === 'ko' ? "당신은 제미나이입니까?" : "Are you Gemini?"}</span>
                      ) : result.syncScore >= 90 ? (
                        lang === 'ko' ? "고도 동기화: 인간성 증발 직전" : "High Sync: Humanity Evaporating"
                      ) : (
                        lang === 'ko' ? "AI 표준 정합성 분석 완료" : "AI Sync Analysis Complete"
                      )
                    ) : (
                      result.identityScore === 0 ? (
                        <span className="text-gray-500 italic text-lg whitespace-pre-line">{t('zeroIdentityAnalysis')}</span>
                      ) : result.identityScore === 100 ? (
                        <span className="font-bold text-violet-400">{lang === 'ko' ? "기계가 닿을 수 없는 순수 심연" : "Pure Abyss Unreachable by Machines"}</span>
                      ) : result.identityScore >= 90 ? (
                        lang === 'ko' ? "독보적 자아: 알고리즘 파괴자" : "Unique Self: Algorithm Destroyer"
                      ) : (
                        lang === 'ko' ? "인간적 고유성 분석 완료" : "Human Identity Analysis Complete"
                      )
                    )}
                  </h2>
                  <div className={clsx(
                    "mt-4 px-4 py-2 rounded font-mono text-[10px] tracking-[0.3em] uppercase transition-all duration-500",
                    accumulatedScores.length >= 3 ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-gray-500 border border-white/5"
                  )}>
                    Protocol Sequence Analysis Status: {accumulatedScores.length} / 3 {accumulatedScores.length >= 3 ? " [READY]" : ""}
                  </div>
                </div>

                {/* NEXT ACTION or FINAL VERDICT */}
                <div className="pt-4 flex justify-center">
                  {accumulatedScores.length < 3 ? (
                    <button
                      onClick={() => {
                        const nextIdx = QUESTIONS.findIndex(q => q.id === selectedQuestion.id) + 1;
                        const nextQ = QUESTIONS[nextIdx % QUESTIONS.length];
                        setSelectedQuestion(nextQ);
                        setInputText('');
                        setResult(null);
                      }}
                      className={clsx(
                        "group flex items-center gap-3 px-8 py-3 rounded-full font-bold tracking-widest transition-all active:scale-95 text-xs",
                        mode === 'sync' ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                      )}
                    >
                      {t('nextStep')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowFinalReport(true)}
                      className={clsx(
                        "group flex items-center gap-3 px-10 py-4 rounded-full font-black tracking-[0.2em] transition-all active:scale-95 text-sm uppercase",
                        mode === 'sync' ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)]" : "bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                      )}
                    >
                      <Award size={18} /> {t('finalVerdict')}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FINAL REPORT MODAL */}
          {showFinalReport && (
            <ReportCard
              mode={mode}
              lang={lang}
              scores={accumulatedScores}
              onClose={() => {
                setShowFinalReport(false);
                setAccumulatedScores([]);
                setResult(null);
                setInputText('');
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}