import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { LogIn } from 'lucide-react';

interface HeaderProps {
  cardCount: number;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cardCount, onOpenAuth }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E6E0D4] px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-[#2C2621] tracking-tight leading-none">{t('app_title')}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* LANGUAGE TOGGLE SLIDER */}
          <LanguageToggle size="sm" />

          {/* USER ACCOUNT BADGE (FULL NAME + STATUS BADGE) */}
          {user ? (
            <div
              onClick={onOpenAuth}
              title={`${t('logged_in_as')} ${user.name}`}
              className="cursor-pointer bg-white border border-[#E6E0D4] rounded-full px-2.5 py-1 text-xs text-[#2C2621] font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#FAF8F5] transition"
            >
              <div className="w-4 h-4 rounded-full bg-[#C86D51] text-white flex items-center justify-center text-[10px] uppercase font-bold shrink-0">
                {user.name.charAt(0)}
              </div>
              <span className="text-[11px] whitespace-nowrap">{user.name}</span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md uppercase shrink-0 ${
                  user.is_admin
                    ? 'bg-[#C86D51]/15 text-[#C86D51] border border-[#C86D51]/30'
                    : 'bg-[#7C746A]/15 text-[#5C5549] border border-[#7C746A]/30'
                }`}
              >
                {user.is_admin ? t('admin_role') : t('student_role')}
              </span>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-white hover:bg-[#FAF8F5] border border-[#E6E0D4] text-[#2C2621] rounded-full px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition shadow-xs"
            >
              <LogIn className="w-3 h-3 text-[#C86D51]" />
              <span>{t('log_in')}</span>
            </button>
          )}

          <div className="bg-white border border-[#E6E0D4] rounded-full px-2.5 py-1 text-xs text-[#2C2621] font-medium shadow-xs shrink-0">
            <span>{cardCount}</span>
            <span className="text-[#7C746A] text-[10px] ml-1">{t('cards_count')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

