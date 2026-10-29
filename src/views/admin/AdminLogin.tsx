import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { adminLogin, loginAdminWithGoogle, navigateTo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await loginAdminWithGoogle();
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.error || 'Kirish rad etildi: Sizda administratorlik huquqlari mavjud emas.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google orqali kirishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* One-Click Google Admin Login (ypay260@gmail.com) */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full mb-5 bg-white hover:bg-slate-100 text-slate-800 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 border border-slate-300 active:scale-[0.99]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-xs sm:text-sm">Google orqali Boshqaruv Paneliga Kirish</span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Yoki Telefon / Email bilan</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

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
