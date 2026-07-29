# -*- coding: utf-8 -*-
import json
import re
import os

# Establecer la variable ANTES de importar verbecc
os.environ["VERBECC_ENABLE_ML_PREDICTION"] = "False"
os.environ["ENABLE_ML_PREDICTION"] = "False"

from verbecc import CompleteConjugator
from lemminflect import getInflection
cg = CompleteConjugator(lang="es")


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


def extract_infinitive(raw_text: str) -> str:
    """Extrae el verbo en infinitivo (-ar, -er, -ir) de la frase."""
    if not raw_text:
        return "comer"
    clean = raw_text.strip().lower()
    words = re.findall(r'[a-záéíóúñ]+', clean)
    for w in words:
        if w.endswith(('ar', 'er', 'ir')) and len(w) >= 2:
            return w
    return words[0] if words else "comer"


def clean_english_verb(raw_en: str) -> str:
    """Extrae la raíz limpia del verbo en inglés sin 'to '."""
    if not raw_en:
        return "do"
    v = raw_en.strip().lower()
    v = re.sub(r'[^a-z\s]', '', v)
    if v.startswith("to "):
        v = v[3:].strip()
    return v or "do"


def get_english_forms(verb_en: str):
    """Genera automáticamente las inflexiones del verbo en inglés usando lemminflect (sin hardcoding)."""
    base = clean_english_verb(verb_en)
    
    # 3rd person singular (e.g. eats, goes)
    try:
        third_sg = getInflection(base, tag='VBZ')[0]
    except Exception:
        third_sg = base + ('es' if base.endswith(('s', 'sh', 'ch', 'x', 'z', 'o')) else 's')

    # Past tense (e.g. ate, went, spoke)
    try:
        past_val = getInflection(base, tag='VBD')[0]
    except Exception:
        past_val = base + 'ed'

    # Gerund / -ing (e.g. eating, going, speaking)
    try:
        ing_val = getInflection(base, tag='VBG')[0]
    except Exception:
        ing_val = base + 'ing'

    return {
        "base": base,
        "third_sg": third_sg,
        "past": past_val,
        "ing": ing_val
    }


def strip_pronoun(form_str: str) -> str:
    """Elimina el pronombre líder devuelto por verbecc (ej: 'yo como' -> 'como', 'él va' -> 'va')."""
    if not form_str:
        return ""
    parts = form_str.strip().split()
    if len(parts) > 1 and parts[0].lower() in ['yo', 'tú', 'tu', 'él', 'el', 'ella', 'usted', 'nosotros', 'nosotras', 'vosotros', 'vosotras', 'ellos', 'ellas', 'ustedes', 'vos']:
        return " ".join(parts[1:])
    return form_str.strip()


def extract_tenses_from_verbecc(infinitive_es: str):
    """Extrae todas las conjugaciones de verbecc para los 5 tiempos verbales."""
    try:
        raw_json = conjugator_engine.conjugate(infinitive_es).to_json()
        data = json.loads(raw_json)
        moods = data.get('moods', {})
    except Exception as e:
        print(f"[Conjugator Error] Fallback verbecc for {infinitive_es}: {e}")
        return None

    indicativo = moods.get('indicativo', {})
    imperativo = moods.get('imperativo', {})

    def parse_tense_map(item_list):
        res = {}
        for item in item_list:
            p = str(item.get('p'))
            n = str(item.get('n'))
            key = (p, n)
            if key not in res and item.get('c'):
                full_val = fix_encoding(item['c'][0])
                res[key] = strip_pronoun(full_val)
        return res

    return {
        "presente": parse_tense_map(indicativo.get('presente', [])),
        "preterito": parse_tense_map(indicativo.get('pretérito-perfecto-simple', [])),
        "imperfecto": parse_tense_map(indicativo.get('pretérito-imperfecto', [])),
        "futuro": parse_tense_map(indicativo.get('futuro', [])),
        "imperativo": parse_tense_map(imperativo.get('afirmativo', [])),
    }


