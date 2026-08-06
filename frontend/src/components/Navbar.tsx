import React from 'react';
import { PlusCircle, RotateCw, BookOpen, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type TabType = 'add' | 'review' | 'glossary' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  dueCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, dueCount = 0 }) => {
  const { t, language } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E6E0D4] px-4 py-2 pb-5">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: Añadir */}
        <button
          onClick={() => setActiveTab('add')}
          className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'add' ? 'text-[#2C2621] font-bold' : 'text-[#8C8479] hover:text-[#2C2621]'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[11px] leading-tight">{t('tab_add')}</span>
          <span className="text-[9px] text-[#A0988C] font-normal leading-none">{language === 'es' ? 'Add' : 'Añadir'}</span>
        </button>

        {/* Tab 2: Repasar */}
        <button
          onClick={() => setActiveTab('review')}
          className={`flex flex-col items-center gap-0.5 relative transition-colors cursor-pointer ${
            activeTab === 'review' ? 'text-[#2C2621] font-bold' : 'text-[#8C8479] hover:text-[#2C2621]'
          }`}
        >
          <div className="relative">
            <RotateCw className="w-5 h-5" />
            {dueCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#2C2621] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {dueCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-tight">{t('tab_review')}</span>
          <span className="text-[9px] text-[#A0988C] font-normal leading-none">{language === 'es' ? 'Review' : 'Repaso'}</span>
        </button>

        {/* Tab 3: Glosario */}
        <button
          onClick={() => setActiveTab('glossary')}
          className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'glossary' ? 'text-[#2C2621] font-bold' : 'text-[#8C8479] hover:text-[#2C2621]'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] leading-tight">{t('tab_glossary')}</span>
          <span className="text-[9px] text-[#A0988C] font-normal leading-none">{language === 'es' ? 'Glossary' : 'Glosario'}</span>
        </button>

        {/* Tab 4: Ajustes */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'settings' ? 'text-[#2C2621] font-bold' : 'text-[#8C8479] hover:text-[#2C2621]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] leading-tight">{t('tab_settings')}</span>
          <span className="text-[9px] text-[#A0988C] font-normal leading-none">{language === 'es' ? 'Settings' : 'Ajustes'}</span>
        </button>
      </div>
    </nav>
  );
};

