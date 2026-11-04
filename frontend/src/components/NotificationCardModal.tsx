import React, { useState, useEffect, useRef } from 'react';
import type { Card } from '../types/card';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { RotateCw, X, Sparkles, Loader2 } from 'lucide-react';

interface NotificationCardModalProps {
  card: Card;
  autoFlip?: boolean;
  onClose: () => void;
  onRated?: () => void;
}

export const NotificationCardModal: React.FC<NotificationCardModalProps> = ({
  card,
  autoFlip = true,
  onClose,
  onRated,
}) => {
  const { t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const userToggledRef = useRef(false);

  useEffect(() => {
    userToggledRef.current = false;
    setIsFlipped(false);

    if (!autoFlip) return;

    const timer = setTimeout(() => {
      if (!userToggledRef.current) {
        setIsFlipped(true);
      }
    }, 750);

    return () => clearTimeout(timer);
  }, [card.id, autoFlip]);

  const handleToggleFlip = () => {
    userToggledRef.current = true;
    setIsFlipped((prev) => !prev);
  };

  const handleRate = async (e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    if (isSubmittingRating) return;
    try {
      setIsSubmittingRating(true);
      await api.reviewCard(card.id, rating);
      onRated?.();
      onClose();
    } catch (err) {
      console.error('Error guardando calificación SRS desde notificación:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2621]/55 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3"
      >
        {/* Top Badge & Close Header */}
        <div className="flex items-center justify-between px-1">
          <span className="inline-flex items-center gap-1.5 bg-[#2C2621] text-[#FAF8F5] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-[#3C352E]">
            <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>{t('spotlight_badge')}</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#2C2621] border border-[#E6E0D4] flex items-center justify-center shadow-xs transition cursor-pointer"
            aria-label={t('spotlight_close_btn')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Flipper Card */}
        <div
          onClick={handleToggleFlip}
          className="perspective-1000 w-full min-h-[290px] cursor-pointer select-none"
        >
          <div
            className={`relative w-full h-full min-h-[290px] transition-transform duration-700 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT FACE: Spanish Word/Phrase */}
            <div className="absolute inset-0 w-full h-full bg-white border border-[#E6E0D4] rounded-3xl p-6 shadow-xl backface-hidden flex flex-col justify-between items-center text-center">
              <div className="w-full flex items-center justify-between text-[10px] text-[#7C746A]">
                <span className="font-bold text-[#C86D51] uppercase tracking-wider">
                  🇪🇸 {t('spotlight_spanish_label')}
                </span>
                <span>{t('front_label')}</span>
              </div>

              <div className="my-auto py-6 px-2">
                <p className="text-2xl font-bold text-[#2C2621] leading-relaxed italic">
                  "{card.text_es}"
                </p>
              </div>

              <div className="text-[11px] text-[#7C746A] flex items-center gap-1.5 opacity-85">
                <RotateCw className="w-3.5 h-3.5 text-[#C86D51]" />
                <span>{autoFlip && !userToggledRef.current ? t('spotlight_autoflip_hint') : t('tap_to_flip')}</span>
              </div>
            </div>

            {/* BACK FACE: English Translation + Spanish Reference + Notes */}
            <div className="absolute inset-0 w-full h-full bg-[#FAF8F5] border-2 border-[#2C2621] rounded-3xl p-6 shadow-xl backface-hidden rotate-y-180 flex flex-col justify-between">
              <div className="w-full flex items-center justify-between text-[10px] text-[#7C746A] border-b border-[#E6E0D4] pb-2">
                <span className="font-bold text-[#2C2621] uppercase tracking-wider">
                  🇬🇧 {t('spotlight_english_label')}
                </span>
                <span>{t('back_label')}</span>
              </div>

              <div className="my-auto py-3 space-y-3">
                <div className="bg-white/80 border border-[#E6E0D4] rounded-xl px-3 py-1.5">
                  <p className="text-[11px] text-[#7C746A] italic">
                    🇪🇸 "{card.text_es}"
                  </p>
                </div>

                <div>
                  <p className="text-xl font-bold text-[#2C2621] leading-relaxed">
                    "{card.translation_en}"
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
                    {card.tags.split(',').map((tag, idx) =>
                      tag.trim() ? (
                        <span
                          key={idx}
                          className="bg-white border border-[#E6E0D4] text-[#5C5549] px-2 py-0.5 rounded-md text-[10px]"
                        >
                          #{tag.trim()}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-center text-[#7C746A] flex items-center justify-center gap-1.5">
                <RotateCw className="w-3 h-3" />
                <span>{t('tap_to_flip')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Quick SRS Rating + Close Action */}
        <div className="bg-white border border-[#E6E0D4] rounded-2xl p-3 shadow-lg space-y-2.5">
          <p className="text-[11px] font-bold text-center text-[#2C2621] flex items-center justify-center gap-1.5">
            {isSubmittingRating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C86D51]" />}
            <span>{t('rate_recall')}</span>
          </p>

          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={(e) => handleRate(e, 0)}
              disabled={isSubmittingRating}
              className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-900 rounded-xl py-2 px-1 text-center transition cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">{t('rating_again')}</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleRate(e, 1)}
              disabled={isSubmittingRating}
              className="bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-xl py-2 px-1 text-center transition cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">{t('rating_hard')}</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleRate(e, 2)}
              disabled={isSubmittingRating}
              className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 rounded-xl py-2 px-1 text-center transition cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">{t('rating_good')}</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleRate(e, 3)}
              disabled={isSubmittingRating}
              className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 rounded-xl py-2 px-1 text-center transition cursor-pointer active:scale-95"
            >
              <span className="text-xs font-bold">{t('rating_easy')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] rounded-xl py-2.5 text-xs font-bold transition cursor-pointer"
          >
            {t('spotlight_close_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};
