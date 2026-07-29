# -*- coding: utf-8 -*-
import re
from typing import List
from deep_translator import GoogleTranslator
from spellchecker import SpellChecker

# Initialize Spanish spellchecker
spell_es = SpellChecker(language='es')


def fix_encoding(text: str) -> str:
    """Corrige automáticamente mojibake / caracteres UTF-8 mal codificados en Windows."""
    if not isinstance(text, str):
        return str(text)
    try:
        if 'Ã' in text or 'Â' in text:
            return text.encode('latin-1').decode('utf-8')
    except Exception:
        pass
    return text


def capitalize_tag(tag_str: str) -> str:
    """Convierte cada etiqueta a Capitalized (primera letra en mayúscula)."""
    if not tag_str:
        return ""
    tags = [t.strip().capitalize() for t in tag_str.split(',') if t.strip()]
    return ", ".join(tags)


def get_top_es_suggestions(text_es: str) -> List[str]:
    """Genera hasta 3 mejores sugerencias ortográficas/gramaticales en español."""
    text_clean = text_es.strip()
    if not text_clean or len(text_clean) < 2:
        return []

    raw_candidates = []

    # 1. Roundtrip translation candidate (gives full grammar, accents & punctuation)
    try:
        translated_en = GoogleTranslator(source='auto', target='en').translate(text_clean)
        if translated_en and isinstance(translated_en, str):
            reconstructed_es = GoogleTranslator(source='en', target='es').translate(translated_en)
            if reconstructed_es and isinstance(reconstructed_es, str):
                rec_clean = fix_encoding(reconstructed_es.strip())
                if rec_clean:
                    raw_candidates.append(rec_clean)
    except Exception as e:
        print(f"[Roundtrip Error]: {e}")

    # 2. Compound word split candidate (e.g. "puedir" -> "puedo ir", "comoestas" -> "cómo estás")
    words = text_clean.split()
    if len(words) == 1 and len(text_clean) >= 5:
        w = text_clean.lower()
        for i in range(3, len(w) - 1):
            left, right = w[:i], w[i:]
            left_fixed = 'puedo' if left in ('pued', 'puedo') else (spell_es.correction(left) or left)
            right_fixed = spell_es.correction(right) or right
            if left_fixed in spell_es and right_fixed in spell_es:
                comp = f"{left_fixed} {right_fixed}"
                if comp not in raw_candidates:
                    raw_candidates.append(comp)

    # 3. Spellchecker candidates for individual words
    for word in words:
        if len(word) > 2 and word.lower() not in spell_es:
            cands = list(spell_es.candidates(word.lower()) or [])
            for cand in cands[:4]:
                if word.istitle():
                    cand = cand.capitalize()
                elif word.isupper():
                    cand = cand.upper()
                replaced = text_clean.replace(word, cand)
                if replaced not in raw_candidates:
                    raw_candidates.append(replaced)

    # Clean, deduplicate while preserving order, max 3
    final_sugs = []
    seen = set()
    for s in raw_candidates:
        s_clean = fix_encoding(s).strip()
        s_norm = s_clean.lower()
        if s_norm not in seen and s_norm != text_clean.lower():
            seen.add(s_norm)
            final_sugs.append(s_clean)

    return final_sugs[:3]


def suggest_translation_and_correction(text_es: str):
    """Genera sugerencias de traducción al inglés y Top 3 correcciones ortográficas/gramaticales en español."""
    if not text_es or not text_es.strip():
        return {
            "original": "",
            "corrected_es": None,
            "suggestions_es": [],
            "translation_en": None
        }

    clean_text = text_es.strip()
    translation_en = None

    try:
        if len(clean_text) >= 2:
            translated_en = GoogleTranslator(source='auto', target='en').translate(clean_text)
            if translated_en and isinstance(translated_en, str):
                translation_en = fix_encoding(translated_en.strip())
    except Exception as e:
        print(f"[Translation Error]: {e}")

    top_suggestions = get_top_es_suggestions(clean_text)

    return {
        "original": clean_text,
        "corrected_es": top_suggestions[0] if top_suggestions else None,
        "suggestions_es": top_suggestions,
        "translation_en": translation_en
    }
