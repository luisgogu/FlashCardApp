import React, { useState, useMemo } from 'react';
import type { Card } from '../types/card';
import { Search, Edit2, Clock, Plus, X } from 'lucide-react';
import { VerbConjugatorTable } from './VerbConjugatorTable';
import { CreateTagModal } from './CreateTagModal';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

interface GlossaryViewProps {
  cards: Card[];
  isLoading: boolean;
  onCardClick: (card: Card) => void;
  onRefresh: () => void;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({
  cards,
  isLoading,
  onCardClick,
  onRefresh,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);

  // Helper to format date cleanly
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to capitalize tag
  const capTag = (tStr: string) => (tStr ? tStr.trim().charAt(0).toUpperCase() + tStr.trim().slice(1) : '');

  // Extract all unique standardized tags (Title Case)
  const allTags = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      if (c.tags) {
        c.tags.split(',').forEach((tStr) => {
          const trimmed = capTag(tStr);
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }, [cards]);

  // Filter cards by search query (text, tags, or date) and tag filter
  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return cards.filter((card) => {
      const formattedDate = formatDate(card.updated_at || card.created_at).toLowerCase();
      const rawDateStr = (card.updated_at || card.created_at || '').toLowerCase();

      const matchesSearch =
        !q ||
        card.text_es.toLowerCase().includes(q) ||
        card.translation_en.toLowerCase().includes(q) ||
        (card.note && card.note.toLowerCase().includes(q)) ||
        (card.tags && card.tags.toLowerCase().includes(q)) ||
        formattedDate.includes(q) ||
        rawDateStr.includes(q);

      const matchesTag =
        !selectedTag ||
        (card.tags &&
          card.tags
            .split(',')
            .map((tStr) => capTag(tStr))
            .includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [cards, searchQuery, selectedTag]);

  const isVerbCard = (card: Card) => {
    if (!card.tags) return false;
    return card.tags.toLowerCase().split(',').some((tStr) => tStr.trim().includes('verbo'));
  };

  const handleDeleteTagGlobally = async (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    try {
      await api.deleteTagGlobally(tag);
      if (selectedTag === tag) {
        setSelectedTag(null);
      }
      onRefresh();
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 animate-fade-in pb-24">
      {/* Header */}
      <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#2C2621]">{t('glossary_title')}</h2>
            <p className="text-xs text-[#7C746A]">({filteredCards.length} {t('cards_count')})</p>
          </div>

          {/* Button to open Create Tag Modal */}
          <button
            onClick={() => setIsCreateTagOpen(true)}
            className="bg-[#2C2621] hover:bg-[#423C35] text-white rounded-xl py-1.5 px-3 text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('create_tag_btn')}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A0988C] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-[#FAF8F5] border border-[#E6E0D4] focus:border-[#2C2621] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] outline-none placeholder:text-[#A0988C]"
          />
        </div>

        {/* Tag Filters Chips with Delete Cross ('×') */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-lg border shrink-0 font-medium transition cursor-pointer ${
                selectedTag === null
                  ? 'bg-[#2C2621] text-white border-[#2C2621]'
                  : 'bg-[#FAF8F5] text-[#5C5549] border-[#E6E0D4] hover:bg-[#F5F2EB]'
              }`}
            >
              {t('all_filter')}
            </button>
            {allTags.map((tag) => (
              <div
                key={tag}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border shrink-0 font-medium transition ${
                  selectedTag === tag
                    ? 'bg-[#2C2621] text-white border-[#2C2621]'
                    : 'bg-[#FAF8F5] text-[#5C5549] border-[#E6E0D4] hover:bg-[#F5F2EB]'
                }`}
              >
                <button
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className="outline-none cursor-pointer"
                >
                  #{tag}
                </button>
                <button
                  onClick={(e) => handleDeleteTagGlobally(e, tag)}
                  title={`Eliminar etiqueta #${tag}`}
                  className="hover:text-red-400 p-0.5 ml-0.5 rounded transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cards List */}
      {isLoading ? (
        <p className="text-xs text-[#7C746A] py-8 text-center">{t('loading_glossary')}</p>
      ) : filteredCards.length === 0 ? (
        <div className="bg-white border border-[#E6E0D4] rounded-2xl p-6 text-center text-xs text-[#7C746A]">
          {t('no_cards_found')}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => onCardClick(card)}
              className="bg-white border border-[#E6E0D4] hover:border-[#2C2621] rounded-2xl p-3.5 transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#2C2621] group-hover:underline">
                    {card.text_es}
                  </p>
                  <p className="text-xs text-[#5C5549] italic mt-0.5">
                    {card.translation_en}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-[#A0988C] font-mono">#{filteredCards.length - index}</span>
                  <Edit2 className="w-3.5 h-3.5 text-[#A0988C] group-hover:text-[#2C2621] transition" />
                </div>
              </div>

              {card.note && (
                <p className="mt-2 text-xs text-[#7C746A] bg-[#FAF8F5] p-2 rounded-xl border border-[#F0EBE1]">
                  {card.note}
                </p>
              )}

              {/* Automatic Verb Conjugations for 'verbo' cards */}
              {isVerbCard(card) && (
                <VerbConjugatorTable
                  infinitiveEs={card.text_es}
                  infinitiveEn={card.translation_en}
                />
              )}

              <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-[10px] text-[#8C8479]">
                {/* Standardized Capitalized Tags */}
                {card.tags ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {card.tags.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#F5F2EB] text-[#5C5549] px-2 py-0.5 rounded-md text-[10px] font-medium"
                      >
                        #{capTag(tag)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span />
                )}

                {/* Last updated metadata */}
                <div className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-[#A0988C]" />
                  <span>{t('modified_label')} {formatDate(card.updated_at || card.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tag Modal */}
      <CreateTagModal
        cards={cards}
        isOpen={isCreateTagOpen}
        onClose={() => setIsCreateTagOpen(false)}
        onTagCreated={onRefresh}
      />
    </div>
  );
};
