import type { Card, CardCreate, DuplicateCheckResponse } from '../types/card';

const API_BASE_URL = '/api';

export interface SuggestionResponse {
  original: string;
  corrected_es: string | null;
  suggestions_es?: string[];
  translation_en: string | null;
}

function getAuthHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };
  const token = localStorage.getItem('flashcardapp_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  /**
   * Check for duplicate phrases in real-time.
   */
  async checkDuplicates(query: string): Promise<DuplicateCheckResponse> {
    if (!query.trim()) {
      return { query, exact_match: null, partial_matches: [], has_duplicates: false };
    }
    const encodedQuery = encodeURIComponent(query.trim());
    const res = await fetch(`${API_BASE_URL}/cards/check-duplicate?query=${encodedQuery}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al comprobar duplicados');
    }
    return res.json();
  },

  /**
   * Fetch real-time spellcheck and translation suggestions.
   */
  async getSuggestions(text: string): Promise<SuggestionResponse> {
    if (!text.trim()) {
      return { original: '', corrected_es: null, translation_en: null };
    }
    const encodedText = encodeURIComponent(text.trim());
    const res = await fetch(`${API_BASE_URL}/translate/suggest?text=${encodedText}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al obtener sugerencias de traducción');
    }
    return res.json();
  },

  /**
   * Fetch automatic verb conjugations from backend API.
   */
  async getVerbConjugations(verb: string, translation = ''): Promise<any> {
    const encVerb = encodeURIComponent(verb.trim());
    const encTrans = encodeURIComponent(translation.trim());
    const res = await fetch(`${API_BASE_URL}/verbs/conjugate?verb=${encVerb}&translation=${encTrans}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al obtener las conjugaciones del verbo');
    }
    return res.json();
  },

  /**
   * Delete a tag globally from all cards.
   */
  async deleteTagGlobally(tagName: string): Promise<{ affected_count: number }> {
    const encTag = encodeURIComponent(tagName.trim());
    const res = await fetch(`${API_BASE_URL}/tags/${encTag}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al eliminar la etiqueta globalmente');
    }
    return res.json();
  },

  /**
   * Apply a tag to a list of card IDs.
   */
  async applyTagToCards(tagName: string, cardIds: number[]): Promise<{ affected_count: number }> {
    const res = await fetch(`${API_BASE_URL}/tags/apply`, {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ tag_name: tagName.trim(), card_ids: cardIds }),
    });
    if (!res.ok) {
      throw new Error('Error al aplicar la etiqueta a las tarjetas seleccionadas');
    }
    return res.json();
  },

  /**
   * Get cards due for review today.
   */
  async getDueCards(): Promise<Card[]> {
    const res = await fetch(`${API_BASE_URL}/cards/due`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al obtener tarjetas pendientes de repaso');
    }
    return res.json();
  },

  /**
   * Submit an SRS review score (rating 0..3).
   */
  async reviewCard(id: number, rating: number): Promise<Card> {
    const res = await fetch(`${API_BASE_URL}/cards/${id}/review`, {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ rating }),
    });
    if (!res.ok) {
      throw new Error('Error al enviar el repaso');
    }
    return res.json();
  },

  /**
   * Delete ALL cards from library (Danger Zone).
   */
  async deleteAllCards(): Promise<{ deleted_count: number }> {
    const res = await fetch(`${API_BASE_URL}/cards/all`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al eliminar todas las tarjetas');
    }
    return res.json();
  },

  /**
   * [DEBUG] Reset all cards to be due immediately.
   */
  async resetSrsDebug(): Promise<{ reset_count: number }> {
    const res = await fetch(`${API_BASE_URL}/debug/reset-srs`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al resetear tarjetas para debug');
    }
    return res.json();
  },

  /**
   * Create a new card (chunk).
   */
  async createCard(data: CardCreate): Promise<Card> {
    const res = await fetch(`${API_BASE_URL}/cards`, {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('Error al guardar la tarjeta');
    }
    return res.json();
  },

  /**
   * Update an existing card.
   */
  async updateCard(id: number, data: Partial<CardCreate>): Promise<Card> {
    const res = await fetch(`${API_BASE_URL}/cards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('Error al actualizar la tarjeta');
    }
    return res.json();
  },

  /**
   * Delete a card.
   */
  async deleteCard(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/cards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al eliminar la tarjeta');
    }
  },

  /**
   * List all cards.
   */
  async getCards(skip = 0, limit = 1000): Promise<Card[]> {
    const res = await fetch(`${API_BASE_URL}/cards?skip=${skip}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al listar las tarjetas');
    }
    return res.json();
  },

  /**
   * Change user password.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Error al cambiar la contraseña');
    }
    return res.json();
  },

  /**
   * Get user notification preferences.
   */
  async getNotificationSettings(): Promise<{ reminder_time: string; reminder_enabled: boolean; notification_channel: string }> {
    const res = await fetch(`${API_BASE_URL}/notifications/settings`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Error al obtener preferencias de notificación');
    }
    return res.json();
  },

  /**
   * Update notification preferences.
   */
  async updateNotificationSettings(settings: { reminder_time: string; reminder_enabled: boolean; notification_channel: string }): Promise<{ reminder_time: string; reminder_enabled: boolean; notification_channel: string }> {
    const res = await fetch(`${API_BASE_URL}/notifications/settings`, {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      throw new Error('Error al guardar preferencias de notificación');
    }
    return res.json();
  },

  /**
   * Send test email notification.
   */
  async sendTestEmail(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/notifications/test-email`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Error enviando el correo de prueba');
    }
    return res.json();
  },

  /**
   * Delete current user account permanently.
   */
  async deleteAccount(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/account`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Error al eliminar la cuenta');
    }
    return res.json();
  },
};
