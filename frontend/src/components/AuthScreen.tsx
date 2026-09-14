import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { api } from '../services/api';
import { User, Lock, Mail, Loader2, Sparkles, Layers, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  successMessage?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ successMessage }) => {
  const { login, register } = useAuth();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(successMessage || null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          throw new Error(t('generic_error'));
        }
        await api.requestPasswordReset(email.trim(), language);
        setForgotSent(true);
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error(t('name_required_err'));
        }
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || t('generic_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2621] flex flex-col justify-between items-center p-4 antialiased selection:bg-[#2C2621] selection:text-white relative">
      {/* TOP HEADER WITH LANGUAGE TOGGLE SLIDER */}
      <header className="w-full max-w-sm flex items-center justify-between pt-2 pb-4">
        <span className="text-xs font-bold text-[#7C746A] tracking-wider uppercase">FlashCardApp</span>
        <LanguageToggle size="sm" />
      </header>

      <div className="w-full max-w-sm space-y-6 my-auto">
        {/* APP BRANDING LOGO */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#2C2621] text-[#FAF8F5] rounded-3xl mx-auto flex items-center justify-center shadow-lg border border-[#3C352E]">
            <Layers className="w-8 h-8 text-[#C86D51]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2621] tracking-tight">{t('app_title')}</h1>
            <p className="text-xs text-[#7C746A] mt-1">{t('app_subtitle')}</p>
          </div>
        </div>

        {/* AUTH CONTAINER CARD */}
        <div className="bg-white border border-[#E6E0D4] rounded-3xl p-6 shadow-md relative">
          {/* TAB SELECTOR OR BACK BUTTON */}
          {mode === 'forgot' ? (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setForgotSent(false); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7C746A] hover:text-[#2C2621] transition cursor-pointer mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back_to_login')}</span>
            </button>
          ) : (
            <div className="flex bg-[#E6E0D4]/50 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#2C2621] shadow-xs'
                    : 'text-[#7C746A] hover:text-[#2C2621]'
                }`}
              >
                {t('sign_in_tab')}
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-[#2C2621] shadow-xs'
                    : 'text-[#7C746A] hover:text-[#2C2621]'
                }`}
              >
                {t('sign_up_tab')}
              </button>
            </div>
          )}

          <h2 className="text-base font-bold text-[#2C2621] mb-1">
            {mode === 'forgot'
              ? t('forgot_password_title')
              : mode === 'login'
              ? t('welcome_back')
              : t('create_account')}
          </h2>
          <p className="text-xs text-[#7C746A] mb-5">
            {mode === 'forgot'
              ? t('forgot_password_sub')
              : mode === 'login'
              ? t('sub_login')
              : t('sub_register')}
          </p>

          {bannerSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl p-3 mb-4 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bannerSuccess}</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 mb-4 font-medium">
              {error}
            </div>
          )}

          {mode === 'forgot' && forgotSent ? (
            <div className="text-center py-4 space-y-3 animate-fade-in">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-[#2C2621]">{t('forgot_password_sent_title')}</h3>
              <p className="text-xs text-[#7C746A] leading-relaxed">
                {t('forgot_password_sent_msg')}
              </p>
              <button
                type="button"
                onClick={() => { setMode('login'); setForgotSent(false); }}
                className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] font-bold rounded-xl py-3 text-xs transition shadow-md mt-3 cursor-pointer"
              >
                {t('back_to_login')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('name_label')}</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder={t('name_placeholder')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('email_label')}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder={t('email_placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('password_label')}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={t('password_placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-0.5 text-[#7C746A] hover:text-[#2C2621] transition cursor-pointer"
                      title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-[#C86D51]" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {mode === 'login' && (
                    <div className="flex justify-end pt-1.5">
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(null); setForgotSent(false); setBannerSuccess(null); }}
                        className="text-[11px] font-semibold text-[#C86D51] hover:underline cursor-pointer"
                      >
                        {t('forgot_password_link')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] font-bold rounded-xl py-3 text-xs transition shadow-md flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>
                    {mode === 'forgot'
                      ? t('submit_forgot_password')
                      : mode === 'login'
                      ? t('submit_login')
                      : t('submit_register')}
                  </span>
                )}
              </button>
            </form>
          )}
        </div>


        <div className="text-center text-[11px] text-[#A0988E] space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>{t('footer_dev_note')}</span>
          </p>
        </div>
      </div>

      <footer className="py-2 text-[10px] text-[#A0988E]">
        © {new Date().getFullYear()} FlashCardApp
      </footer>
    </div>
  );
};

