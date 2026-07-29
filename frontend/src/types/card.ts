export interface Card {
  id: number;
  text_es: string;
  translation_en: string;
  note?: string | null;
  tags?: string | null;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  next_review_date: string;
  created_at: string;
  updated_at: string;
}

export interface CardCreate {
  text_es: string;
  translation_en: string;
  note?: string;
  tags?: string;
}

export interface DuplicateCheckResponse {
  query: string;
  exact_match: Card | null;
  partial_matches: Card[];
  has_duplicates: boolean;
}
