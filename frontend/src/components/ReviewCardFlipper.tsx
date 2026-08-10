import React, { useState, useEffect } from 'react';
import type { Card } from '../types/card';
import { useLanguage } from '../context/LanguageContext';
import { useFlipMode } from '../context/FlipModeContext';
import { RotateCw } from 'lucide-react';

interface ReviewCardFlipperProps {
  card: Card;
  currentIndex: number;
  totalCards: number;
  onRating: (rating: number) => void;
  isSubmitting: boolean;
}

export const ReviewCardFlipper: React.FC<ReviewCardFlipperProps> = ({
  card,
  currentIndex,
  totalCards,
  onRating,
  isSubmitting,
}) => {
  const { t } = useLanguage();
  const { flipMode } = useFlipMode();
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleRatingClick = (e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    if (isSubmitting) return;
    setIsFlipped(false);
    onRating(rating);
  };

  const isEsToEn = flipMode === 'es_to_en';
  const frontTitle = isEsToEn ? t('spanish_front_title') : t('english_front_title');
  const frontText = isEsToEn ? card.text_es : card.translation_en;
  const backTitle = isEsToEn ? t('english_back_title') : t('spanish_back_title');
  const backText = isEsToEn ? card.translation_en : card.text_es;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-[#7C746A] px-1 font-bold">
        <span>
          {t('card_progress')} {currentIndex + 1} {t('of_label')} {totalCards}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="perspective-1000 w-full min-h-[280px] cursor-pointer select-none"
      >
        <div
          className={`relative w-full h-full min-h-[280px] transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 w-full h-full bg-white border border-[#E6E0D4] rounded-2xl p-6 shadow-xs backface-hidden flex flex-col justify-between items-center text-center">
            <div className="w-full flex items-center justify-between text-[10px] text-[#A0988C]">
              <span className="font-bold text-[#2C2621] uppercase tracking-wider">{frontTitle}</span>
              <span>{t('front_label')}</span>
            </div>

            <div className="my-auto py-6 space-y-2">
              <p className="text-2xl font-bold text-[#2C2621] leading-relaxed italic">
                "{frontText}"
              </p>
            </div>

            <div className="text-[11px] text-[#7C746A] flex items-center gap-1.5 opacity-80">
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t('tap_to_flip')}</span>
            </div>
          </div>

          {/* BACK FACE: Answer & Grammar Notes */}
          <div className="absolute inset-0 w-full h-full bg-[#FAF8F5] border border-[#2C2621] rounded-2xl p-6 shadow-md backface-hidden rotate-y-180 flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-[10px] text-[#7C746A] border-b border-[#E6E0D4] pb-2">
              <span className="font-bold text-[#2C2621] uppercase tracking-wider">{backTitle}</span>
              <span>{t('back_label')}</span>
            </div>

            <div className="my-auto py-3 space-y-3">
              <div>
                <p className="text-xl font-bold text-[#2C2621] leading-relaxed">
                  "{backText}"
                </p>
              </div>

              {card.note && (
                <div className="bg-white border border-[#E6E0D4] rounded-xl p-2.5 text-xs text-[#5C5549]">
                  <p className="font-bold text-[#2C2621] text-[10px]">{t('note_label')}</p>
                  <p className="mt-0.5">{card.note}</p>
                </div>
              )}

              {card.tags && (
                <div className="flex items-center gap-1 flex-wrap">
                  {card.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="bg-white border border-[#E6E0D4] text-[#5C5549] px-2 py-0.5 rounded-md text-[10px]">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[10px] text-center text-[#7C746A]">
              {t('rate_recall')}
            </div>
          </div>
        </div>
      </div>

      {/* RATING BUTTONS (Shown when flipped) */}
      {isFlipped && (
        <div className="bg-white border border-[#E6E0D4] rounded-2xl p-3 shadow-xs space-y-2 animate-fade-in">
          <p className="text-[11px] font-bold text-center text-[#2C2621]">
            {t('rate_recall')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {/* Rating 0: Otra vez / Again */}
            <button
              onClick={(e) => handleRatingClick(e, 0)}
              disabled={isSubmitting}
              className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-900 rounded-xl py-2 px-1 text-center transition flex flex-col items-center justify-center cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">{t('rating_again')}</span>
            </button>

            {/* Rating 1: Difícil / Hard */}
            <button
              onClick={(e) => handleRatingClick(e, 1)}
              disabled={isSubmitting}
              className="bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-xl py-2 px-1 text-center transition flex flex-col items-center justify-center cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">{t('rating_hard')}</span>
            </button>

            {/* Rating 2: Normal / Good */}
            <button
              onClick={(e) => handleRatingClick(e, 2)}
              disabled={isSubmitting}
              className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 rounded-xl py-2 px-1 text-center transition flex flex-col items-center justify-center cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">{t('rating_good')}</span>
            </button>

            {/* Rating 3: Fácil / Easy */}
            <button
              onClick={(e) => handleRatingClick(e, 3)}
              disabled={isSubmitting}
              className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 rounded-xl py-2 px-1 text-center transition flex flex-col items-center justify-center cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">{t('rating_easy')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
