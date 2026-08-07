# -*- coding: utf-8 -*-
import re
from typing import List
from deep_translator import GoogleTranslator
from spellchecker import SpellChecker

# Initialize Spanish spellchecker
spell_es = SpellChecker(language='es')
spell_es.word_frequency.load_words([
    'ganas', 'tacos', 'taco', 'comer', 'ir', 'estoy', 'tengo', 'hacer', 'decir', 'ver', 'dar',
    'saber', 'poder', 'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar',
    'creer', 'hablar', 'llevar', 'dejar', 'seguir', 'encontrar', 'llamar', 'venir', 'pensar',
    'salir', 'volver', 'tomar', 'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar',
    'empezar', 'esperar', 'buscar', 'existir', 'entrar', 'trabajar', 'escribir', 'perder',
    'producir', 'ocurrir', 'entender', 'pedir', 'recibir', 'recordar', 'terminar', 'permitir',
    'aparecer', 'conseguir', 'comenzar', 'servir', 'sacar', 'necesitar', 'mantener', 'leer',
    'caer', 'cambiar', 'presentar', 'crear', 'abrir', 'considerar', 'oír', 'oir', 'ganar',
    'formar', 'traer', 'partir', 'morir', 'aceptar', 'realizar', 'suponer', 'comprender',
    'lograr', 'explicar', 'preguntar', 'tocar', 'reconocer', 'estudiar', 'alcanzar', 'nacer',
    'dirigir', 'correr', 'utilizar', 'pagar', 'ayudar', 'gustar', 'jugar', 'escuchar',
    'cumplir', 'ofrecer', 'descubrir', 'levantar', 'intentar'
])


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


import urllib.parse
import urllib.request
import json


def get_top_es_suggestions(text_es: str) -> List[str]:
    """Genera hasta 3 mejores sugerencias ortográficas/gramaticales en español usando LanguageTool API.
    Si la frase es 100% correcta (como 'Tú preguntas muchas cosas'), devuelve [] para evitar confusión.
    """
    text_clean = text_es.strip()
    if not text_clean or len(text_clean) < 3:
        return []

    try:
        data = urllib.parse.urlencode({'text': text_clean, 'language': 'es'}).encode('utf-8')
        req = urllib.request.Request(
            'https://api.languagetool.org/v2/check',
            data=data,
            headers={'User-Agent': 'FlashCardApp/1.0'}
        )
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            res_json = json.loads(resp.read().decode('utf-8'))
            matches = res_json.get('matches', [])
            if not matches:
                # 0 errores detectados => la frase está perfecta, no devolver sugerencias espurias
                return []

            suggestions = []
            seen = set()
            for match in matches:
                replacements = match.get('replacements', [])
                offset = match.get('offset', 0)
                length = match.get('length', 0)
                for r in replacements[:3]:
                    val = r.get('value')
                    if val:
                        corrected = text_clean[:offset] + val + text_clean[offset + length:]
                        corrected_clean = fix_encoding(corrected).strip()
                        c_norm = corrected_clean.lower()
                        if c_norm != text_clean.lower() and c_norm not in seen:
                            seen.add(c_norm)
                            suggestions.append(corrected_clean)

            if suggestions:
                return suggestions[:3]
    except Exception as e:
        print(f"[LanguageTool API Warning]: {e}")

    return []


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
            translated_en = GoogleTranslator(source='es', target='en').translate(clean_text)
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