def get_verb_conjugations(verb_es: str, verb_en: str = ""):
    infinitive_es = extract_infinitive(verb_es)
    en_forms = get_english_forms(verb_en)
    
    # Fully automated Spanish verb conjugations using verbecc model
    verbecc_data = extract_tenses_from_verbecc(infinitive_es)

    persons_meta = [
        {"p": "1", "n": "s", "es": "yo", "en_pres": en_forms["base"], "en_past": en_forms["past"], "was_were": "was"},
        {"p": "2", "n": "s", "es": "tú", "en_pres": en_forms["base"], "en_past": en_forms["past"], "was_were": "were"},
        {"p": "3", "n": "s", "es": "él / ella / usted", "en_pres": en_forms["third_sg"], "en_past": en_forms["past"], "was_were": "was"},
        {"p": "1", "n": "p", "es": "nosotros / as", "en_pres": en_forms["base"], "en_past": en_forms["past"], "was_were": "were"},
        {"p": "2", "n": "p", "es": "vosotros / as", "en_pres": en_forms["base"], "en_past": en_forms["past"], "was_were": "were"},
        {"p": "3", "n": "p", "es": "ellos / ellas", "en_pres": en_forms["base"], "en_past": en_forms["past"], "was_were": "were"},
    ]

    imperative_meta = [
        {"p": "2", "n": "s", "es": "tú", "en": f"{en_forms['base']}!"},
        {"p": "3", "n": "s", "es": "usted", "en": f"{en_forms['base']}!"},
        {"p": "1", "n": "p", "es": "nosotros", "en": f"let's {en_forms['base']}!"},
        {"p": "2", "n": "p", "es": "vosotros", "en": f"{en_forms['base']}!"},
        {"p": "3", "n": "p", "es": "ustedes", "en": f"{en_forms['base']}!"},
    ]

    # Helper to get form for (p, n) or default
    def get_es_form(tense_key, p, n):
        if verbecc_data and tense_key in verbecc_data:
            form = verbecc_data[tense_key].get((p, n))
            if form:
                return form
        return infinitive_es

    # 1. Presente
    pres_forms = [{
        "personEs": pm["es"],
        "verbEs": get_es_form("presente", pm["p"], pm["n"]),
        "personEn": pm["es"].replace(" / as", "").replace(" / ella / usted", ""),
        "verbEn": pm["en_pres"]
    } for pm in persons_meta]

    # 2. Pretérito Indefinido
    pret_forms = [{
        "personEs": pm["es"],
        "verbEs": get_es_form("preterito", pm["p"], pm["n"]),
        "personEn": pm["es"].replace(" / as", "").replace(" / ella / usted", ""),
        "verbEn": pm["en_past"]
    } for pm in persons_meta]

    # 3. Pretérito Imperfecto
    imp_forms = [{
        "personEs": pm["es"],
        "verbEs": get_es_form("imperfecto", pm["p"], pm["n"]),
        "personEn": pm["es"].replace(" / as", "").replace(" / ella / usted", ""),
        "verbEn": f"{pm['was_were']} {en_forms['ing']} / used to {en_forms['base']}"
    } for pm in persons_meta]

    # 4. Futuro Simple
    fut_forms = [{
        "personEs": pm["es"],
        "verbEs": get_es_form("futuro", pm["p"], pm["n"]),
        "personEn": pm["es"].replace(" / as", "").replace(" / ella / usted", ""),
        "verbEn": f"will {en_forms['base']}"
    } for pm in persons_meta]

    # 5. Imperativo
    impv_forms = [{
        "personEs": im["es"],
        "verbEs": f"¡{get_es_form('imperativo', im['p'], im['n'])}!",
        "personEn": f"({im['es']})",
        "verbEn": im["en"]
    } for im in imperative_meta]

    return {
        "infinitiveEs": infinitive_es,
        "infinitiveEn": en_forms["base"],
        "tenses": {
            "presente": {
                "tenseNameEs": "Presente",
                "tenseNameEn": "Present Tense",
                "forms": pres_forms
            },
            "preterito": {
                "tenseNameEs": "Pretérito Indefinido",
                "tenseNameEn": "Past Simple",
                "forms": pret_forms
            },
            "imperfecto": {
                "tenseNameEs": "Pretérito Imperfecto",
                "tenseNameEn": "Past Imperfect & Continuous",
                "forms": imp_forms
            },
            "futuro": {
                "tenseNameEs": "Futuro Simple",
                "tenseNameEn": "Future Tense",
                "forms": fut_forms
            },
            "imperativo": {
                "tenseNameEs": "Imperativo (Órdenes)",
                "tenseNameEn": "Imperative (Commands)",
                "forms": impv_forms
            }
        }
    }
