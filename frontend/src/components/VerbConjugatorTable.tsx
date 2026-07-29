import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { TenseKey, ConjugationItem, VerbConjugationData } from '../utils/conjugator';
import { BookMarked, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface VerbConjugatorTableProps {
  infinitiveEs: string;
  infinitiveEn: string;
  defaultOpen?: boolean;
}

export const VerbConjugatorTable: React.FC<VerbConjugatorTableProps> = ({
  infinitiveEs,
  infinitiveEn,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [activeTense, setActiveTense] = useState<TenseKey>('presente');
  const [conjugationData, setConjugationData] = useState<VerbConjugationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    api.getVerbConjugations(infinitiveEs, infinitiveEn)
      .then((data: VerbConjugationData) => {
        if (isMounted) {
          setConjugationData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error al obtener conjugaciones:', err);
        if (isMounted) {
          setConjugationData(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [infinitiveEs, infinitiveEn, isOpen]);

  const tensesList: { key: TenseKey; labelEs: string; labelEn: string }[] = [
    { key: 'presente', labelEs: 'Presente', labelEn: 'Present' },
    { key: 'preterito', labelEs: 'Pretérito', labelEn: 'Past' },
    { key: 'imperfecto', labelEs: 'Imperfecto', labelEn: 'Imperfect/Continuous' },
    { key: 'futuro', labelEs: 'Futuro', labelEn: 'Future' },
    { key: 'imperativo', labelEs: 'Imperativo', labelEn: 'Commands' },
  ];

  const activeTenseData = conjugationData?.tenses?.[activeTense];

  return (
    <div
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      className="mt-3 bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl overflow-hidden text-xs"
    >
      {/* Header Toggle */}
      <button
        type="button"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen((prev: boolean) => !prev);
        }}
        className="w-full px-3 py-2.5 flex items-center justify-between font-bold text-[#2C2621] hover:bg-[#F5F2EB] transition text-left"
      >
        <div className="flex items-center gap-1.5">
          <BookMarked className="w-3.5 h-3.5 text-[#8C5E43]" />
          <span>Tabla de Conjugaciones / Conjugations</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#7C746A]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#7C746A]" />
        )}
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-3 border-t border-[#E6E0D4] space-y-3 animate-fade-in bg-white">
          {isLoading ? (
            <div className="py-4 text-center text-xs text-[#7C746A] flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2C2621]" />
              <span>Cargando conjugaciones... / Loading...</span>
            </div>
          ) : activeTenseData ? (
            <>
              {/* Tense Tabs Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {tensesList.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setActiveTense(t.key);
                    }}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-medium text-[11px] transition ${
                      activeTense === t.key
                        ? 'bg-[#2C2621] text-white'
                        : 'bg-[#FAF8F5] text-[#5C5549] hover:bg-[#F5F2EB] border border-[#E6E0D4]'
                    }`}
                  >
                    <span>{t.labelEs}</span>
                  </button>
                ))}
              </div>

              {/* Active Tense Name Subtitle */}
              <div className="text-[10px] text-[#7C746A] font-semibold border-b border-[#F0EBE1] pb-1">
                {activeTenseData.tenseNameEs} &bull; <span className="font-normal">{activeTenseData.tenseNameEn}</span>
              </div>

              {/* 2-Column Forms Grid */}
              <div className="divide-y divide-[#F5F2EB]">
                {activeTenseData.forms.map((item: ConjugationItem, idx: number) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#7C746A] w-24 shrink-0 font-medium">{item.personEs}</span>
                      <span className="font-bold text-[#2C2621]">{String(item.verbEs || '')}</span>
                    </div>
                    <div className="text-right text-[11px] text-[#5C5549] italic">
                      <span className="text-[#A0988C] not-italic mr-1">{item.personEn}</span>
                      <span>{String(item.verbEn || '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-[#7C746A] py-2 text-center">No se pudieron cargar las conjugaciones.</p>
          )}
        </div>
      )}
    </div>
  );
};
