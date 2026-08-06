import React, { useState, useEffect } from 'react';
import type { Card } from '../types/card';
import { api } from '../services/api';
import { ReviewCardFlipper } from './ReviewCardFlipper';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, RotateCw, Sparkles, Loader2, Info } from 'lucide-react';

export const ReviewModuleView: React.FC = () => {
  const { t } = useLanguage();
  const [activeDeck, setActiveDeck] = useState<Card[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [reviewAllMode, setReviewAllMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchDueCards = async () => {
    try {
      setIsLoading(true);
      const due = await api.getDueCards();
      const all = await api.getCards();
      setActiveDeck(due);
      setAllCards(all);
      setCurrentIndex(0);
      setCompletedCount(0);
      setReviewAllMode(false);

      if (due.length === 0 && all.length > 0) {
        setNotice(t('everything_up_to_date'));
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (error) {
      console.error('Error al cargar tarjetas pendientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDueCards();
  }, []);

  const isFinished = activeDeck.length === 0 || currentIndex >= activeDeck.length;

  const handleRating = async (rating: number) => {
    const currentCard = activeDeck[currentIndex];
    if (!currentCard) return;

    try {
      setIsSubmitting(true);
      await api.reviewCard(currentCard.id, rating);
      setCompletedCount((prev) => prev + 1);

      if (rating === 0) {
        // "Otra vez": re-queue the failed card at the end of the active session
        setActiveDeck((prev) => [...prev, currentCard]);
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Error al guardar evaluación SRS:', error);
      alert('Error al guardar el resultado del repaso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startReviewAll = () => {
    setReviewAllMode(true);
    setActiveDeck(allCards);
    setCurrentIndex(0);
    setCompletedCount(0);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center text-xs text-[#7C746A] flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#2C2621]" />
        <p>{t('loading_review')}</p>
      </div>
    );
  }

  // COMPLETION SCREEN (When no cards due or session finished)
  if (isFinished) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4 animate-fade-in pb-24">
        {/* Notice Toast */}
        {notice && (
          <div className="bg-[#2C2621] text-white font-medium px-4 py-2.5 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 animate-fade-in">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="bg-white border border-[#E6E0D4] rounded-2xl p-6 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#2C2621]">{t('review_completed_title')}</h2>
          </div>

          {completedCount > 0 ? (
            <div>
              <p className="text-xs text-[#5C5549] leading-relaxed">
                {t('review_completed_title')} ({completedCount} {t('cards_count')})
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[#5C5549] leading-relaxed font-medium">
                {t('everything_up_to_date')}
              </p>
            </div>
          )}

          <div className="bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl p-3.5 text-xs text-left space-y-1">
            <div className="flex items-center justify-between font-bold text-[#2C2621]">
              <span>{t('total_cards_library')}</span>
              <span>{allCards.length}</span>
            </div>
            <div className="flex items-center justify-between text-[#7C746A] text-[11px]">
              <span>{t('due_today_count')}</span>
              <span>0</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={fetchDueCards}
              className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] text-[#2C2621] border border-[#E6E0D4] rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t('check_due_again')}</span>
            </button>

            {allCards.length > 0 && (
              <button
                onClick={startReviewAll}
                className="w-full bg-[#2C2621] hover:bg-[#423C35] text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{reviewAllMode ? t('review_all_cards') : `${t('review_all_cards')} (${allCards.length})`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE REVIEW CARD
  return (
    <div className="w-full max-w-md mx-auto p-4 pb-24">
      <ReviewCardFlipper
        card={activeDeck[currentIndex]}
        currentIndex={currentIndex}
        totalCards={activeDeck.length}
        onRating={handleRating}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
