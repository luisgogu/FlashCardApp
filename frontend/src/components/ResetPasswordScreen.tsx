import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { api } from '../services/api';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';

interface ResetPasswordScreenProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  token,
  onSuccess,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 4) {
      setError(t('password_too_short'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwords_dont_match'));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword(token, newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('invalid_or_expired_token'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2621] flex flex-col justify-between items-center p-4 antialiased selection:bg-[#2C2621] selection:text-white relative">
      {/* Top Bar with Language Toggle */}
      <header className="w-full max-w-sm flex items-center justify-between pt-2 pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-[#7C746A] hover:text-[#2C2621] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back_to_login')}</span>
        </button>
        <LanguageToggle size="sm" />
      </header>

      <div className="w-full max-w-sm space-y-6 my-auto">
        {/* Brand Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#2C2621] text-[#FAF8F5] rounded-3xl mx-auto flex items-center justify-center shadow-lg border border-[#3C352E]">
            <ShieldCheck className="w-8 h-8 text-[#C86D51]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2621] tracking-tight">
              {t('reset_screen_title')}
            </h1>
            <p className="text-xs text-[#7C746A] mt-1">{t('reset_screen_sub')}</p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-[#E6E0D4] rounded-3xl p-6 shadow-md relative">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-xs font-semibold text-emerald-800">
                {t('reset_success_msg')}
              </p>
              <button
                type="button"
                onClick={onSuccess}
                className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] font-bold rounded-xl py-3 text-xs transition shadow-md cursor-pointer"
              >
                {t('submit_login')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 font-medium">
                  {error}
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-[#2C2621] mb-1">
                  {t('new_password_label')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={t('new_password_placeholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-[#7C746A] hover:text-[#2C2621] transition cursor-pointer"
                    title={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#C86D51]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#2C2621] mb-1">
                  {t('confirm_password_label')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder={t('confirm_password_placeholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-[#7C746A] hover:text-[#2C2621] transition cursor-pointer"
                    title={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-[#C86D51]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
                  <span>{t('submit_reset_password')}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="py-2 text-[10px] text-[#A0988E]">
        © {new Date().getFullYear()} FlashCardApp
      </footer>
    </div>
  );
};
