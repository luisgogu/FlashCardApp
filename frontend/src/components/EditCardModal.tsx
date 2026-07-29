import React, { useState } from 'react';
import type { Card } from '../types/card';
import { X, Trash2, Check, Loader2 } from 'lucide-react';
import { VerbConjugatorTable } from './VerbConjugatorTable';

interface EditCardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: Card) => void;
  onDelete: (cardId: number) => void;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [textEs, setTextEs] = useState(card.text_es);
  const [translationEn, setTranslationEn] = useState(card.translation_en);
  const [note, setNote] = useState(card.note || '');
  const [tags, setTags] = useState(card.tags || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const isVerb = tags.toLowerCase().split(',').some((t) => t.trim().includes('verbo'));

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
      alert('Error al actualizar la tarjeta.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Seguro que deseas eliminar esta tarjeta? / Delete this card?')) {
      try {
        setIsDeleting(true);
        await onDelete(card.id);
        onClose();
      } catch (error) {
        console.error(error);
        alert('Error al eliminar la tarjeta.');
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
          <h3 className="text-base font-bold text-[#2C2621]">Editar Tarjeta</h3>
          <p className="text-xs text-[#7C746A]">Edit Flashcard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Spanish Text */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621]">Frase en Español *</label>
            <span className="block text-[10px] text-[#7C746A] mb-1">Spanish Phrase</span>
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
            <label className="block text-xs font-bold text-[#2C2621]">Traducción al Inglés *</label>
            <span className="block text-[10px] text-[#7C746A] mb-1">English Translation</span>
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
            <label className="block text-xs font-bold text-[#2C2621]">Nota o Contexto</label>
            <span className="block text-[10px] text-[#7C746A] mb-1">Note or Context</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E6E0D4] focus:border-[#2C2621] rounded-xl px-3 py-2 text-sm text-[#2C2621] outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621]">Etiquetas</label>
            <span className="block text-[10px] text-[#7C746A] mb-1">Tags</span>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ej: verbo, comida"
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
              className="text-red-700 hover:text-red-900 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar / Delete</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#F5F2EB] hover:bg-[#E6E0D4] text-[#2C2621] rounded-xl px-3 py-2 text-xs font-medium"
              >
                Cancelar / Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#2C2621] hover:bg-[#423C35] text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                <span>Guardar / Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
