import React from 'react';
import type { Card } from '../types/card';
import { ArrowRight } from 'lucide-react';

interface CardListPreviewProps {
  cards: Card[];
  onViewAll?: () => void;
  onCardClick?: (card: Card) => void;
}

export const CardListPreview: React.FC<CardListPreviewProps> = ({ cards, onViewAll, onCardClick }) => {
  if (cards.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-4 text-center text-[#7C746A] text-xs">
        No hay tarjetas guardadas aún. / No cards saved yet.
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-24 animate-fade-in space-y-2">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xs font-bold text-[#2C2621]">
            Tarjetas Recientes ({cards.length})
          </h3>
          <p className="text-[10px] text-[#7C746A]">Recent Flashcards</p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-[#2C2621] hover:underline font-medium flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {cards.slice(0, 5).map((card) => (
          <div
            key={card.id}
            onClick={() => onCardClick?.(card)}
            className="bg-white border border-[#E6E0D4] hover:border-[#2C2621] rounded-xl p-3.5 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-[#2C2621]">
                  {card.text_es}
                </p>
                <p className="text-xs text-[#5C5549] italic">
                  {card.translation_en}
                </p>
              </div>
              <span className="text-[9px] text-[#A0988C] font-mono shrink-0">
                #{card.id}
              </span>
            </div>

            {card.note && (
              <p className="mt-1.5 text-xs text-[#7C746A] bg-[#FAF8F5] p-2 rounded-lg border border-[#F0EBE1]">
                {card.note}
              </p>
            )}

            {card.tags && (
              <div className="mt-2 flex items-center gap-1 flex-wrap pt-1.5 border-t border-[#F0EBE1]">
                {card.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#F5F2EB] text-[#5C5549] px-2 py-0.5 rounded-md text-[10px]"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
