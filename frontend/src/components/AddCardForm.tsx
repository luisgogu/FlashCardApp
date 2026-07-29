import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../services/api';
import type { DuplicateCheckResponse, Card } from '../types/card';
import type { SuggestionResponse } from '../services/api';
import { AlertTriangle, CheckCircle2, Loader2, Plus, Info, Sparkles, Wand2 } from 'lucide-react';

interface AddCardFormProps {
  onCardAdded: (newCard: Card) => void;
}

export const AddCardForm: React.FC<AddCardFormProps> = ({ onCardAdded }) => {
  const [textEs, setTextEs] = useState('');
  const [translationEn, setTranslationEn] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');

  const [isChecking, setIsChecking] = useState(false);
  const [dupResult, setDupResult] = useState<DuplicateCheckResponse | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
  const [isFetchingSuggest, setIsFetchingSuggest] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [forceSave, setForceSave] = useState(false);

  const debouncedTextEs = useDebounce(textEs, 300);

  // Real-time duplicate check & suggestion fetching
  useEffect(() => {
    if (!debouncedTextEs.trim()) {
      setDupResult(null);
      setSuggestion(null);
      setIsChecking(false);
      setIsFetchingSuggest(false);
      return;
    }

    let isMounted = true;
    setIsChecking(true);
    setIsFetchingSuggest(true);

    // Parallel fetch: duplicates check + translation/spellcheck suggestions
    Promise.all([
      api.checkDuplicates(debouncedTextEs),
      api.getSuggestions(debouncedTextEs),
    ])
      .then(([dupRes, sugRes]) => {
        if (isMounted) {
          setDupResult(dupRes);
          setSuggestion(sugRes);
          setIsChecking(false);
          setIsFetchingSuggest(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching real-time data:', err);
        if (isMounted) {
          setIsChecking(false);
          setIsFetchingSuggest(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedTextEs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!textEs.trim() || !translationEn.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      const newCard = await api.createCard({
        text_es: textEs,
        translation_en: translationEn,
        note: note.trim() || undefined,
        tags: tags.trim() || undefined,
      });

      onCardAdded(newCard);

      // Reset form
      setTextEs('');
      setTranslationEn('');
      setNote('');
      setTags('');
      setDupResult(null);
      setSuggestion(null);
      setForceSave(false);

      setToastMessage('¡Tarjeta guardada / Flashcard saved!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error(error);
      alert('Error al guardar la tarjeta.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasExactMatch = Boolean(dupResult?.exact_match);
  const hasPartialMatches = (dupResult?.partial_matches?.length ?? 0) > 0;

  const inputStyle =
    'w-full bg-[#FAF8F5] border border-[#E6E0D4] focus:border-[#2C2621] rounded-xl px-3.5 py-2.5 text-[#2C2621] text-sm outline-none transition-colors placeholder:text-[#A0988C]';

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2C2621] text-white font-medium px-4 py-2 rounded-full shadow-md text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white border border-[#E6E0D4] rounded-2xl p-5 shadow-xs space-y-4">
        {/* Title Header */}
        <div className="border-b border-[#F0EBE1] pb-3">
          <h2 className="text-base font-bold text-[#2C2621]">Crear tarjeta</h2>
          <p className="text-xs text-[#7C746A]">Create flashcard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Spanish Phrase Input */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621]">
              Frase en español *
            </label>
            <span className="block text-[10px] text-[#7C746A] mb-1">Spanish phrase</span>

            <div className="relative">
              <input
                type="text"
                value={textEs}
                onChange={(e) => {
                  setTextEs(e.target.value);
                  setForceSave(false);
                }}
                placeholder="Ej: Tengo ganas de comer tacos..."
                required
                className={`${inputStyle} ${isChecking ? 'pr-9' : ''}`}
              />
              {(isChecking || isFetchingSuggest) && (
                <Loader2 className="w-4 h-4 animate-spin text-[#7C746A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>

            {/* REAL-TIME SPANISH SPELLCHECK TOP 3 SUGGESTIONS */}
            {((suggestion?.suggestions_es && suggestion.suggestions_es.length > 0) || suggestion?.corrected_es) && (
              <div className="mt-1.5 bg-[#FAF8F5] border border-amber-200 rounded-xl p-2 text-xs space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-1.5 text-[#2C2621]">
                  <Wand2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="text-[11px] text-[#7C746A]">
                    {((suggestion?.suggestions_es?.length ?? 0) > 1) ? 'Sugerencias ortográficas:' : 'Corrección ortográfica:'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {(suggestion?.suggestions_es && suggestion.suggestions_es.length > 0
                    ? suggestion.suggestions_es
                    : [suggestion?.corrected_es]
                  ).filter(Boolean).map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTextEs(sug!)}
                      className="bg-[#2C2621] hover:bg-[#423C35] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition shadow-2xs"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* DUPLICATE WARNING BANNERS */}
          {hasExactMatch && !forceSave && dupResult?.exact_match && (
            <div className="bg-[#FFF9EF] border border-[#EAD9BE] rounded-xl p-3 text-xs text-[#4A3B18] space-y-2 animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Frase ya registrada / Already registered</p>
                  <p className="mt-0.5 text-[#6B5527]">
                    "{dupResult.exact_match.text_es}" &rarr;{' '}
                    <span className="italic">{dupResult.exact_match.translation_en}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setForceSave(true)}
                  className="bg-[#2C2621] text-white px-3 py-1 rounded-lg font-medium text-[11px] hover:bg-[#423C35] transition"
                >
                  Guardar de todas formas / Save anyway
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTextEs('');
                    setDupResult(null);
                    setSuggestion(null);
                  }}
                  className="text-[#7C746A] underline px-2 py-1 text-[11px]"
                >
                  Borrar / Clear
                </button>
              </div>
            </div>
          )}

          {hasPartialMatches && !hasExactMatch && dupResult && (
            <div className="bg-[#F7F4EE] border border-[#E6E0D4] rounded-xl p-3 text-xs text-[#2C2621] space-y-1.5 animate-fade-in">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#7C746A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[11px]">Frases similares / Similar phrases:</p>
                  <ul className="list-disc list-inside text-[11px] text-[#5C5549] mt-0.5 space-y-0.5">
                    {dupResult.partial_matches.slice(0, 3).map((match) => (
                      <li key={match.id}>
                        <span className="font-medium text-[#2C2621]">{match.text_es}</span> (
                        {match.translation_en})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* English Translation Input */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621]">
              Traducción al inglés *
            </label>
            <span className="block text-[10px] text-[#7C746A] mb-1">English translation</span>
            <input
              type="text"
              value={translationEn}
              onChange={(e) => setTranslationEn(e.target.value)}
              placeholder="Ej: I feel like eating tacos"
              required
              className={inputStyle}
            />

            {/* REAL-TIME ENGLISH AUTO-TRANSLATION SUGGESTION */}
            {suggestion?.translation_en && (
              <div className="mt-1.5 bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-xs flex items-center justify-between text-[#2C2621] animate-fade-in">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-[11px] text-[#7C746A] shrink-0">Traducción sugerida:</span>
                  <span className="font-bold truncate">{suggestion.translation_en}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTranslationEn(suggestion.translation_en!)}
                  className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-1 rounded-md hover:bg-emerald-900 transition shrink-0"
                >
                  Usar
                </button>
              </div>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621]">
              Nota o Contexto <span className="font-normal text-[#7C746A]">(opcional)</span>
            </label>
            <span className="block text-[10px] text-[#7C746A] mb-1">Note or Context (optional)</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Explicación de uso o situación..."
              className={inputStyle}
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-xs font-bold text-[#2C2621]">
              Etiquetas <span className="font-normal text-[#7C746A]">(separadas por coma)</span>
            </label>
            <span className="block text-[10px] text-[#7C746A] mb-1">Tags (comma separated)</span>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ej: Comida, Verbo, Viajes"
              className={inputStyle}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving || (hasExactMatch && !forceSave)}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-150 flex flex-col items-center justify-center ${
              hasExactMatch && !forceSave
                ? 'bg-[#E6E0D4] text-[#A0988C] cursor-not-allowed'
                : 'bg-[#2C2621] hover:bg-[#423C35] active:scale-[0.99] text-white shadow-xs'
            }`}
          >
            {isSaving ? (
              <span className="flex items-center gap-1.5 py-0.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  {hasExactMatch && forceSave ? 'Guardar de todas formas' : 'Guardar tarjeta'}
                </span>
                <span className="text-[9px] font-normal opacity-70">
                  {hasExactMatch && forceSave ? 'Save anyway' : 'Save flashcard'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
