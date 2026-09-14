import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { User, Lock, Mail, Loader2, X, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

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
        onClose();
      } else {
        if (!name.trim()) {
          throw new Error(t('name_required_err'));
        }
        await register(email, password, name);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || t('generic_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2621]/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E6E0D4] rounded-3xl p-6 w-full max-w-sm shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#7C746A] hover:bg-[#E6E0D4]/50 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Selector or Back Button */}
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
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
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
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#2C2621] shadow-xs'
                  : 'text-[#7C746A] hover:text-[#2C2621]'
              }`}
            >
              {t('sign_up_tab')}
            </button>
          </div>
        )}

        <h2 className="text-lg font-bold text-[#2C2621] mb-1">
          {mode === 'forgot' ? t('forgot_password_title') : (mode === 'login' ? t('modal_welcome') : t('create_account'))}
        </h2>
        <p className="text-xs text-[#7C746A] mb-5">
          {mode === 'forgot' ? t('forgot_password_sub') : (mode === 'login' ? t('modal_sub_login') : t('modal_sub_register'))}
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 mb-4">
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
              className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] font-bold rounded-xl py-2.5 text-xs transition shadow-md mt-3 cursor-pointer"
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
                  <User className="w-4 h-4 text-[#7C746A] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={t('name_placeholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('email_label')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7C746A] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder={t('email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#E6E0D4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('password_label')}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7C746A] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={t('password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D4] rounded-xl pl-9 pr-9 py-2 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
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
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); setForgotSent(false); }}
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
              className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] font-bold rounded-xl py-2.5 text-xs transition shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span>
                  {mode === 'forgot'
                    ? t('submit_forgot_password')
                    : mode === 'login'
                    ? t('submit_modal_login')
                    : t('submit_modal_register')}
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


