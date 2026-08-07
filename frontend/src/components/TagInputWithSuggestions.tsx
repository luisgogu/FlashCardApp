import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';

interface TagInputWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  existingTags: string[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export const TagInputWithSuggestions: React.FC<TagInputWithSuggestionsProps> = ({
  value,
  onChange,
  existingTags,
  placeholder,
  className,
  id,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse existing tags in value
  const parts = useMemo(() => value.split(','), [value]);
  const currentTokenRaw = parts[parts.length - 1] || '';
  const currentToken = currentTokenRaw.trim().toLowerCase();

  // Normalize currently used tags in input
  const usedTagsSet = useMemo(() => {
    const set = new Set<string>();
    parts.forEach((p, idx) => {
      // ignore the last part if user is actively typing it
      if (idx < parts.length - 1 || !currentToken) {
        const trimmed = p.trim().toLowerCase();
        if (trimmed) set.add(trimmed);
      }
    });
    return set;
  }, [parts, currentToken]);

  // Filter matching suggestions for current token
  const matchingSuggestions = useMemo(() => {
    if (!currentToken) return [];
    return existingTags.filter((tag) => {
      const tagLower = tag.trim().toLowerCase();
      return (
        tagLower.includes(currentToken) &&
        !usedTagsSet.has(tagLower) &&
        tagLower !== currentToken
      );
    });
  }, [currentToken, existingTags, usedTagsSet]);

  // Available quick tags when input is empty or typing
  const quickTags = useMemo(() => {
    return existingTags.filter((tag) => {
      const tagLower = tag.trim().toLowerCase();
      return !usedTagsSet.has(tagLower);
    }).slice(0, 6);
  }, [existingTags, usedTagsSet]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTag = (suggestedTag: string) => {
    const previousParts = parts.slice(0, parts.length - 1).map((p) => p.trim()).filter(Boolean);
    const newParts = [...previousParts, suggestedTag];
    const newValue = newParts.join(', ') + ', ';
    onChange(newValue);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={className}
        />
      </div>

      {/* AUTOCOMPLETE DROPDOWN MATCHES */}
      {isFocused && matchingSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#E6E0D4] rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto animate-fade-in space-y-1">
          <div className="text-[10px] font-bold text-[#7C746A] uppercase px-2 py-0.5 tracking-wider">
            Sugerencias de etiquetas
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchingSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur
                  handleSelectTag(tag);
                }}
                className="bg-[#2C2621] hover:bg-[#423C35] text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <TagIcon className="w-3 h-3 text-[#C86D51]" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUICK ADD EXISTING TAGS CHIPS */}
      {isFocused && matchingSuggestions.length === 0 && quickTags.length > 0 && (
        <div className="mt-1.5 bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl p-2 animate-fade-in space-y-1">
          <div className="text-[10px] font-bold text-[#7C746A] uppercase px-1 tracking-wider flex items-center gap-1">
            <TagIcon className="w-3 h-3 text-[#C86D51]" />
            <span>Tus etiquetas existentes:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur
                  handleSelectTag(tag);
                }}
                className="bg-white hover:bg-[#FAF8F5] border border-[#E6E0D4] hover:border-[#2C2621] text-[#2C2621] text-xs font-medium px-2.5 py-0.5 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3 text-[#C86D51]" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
