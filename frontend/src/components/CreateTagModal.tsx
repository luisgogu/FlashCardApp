import React, { useState } from 'react';
import type { Card } from '../types/card';
import { api } from '../services/api';
import { X, Tag, Check, Loader2, Search, CheckSquare, Square } from 'lucide-react';

interface CreateTagModalProps {
  cards: Card[];
  isOpen: boolean;
  onClose: () => void;
  onTagCreated: () => void;
}

export const CreateTagModal: React.FC<CreateTagModalProps> = ({
  cards,
  isOpen,
  onClose,
  onTagCreated,
}) => {
  const [tagName, setTagName] = useState('');
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter cards by search query inside the modal
  const filteredCards = cards.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.text_es.toLowerCase().includes(q) ||
      c.translation_en.toLowerCase().includes(q) ||
      (c.tags && c.tags.toLowerCase().includes(q))
    );
  });

  const toggleSelectCard = (id: number) => {
    setSelectedCardIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCardIds(filteredCards.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedCardIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tagName.trim();
    if (!cleanTag) {
      alert('Por favor, introduce un nombre para la etiqueta.');
      return;
    }
    if (selectedCardIds.length === 0) {
      alert('Por favor, selecciona al menos una tarjeta.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.applyTagToCards(cleanTag, selectedCardIds);
      onTagCreated();
      onClose();
    } catch (error) {
      console.error('Error al aplicar etiqueta:', error);
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center p-4 pt-10 sm:pt-16 animate-fade-in overflow-y-auto">
      <div className="bg-white border border-[#E6E0D4] w-full max-w-md rounded-2xl p-5 shadow-xl relative space-y-4 max-h-[85vh] flex flex-col">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7C746A] hover:text-[#2C2621] p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-1.5 font-bold text-[#2C2621] text-base">
            <Tag className="w-4 h-4 text-[#8C5E43]" />
            <h3>Crear y Asignar Etiqueta</h3>
          </div>
          <p className="text-xs text-[#7C746A]">Create & Apply Tag to Cards</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col min-h-0">
          {/* Tag Name Input */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621]">Nombre de la Etiqueta *</label>
            <span className="block text-[10px] text-[#7C746A] mb-1">Tag Name (ej: Verbo, Viajes, Comida)</span>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Ej: Gramática"
              required
              className="w-full bg-[#FAF8F5] border border-[#E6E0D4] focus:border-[#2C2621] rounded-xl px-3 py-2 text-sm text-[#2C2621] outline-none font-medium"
            />
          </div>

          {/* Cards Selector Section */}
          <div className="flex-1 flex flex-col min-h-0 space-y-2 pt-2 border-t border-[#F0EBE1]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2621]">
                Seleccionar Tarjetas ({selectedCardIds.length}/{cards.length})
              </span>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[#2C2621] underline hover:text-black"
                >
                  Todas / All
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[#7C746A] underline hover:text-[#2C2621]"
                >
                  Ninguna / None
                </button>
              </div>
            </div>

            {/* Internal Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#A0988C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tarjeta..."
                className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#2C2621] outline-none"
              />
            </div>

            {/* Scrollable Checklist */}
            <div className="flex-1 overflow-y-auto max-h-48 border border-[#E6E0D4] rounded-xl divide-y divide-[#F5F2EB] bg-[#FAF8F5]">
              {filteredCards.length === 0 ? (
                <p className="p-4 text-center text-xs text-[#7C746A]">No se encontraron tarjetas.</p>
              ) : (
                filteredCards.map((card) => {
                  const isSelected = selectedCardIds.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleSelectCard(card.id)}
                      className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition ${
                        isSelected ? 'bg-[#F5F2EB]' : 'hover:bg-white'
                      }`}
                    >
                      <div className="pr-2 min-w-0">
                        <p className="font-bold text-[#2C2621] truncate">{card.text_es}</p>
                        <p className="text-[11px] text-[#5C5549] italic truncate">{card.translation_en}</p>
                      </div>
                      <div className="shrink-0 text-[#2C2621]">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#2C2621]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#A0988C]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EBE1]">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#F5F2EB] hover:bg-[#E6E0D4] text-[#2C2621] rounded-xl px-3 py-2 text-xs font-medium"
            >
              Cancelar / Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !tagName.trim() || selectedCardIds.length === 0}
              className="bg-[#2C2621] hover:bg-[#423C35] disabled:opacity-50 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              <span>Añadir Etiqueta / Apply Tag ({selectedCardIds.length})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
