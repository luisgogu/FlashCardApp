import React, { useState } from 'react';
import type { Card } from '../types/card';
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
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleRatingClick = (e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    if (isSubmitting) return;
    setIsFlipped(false);
    onRating(rating);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-[#7C746A] px-1">
        <span className="font-bold text-[#2C2621]">
          Tarjeta {currentIndex + 1} de {totalCards}
        </span>
        <span>Card {currentIndex + 1} of {totalCards}</span>
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
          {/* FRONT FACE: Spanish Phrase */}
          <div className="absolute inset-0 w-full h-full bg-white border border-[#E6E0D4] rounded-2xl p-6 shadow-xs backface-hidden flex flex-col justify-between items-center text-center">
            <div className="w-full flex items-center justify-between text-[10px] text-[#A0988C]">
              <span className="font-semibold text-[#2C2621] uppercase tracking-wider">Español</span>
              <span>Anverso / Front</span>
            </div>

            <div className="my-auto py-6 space-y-2">
              <p className="text-xl font-bold text-[#2C2621] leading-relaxed">
                "{card.text_es}"
              </p>
            </div>

            <div className="text-[11px] text-[#7C746A] flex items-center gap-1.5 opacity-80">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Pulsa para girar / Tap to flip</span>
            </div>
          </div>

          {/* BACK FACE: Translation & Grammar Notes */}
          <div className="absolute inset-0 w-full h-full bg-[#FAF8F5] border border-[#2C2621] rounded-2xl p-6 shadow-md backface-hidden rotate-y-180 flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-[10px] text-[#7C746A] border-b border-[#E6E0D4] pb-2">
              <span className="font-bold text-[#2C2621] uppercase tracking-wider">Traducción & Contexto</span>
              <span>Reverso / Back</span>
            </div>

            <div className="my-auto py-3 space-y-3">
              <div>
                <p className="text-xs font-bold text-[#7C746A]">Inglés / English:</p>
                <p className="text-lg font-bold text-[#2C2621] italic">
                  "{card.translation_en}"
                </p>
              </div>

              {card.note && (
                <div className="bg-white border border-[#E6E0D4] rounded-xl p-2.5 text-xs text-[#5C5549]">
                  <p className="font-bold text-[#2C2621] text-[10px]">Nota / Note:</p>
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
              Selecciona tu valoración abajo / Rate your recall
            </div>
          </div>
        </div>
      </div>

      {/* RATING BUTTONS (Shown when flipped) */}
      {isFlipped && (
        <div className="bg-white border border-[#E6E0D4] rounded-2xl p-3 shadow-xs space-y-2 animate-fade-in">
          <p className="text-[11px] font-bold text-center text-[#2C2621]">
            ¿Qué tal la recordaste? / Rate your recall
          </p>
          <div className="grid grid-cols-4 gap-2">
            {/* Rating 0: Otra vez */}
            <button
              onClick={(e) => handleRatingClick(e, 0)}
              disabled={isSubmitting}
              className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-900 rounded-xl py-2 px-1 text-center transition flex flex-col items-center justify-center active:scale-95"
            >
              <span className="text-xs font-bold">Otra vez</span>
              <span className="text-[9px] opacity-75">Again</span>
            </button>

            {/* Rating 1: Difícil */}
            <button
              onClick={(e) => handleRatingClick(e, 1)}
              disabled={isSubmitting}
              className="bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-xl py-2 px-1 text-center transition flex flex-col items-center justify-center active:scale-95"
            >
              <span className="text-xs font-bold">Difícil</span>
              <span className="text-[9px] opacity-75">Hard</span>
            </button>

            {/* Rating 2: Normal */}
            <button
              onClick={(e) => handleRatingClick(e, 2)}
              disabled={isSubmitting}
              className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 rounded-xl py-2 px-1 text-center transition flex flex-col items-center justify-center active:scale-95"
            >
              <span className="text-xs font-bold">Normal</span>
              <span className="text-[9px] opacity-75">Normal</span>
            </button>

            {/* Rating 3: Fácil */}
            <button
              onClick={(e) => handleRatingClick(e, 3)}
              disabled={isSubmitting}
              className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 rounded-xl py-2 px-1 text-center transition flex flex-col items-center justify-center active:scale-95"
            >
              <span className="text-xs font-bold">Fácil</span>
              <span className="text-[9px] opacity-75">Easy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
