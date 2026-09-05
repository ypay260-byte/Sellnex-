import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authService, validatePasswordRequirements } from '../services/authService';
import {
  ShoppingBag,
  ArrowRight,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  KeyRound,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signUp, navigateTo, routeParams } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset-sent'>(
    routeParams?.mode === 'signup' ? 'signup' : 'login'
  );

  // Form states initialized empty for real new visitors
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Live password validation
  const pwCheck = validatePasswordRequirements(password);

  useEffect(() => {
    if (routeParams?.mode === 'signup') {
      setMode('signup');
    } else if (routeParams?.mode === 'login') {
      setMode('login');
    }
  }, [routeParams?.mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigateTo('admin');
        } else {
          navigateTo('dashboard');
        }
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        setErrorMsg('Please enter your phone number.');
        setLoading(false);
        return;
      }
      if (!pwCheck.isValid) {
        setErrorMsg('Please meet all password requirements: 1 uppercase, 1 lowercase, 1 number, 1 dot (.), 8+ characters.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify.');
        setLoading(false);
        return;
      }

      const res = await signUp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      setLoading(false);
      if (res.success) {
        navigateTo('onboarding');
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } else if (mode === 'forgot') {
      const res = await authService.resetPassword(email);
      setLoading(false);
      setResetSuccessMsg(res.message);
      setMode('reset-sent');
    }
  };

  return (
    <div id="auth-page-root" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          id="auth-brand-logo"
          onClick={() => navigateTo('landing')}
          className="inline-flex items-center gap-2.5 mx-auto group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">SELLNEX</span>
        </button>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
          {mode === 'login' && 'Log In to Sellnex'}
          {mode === 'signup' && 'Create Your Seller Account'}
          {mode === 'forgot' && 'Reset Your Password'}
          {mode === 'reset-sent' && 'Check Your Email'}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          {mode === 'login' && 'Enter your registered email and password to access your dashboard.'}
          {mode === 'signup' && 'Register your account to start selling across Uzbekistan.'}
          {mode === 'forgot' && 'Enter your registered email to receive a password reset link.'}
          {mode === 'reset-sent' && 'We have dispatched password recovery instructions.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200/80 sm:px-10">
          {mode !== 'reset-sent' ? (
            <>
              {/* Mode Switcher Tabs */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  id="tab-mode-login"
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-colors ${
                    mode === 'login' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Log In
                </button>
                <button
                  id="tab-mode-signup"
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(''); }}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-colors ${
                    mode === 'signup' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="input-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Kamronbek Alimov"
                        className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {mode === 'login' ? 'Email yoki Telefon raqam' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="input-email"
                      type={mode === 'login' ? 'text' : 'email'}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={mode === 'login' ? 'Email yoki +998 94 286 50 21' : 'name@example.com'}
                      className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="input-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Password</label>
                      {mode === 'login' && (
                        <button
                          id="btn-forgot-pw"
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. Sellnex1."
                        className="block w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
                      />
                      <button
                        id="btn-toggle-password-visibility"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live Password Requirements (Requirement 8) */}
                    {mode === 'signup' && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/60">
                          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">Password Requirements</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pwCheck.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {pwCheck.isValid ? 'Strong Password' : 'Incomplete'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                          <div className={`flex items-center gap-1.5 ${pwCheck.hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                            {pwCheck.hasUpper ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-[9px] text-slate-400">•</span>
                            )}
                            <span>1 uppercase letter (A-Z)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${pwCheck.hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                            {pwCheck.hasLower ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-[9px] text-slate-400">•</span>
                            )}
                            <span>1 lowercase letter (a-z)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${pwCheck.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                            {pwCheck.hasNumber ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-[9px] text-slate-400">•</span>
                            )}
                            <span>1 number (0-9)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${pwCheck.hasDot ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                            {pwCheck.hasDot ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-[9px] text-slate-400">•</span>
                            )}
                            <span>1 dot (.)</span>
                          </div>
                          <div className={`flex items-center gap-1.5 sm:col-span-2 ${pwCheck.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                            {pwCheck.hasMinLength ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center shrink-0 text-[9px] text-slate-400">•</span>
                            )}
                            <span>Minimum 8 characters (e.g. Sellnex1.)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-hidden"
                      />
                      <button
                        id="btn-toggle-confirm-password-visibility"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Passwords do not match
                      </p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>
                )}

                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={loading || (mode === 'signup' && (!pwCheck.isValid || password !== confirmPassword))}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Sign In to Dashboard'}
                        {mode === 'signup' && 'Register'}
                        {mode === 'forgot' && 'Send Password Reset Link'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {mode === 'forgot' && (
                <div className="mt-4 text-center">
                  <button
                    id="btn-back-to-login"
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Recovery Link Dispatched</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{resetSuccessMsg}</p>
              <button
                onClick={() => setMode('login')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Sellnex E-Commerce Cloud • Uzbekistan & Central Asia
        </p>
      </div>
    </div>
  );
};


