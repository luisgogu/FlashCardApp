export type TenseKey = 'presente' | 'preterito' | 'imperfecto' | 'futuro' | 'imperativo';

export interface ConjugationItem {
  personEs: string;
  verbEs: string;
  personEn: string;
  verbEn: string;
}

export interface TenseConjugation {
  tenseNameEs: string;
  tenseNameEn: string;
  forms: ConjugationItem[];
}

export interface VerbConjugationData {
  infinitiveEs: string;
  infinitiveEn: string;
  tenses: Record<TenseKey, TenseConjugation>;
}
