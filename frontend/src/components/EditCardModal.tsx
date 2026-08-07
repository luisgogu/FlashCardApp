import React, { useState, useMemo } from 'react';
import type { Card } from '../types/card';
import { X, Trash2, Check, Loader2 } from 'lucide-react';
import { VerbConjugatorTable } from './VerbConjugatorTable';
import { useLanguage } from '../context/LanguageContext';
import { TagInputWithSuggestions } from './TagInputWithSuggestions';

interface EditCardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: Card) => void;
  onDelete: (cardId: number) => void;
  existingCards?: Card[];
}

export const EditCardModal: React.FC<EditCardModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
  onDelete,
  existingCards = [],
}) => {
  const { t } = useLanguage();
  const [textEs, setTextEs] = useState(card.text_es);
  const [translationEn, setTranslationEn] = useState(card.translation_en);
  const [note, setNote] = useState(card.note || '');
  const [tags, setTags] = useState(card.tags || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const capTag = (tStr: string) => (tStr ? tStr.trim().charAt(0).toUpperCase() + tStr.trim().slice(1) : '');

  const existingTags = useMemo(() => {
    const set = new Set<string>();
    existingCards.forEach((c) => {
      if (c.tags) {
        c.tags.split(',').forEach((tStr) => {
          const trimmed = capTag(tStr);
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }, [existingCards]);

  if (!isOpen) return null;

  const isVerb = tags.toLowerCase().split(',').some((tStr) => tStr.trim().includes('verbo'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave({
        ...card,
        text_es: textEs,
        translation_en: translationEn,
        note: note.trim() || null,
        tags: tags.trim() || '',
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert(t('card_update_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(t('confirm_delete_card'))) {
      try {
        setIsDeleting(true);
        await onDelete(card.id);
        onClose();
      } catch (error) {
        console.error(error);
        alert(t('card_delete_error'));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 pt-10 sm:pt-16 animate-fade-in overflow-y-auto">
      <div className="bg-white border border-[#E6E0D4] w-full max-w-md rounded-2xl p-5 shadow-xl relative space-y-4 max-h-[85vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7C746A] hover:text-[#2C2621] p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div>
          <h3 className="text-base font-bold text-[#2C2621]">{t('edit_card_title')}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Spanish Text */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('spanish_label')}</label>
            <input
              type="text"
              value={textEs}
              onChange={(e) => setTextEs(e.target.value)}
              required
              className="w-full bg-[#FAF8F5] border border-[#E6E0D4] focus:border-[#2C2621] rounded-xl px-3 py-2 text-sm text-[#2C2621] outline-none"
            />
          </div>

          {/* English Translation */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('english_label')}</label>
            <input
              type="text"
              value={translationEn}
              onChange={(e) => setTranslationEn(e.target.value)}
              required
              className="w-full bg-[#FAF8F5] border border-[#E6E0D4] focus:border-[#2C2621] rounded-xl px-3 py-2 text-sm text-[#2C2621] outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('notes_label')}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E6E0D4] focus:border-[#2C2621] rounded-xl px-3 py-2 text-sm text-[#2C2621] outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621] mb-1">{t('tags_label')}</label>
            <TagInputWithSuggestions
              value={tags}
              onChange={setTags}
              existingTags={existingTags}
              placeholder={t('tags_placeholder')}
              className="w-full bg-[#FAF8F5] border border-[#E6E0D4] focus:border-[#2C2621] rounded-xl px-3 py-2 text-sm text-[#2C2621] outline-none"
            />
          </div>

          {/* Automatic Verb Conjugations inside Modal */}
          {isVerb && (
            <VerbConjugatorTable
              infinitiveEs={textEs}
              infinitiveEn={translationEn}
              defaultOpen={true}
            />
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE1]">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-700 hover:text-red-900 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('delete_card_btn')}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#F5F2EB] hover:bg-[#E6E0D4] text-[#2C2621] rounded-xl px-3 py-2 text-xs font-medium cursor-pointer"
              >
                {t('cancel_btn')}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#2C2621] hover:bg-[#423C35] text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                <span>{t('save_btn')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
