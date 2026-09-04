import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { adminLogin, navigateTo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await adminLogin(email.trim(), password, show2FA ? twoFactorCode : undefined);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.error || 'Kirish rad etildi: Notoʻgʻri maʼlumotlar yoki ruxsat yoʻq.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Kirishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background radial accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Bosh Administratsiya Nazorat Markazi</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2.5">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SELLNEX ADMIN CORE
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Faqat tizim boshqaruvchisi uchun xizmat portali
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-7 shadow-2xl shadow-black/60">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start gap-3 animate-shake">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block text-rose-300">Xatolik:</span>
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Telefon / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="+998942865021 yoki ypay260@gmail.com"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-600 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-600 transition-all outline-none"
                />
              </div>
            </div>

            {/* Optional 2FA Verification code toggle */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Hardware / Authenticator 2FA</span>
                <button
                  type="button"
                  onClick={() => setShow2FA(!show2FA)}
                  className="text-rose-400 hover:text-rose-300 font-medium underline transition-colors"
                >
                  {show2FA ? '2FA maydonini yopish' : '2FA kod kiritish'}
                </button>
              </div>

              {show2FA && (
                <div className="relative animate-fadeIn">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="6 xonali 2FA kodi"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-white rounded-xl pl-10 pr-4 py-3 text-sm tracking-widest font-mono placeholder:text-slate-600 placeholder:tracking-normal transition-all outline-none"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-900/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Kirish va Boshqaruvni Boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Return Links for regular sellers or visitors */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.hash = '';
                navigateTo('landing');
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              ← Bosh sahifaga qaytish
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.hash = '';
                navigateTo('auth', { mode: 'login' });
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
            >
              Sotuvchi sifatida kirish →
            </button>
          </div>
        </div>

        {/* Bottom Safety Warning */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Barcha harakatlar va buyruqlar shifrlangan Audit jurnalida qayd etiladi.</span>
        </div>
      </div>
    </div>
  );
};
