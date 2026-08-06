import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { User, Lock, Mail, Loader2, Sparkles, Layers } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
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
          {/* TAB SELECTOR */}
          <div className="flex bg-[#E6E0D4]/50 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
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
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-white text-[#2C2621] shadow-xs'
                  : 'text-[#7C746A] hover:text-[#2C2621]'
              }`}
            >
              {t('sign_up_tab')}
            </button>
          </div>

          <h2 className="text-base font-bold text-[#2C2621] mb-1">
            {mode === 'login' ? t('welcome_back') : t('create_account')}
          </h2>
          <p className="text-xs text-[#7C746A] mb-5">
            {mode === 'login' ? t('sub_login') : t('sub_register')}
          </p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 mb-4 font-medium">
              {error}
            </div>
          )}

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

            <div>
              <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('password_label')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder={t('password_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] font-bold rounded-xl py-3 text-xs transition shadow-md flex items-center justify-center gap-2 mt-3 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span>{mode === 'login' ? t('submit_login') : t('submit_register')}</span>
              )}
            </button>
          </form>
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

