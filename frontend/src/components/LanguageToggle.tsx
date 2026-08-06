import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '', size = 'md' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`relative inline-flex items-center bg-[#E6E0D4]/70 p-0.5 rounded-full border border-[#D8D0C5] select-none shadow-inner cursor-pointer ${className}`}
      title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      {/* Sliding background pill */}
      <div
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white rounded-full shadow-xs border border-[#E6E0D4] transition-all duration-300 ease-out ${
          language === 'en' ? 'left-[calc(50%+1px)]' : 'left-0.5'
        }`}
      />

      {/* Spanish Option */}
      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={`relative z-10 flex items-center justify-center px-2.5 py-1 rounded-full transition-colors duration-200 ${
          size === 'sm' ? 'text-[10px]' : 'text-xs'
        } ${language === 'es' ? 'text-[#2C2621] font-bold' : 'text-[#7C746A] hover:text-[#2C2621] font-medium'}`}
      >
        <span>ES</span>
      </button>

      {/* English Option */}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative z-10 flex items-center justify-center px-2.5 py-1 rounded-full transition-colors duration-200 ${
          size === 'sm' ? 'text-[10px]' : 'text-xs'
        } ${language === 'en' ? 'text-[#2C2621] font-bold' : 'text-[#7C746A] hover:text-[#2C2621] font-medium'}`}
      >
        <span>EN</span>
      </button>
    </div>
  );
};
