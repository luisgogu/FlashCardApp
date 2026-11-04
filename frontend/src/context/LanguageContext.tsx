import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

export const translations: Translations = {
  // HEADER & NAVBAR
  app_title: { es: 'FlashCardApp', en: 'FlashCardApp' },
  app_subtitle: { es: 'Aprende y repasa vocabulario en contexto', en: 'Learn and review vocabulary in context' },
  loading_app: { es: 'Cargando FlashCardApp...', en: 'Loading FlashCardApp...' },
  tab_add: { es: 'Añadir', en: 'Add' },
  tab_review: { es: 'Repaso', en: 'Review' },
  tab_glossary: { es: 'Glosario', en: 'Glossary' },
  tab_settings: { es: 'Ajustes', en: 'Settings' },
  cards_count: { es: 'tarjetas', en: 'cards' },
  log_in: { es: 'Acceder', en: 'Log In' },
  log_out: { es: 'Salir', en: 'Log Out' },
  logged_in_as: { es: 'Sesión iniciada como', en: 'Logged in as' },
  student_role: { es: 'Estudiante', en: 'Student' },
  admin_role: { es: 'Admin', en: 'Admin' },

  // AUTH SCREEN & AUTH MODAL
  welcome_back: { es: '¡Bienvenido de nuevo!', en: 'Welcome back!' },
  create_account: { es: 'Crea tu cuenta', en: 'Create your account' },
  sign_in_tab: { es: 'Iniciar Sesión', en: 'Log In' },
  sign_up_tab: { es: 'Crear Cuenta', en: 'Sign Up' },
  sub_login: { es: 'Ingresa tus credenciales para acceder a tus tarjetas.', en: 'Enter your credentials to access your cards.' },
  sub_register: { es: 'Empieza a guardar tus frases y repasar con repetición espaciada.', en: 'Start saving your phrases and reviewing with spaced repetition.' },
  modal_welcome: { es: '¡Hola de nuevo!', en: 'Hello again!' },
  modal_sub_login: { es: 'Ingresa para acceder a tu colección personal de tarjetas.', en: 'Log in to access your personal card collection.' },
  modal_sub_register: { es: 'Guarda tus propias frases y sincroniza tus repasos.', en: 'Save your own phrases and sync your reviews.' },
  name_label: { es: 'Nombre', en: 'Name' },
  name_placeholder: { es: 'Tu nombre o apodo', en: 'Your name or nickname' },
  email_label: { es: 'Correo Electrónico', en: 'Email Address' },
  email_placeholder: { es: 'ejemplo@correo.com', en: 'example@email.com' },
  password_label: { es: 'Contraseña', en: 'Password' },
  password_placeholder: { es: '••••••••', en: '••••••••' },
  submit_login: { es: 'Acceder a mi cuenta', en: 'Log in to my account' },
  submit_register: { es: 'Crear Cuenta', en: 'Create Account' },
  submit_modal_login: { es: 'Entrar', en: 'Log In' },
  submit_modal_register: { es: 'Registrarse', en: 'Sign Up' },
  name_required_err: { es: 'Por favor, ingresa tu nombre', en: 'Please enter your name' },
  generic_error: { es: 'Ocurrió un error al procesar tu solicitud', en: 'An error occurred while processing your request' },
  footer_dev_note: { es: 'FlashCardApp • Repetición espaciada inteligente', en: 'FlashCardApp • Smart spaced repetition' },


  // FORGOT & RESET PASSWORD
  forgot_password_link: { es: '¿Olvidaste tu contraseña?', en: 'Forgot your password?' },
  forgot_password_title: { es: 'Recuperar Contraseña', en: 'Recover Password' },
  forgot_password_sub: { es: 'Introduce tu correo y te enviaremos un enlace seguro para restablecerla.', en: 'Enter your email and we will send you a secure link to reset it.' },
  submit_forgot_password: { es: 'Enviar enlace de recuperación', en: 'Send reset link' },
  forgot_password_sent_title: { es: '¡Enlace enviado!', en: 'Link sent!' },
  forgot_password_sent_msg: { es: 'Si el correo está registrado, recibirás un mensaje en breve. Revisa tu bandeja de entrada o spam.', en: 'If the email is registered, you will receive an email shortly. Check your inbox or spam.' },
  back_to_login: { es: 'Volver al inicio de sesión', en: 'Back to log in' },
  reset_screen_title: { es: 'Restablecer Contraseña', en: 'Reset Password' },
  reset_screen_sub: { es: 'Crea una nueva contraseña segura para tu cuenta.', en: 'Create a new secure password for your account.' },
  new_password_placeholder: { es: 'Nueva contraseña (mínimo 4 caracteres)', en: 'New password (min 4 characters)' },
  confirm_password_label: { es: 'Confirmar nueva contraseña', en: 'Confirm new password' },
  confirm_password_placeholder: { es: 'Repite la nueva contraseña', en: 'Repeat new password' },
  submit_reset_password: { es: 'Guardar nueva contraseña', en: 'Save new password' },
  passwords_dont_match: { es: 'Las contraseñas no coinciden.', en: 'Passwords do not match.' },
  password_too_short: { es: 'La contraseña debe tener al menos 4 caracteres.', en: 'Password must be at least 4 characters.' },
  reset_success_msg: { es: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva clave.', en: 'Password updated successfully! You can now log in with your new password.' },
  invalid_or_expired_token: { es: 'El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.', en: 'The recovery link is invalid or expired. Please request a new one.' },


  // ADD CARD FORM
  add_card_title: { es: 'Crear tarjeta', en: 'Create flashcard' },
  spanish_label: { es: 'Frase en español *', en: 'Spanish phrase *' },
  spanish_placeholder: { es: 'Ej: Tengo ganas de comer tacos...', en: 'Ex: I feel like eating tacos...' },
  english_label: { es: 'Traducción al inglés *', en: 'English translation *' },
  english_placeholder: { es: 'Ej: I feel like eating tacos', en: 'Ex: I feel like eating tacos' },
  notes_label: { es: 'Nota o Contexto (opcional)', en: 'Note or Context (optional)' },
  notes_placeholder: { es: 'Ej: Explicación de uso o situación...', en: 'Ex: Usage explanation or situation...' },
  tags_label: { es: 'Etiquetas (separadas por coma)', en: 'Tags (comma separated)' },
  tags_placeholder: { es: 'Ej: Comida, Verbo, Viajes', en: 'Ex: Food, Verb, Travel' },
  save_card_btn: { es: 'Guardar tarjeta', en: 'Save flashcard' },
  save_anyway_btn: { es: 'Guardar de todas formas', en: 'Save anyway' },
  already_registered: { es: 'Frase ya registrada', en: 'Already registered' },
  clear_btn: { es: 'Borrar', en: 'Clear' },
  similar_phrases: { es: 'Frases similares:', en: 'Similar phrases:' },
  suggested_translation: { es: 'Traducción sugerida:', en: 'Suggested translation:' },
  use_btn: { es: 'Usar', en: 'Use' },
  card_saved_toast: { es: '¡Tarjeta guardada!', en: 'Flashcard saved!' },
  card_save_error: { es: 'Error al guardar la tarjeta.', en: 'Error saving flashcard.' },

  // REVIEW MODULE
  no_due_cards: { es: '¡Todo al día! No tienes tarjetas pendientes para hoy.', en: "All caught up! No cards due for review today." },
  review_all_btn: { es: 'Repasar todas las tarjetas de la biblioteca', en: 'Review all cards in library' },
  rating_again: { es: 'Otra vez', en: 'Again' },
  rating_hard: { es: 'Difícil', en: 'Hard' },
  rating_good: { es: 'Bien', en: 'Good' },
  rating_easy: { es: 'Fácil', en: 'Easy' },
  review_completed_title: { es: '¡Repaso Completado!', en: 'Review Completed!' },
  everything_up_to_date: { es: '¡Todas tus tarjetas están al día!', en: 'Everything is up to date!' },
  total_cards_library: { es: 'Total tarjetas en biblioteca:', en: 'Total cards in library:' },
  due_today_count: { es: 'Pendientes para hoy:', en: 'Due for review today:' },
  check_due_again: { es: 'Comprobar pendientes de nuevo', en: 'Check due cards again' },
  review_all_cards: { es: 'Repasar todas las tarjetas', en: 'Review all cards' },
  loading_review: { es: 'Cargando sesión de repaso...', en: 'Loading review...' },

  // GLOSSARY VIEW
  glossary_title: { es: 'Glosario & Biblioteca', en: 'Glossary & Card Library' },
  create_tag_btn: { es: 'Crear Etiqueta', en: 'Create Tag' },
  all_filter: { es: 'Todos', en: 'All' },
  search_placeholder: { es: 'Buscar por texto, etiqueta o fecha...', en: 'Search by text, tag or date...' },
  loading_glossary: { es: 'Cargando glosario...', en: 'Loading glossary...' },
  no_cards_found: { es: 'No se encontraron tarjetas.', en: 'No cards found.' },
  modified_label: { es: 'Modificado:', en: 'Modified:' },

  // VERB CONJUGATOR
  conjugations_table: { es: 'Tabla de Conjugaciones', en: 'Conjugation Table' },
  loading_conjugations: { es: 'Cargando conjugaciones...', en: 'Loading conjugations...' },
  conjugations_error: { es: 'No se pudieron cargar las conjugaciones.', en: 'Could not load conjugations.' },

  // SETTINGS VIEW
  settings_title: { es: 'Ajustes de Cuenta y Aplicación', en: 'Account & App Settings' },
  logout_btn: { es: 'Salir', en: 'Log Out' },
  change_password_btn: { es: 'Cambiar contraseña', en: 'Change password' },
  cancel_change_password: { es: 'Cancelar cambio de contraseña', en: 'Cancel password change' },
  current_password_label: { es: 'Contraseña actual', en: 'Current password' },
  new_password_label: { es: 'Nueva contraseña', en: 'New password' },
  update_password_btn: { es: 'Actualizar contraseña', en: 'Update password' },
  min_chars: { es: 'Mínimo 4 caracteres', en: 'Minimum 4 characters' },
  notification_channel_title: { es: 'Canal de notificaciones', en: 'Notification channel' },
  channel_off: { es: 'Desactivado', en: 'Disabled' },
  channel_off_sub: { es: 'Sin avisos', en: 'No notifications' },
  channel_push: { es: 'Push', en: 'Push' },
  channel_push_sub: { es: 'Sólo en dispositivo', en: 'Device only' },
  channel_mail: { es: 'Mail', en: 'Email' },
  channel_mail_sub: { es: 'Por correo electrónico', en: 'By email' },
  channel_push_mail: { es: 'Push & Mail', en: 'Push & Email' },
  channel_push_mail_sub: { es: 'Ambos canales', en: 'Both channels' },
  reminder_time_label: { es: 'Hora diaria programada:', en: 'Daily scheduled time:' },
  save_notification_prefs: { es: 'Guardar preferencias de notificación', en: 'Save notification preferences' },
  test_push_btn: { es: 'Probar Push', en: 'Test Push' },
  test_email_btn: { es: 'Probar Email', en: 'Test Email' },
  test_word_push_btn: { es: 'Probar Palabra en Bloqueo', en: 'Test Lock-Screen Word' },
  srs_toggle_title: { es: '1. Aviso del juego de Flashcards (Repaso SRS)', en: '1. Flashcard game reminder (SRS Review)' },
  srs_toggle_sub: { es: 'Te avisa a la hora elegida si tienes tarjetas pendientes.', en: 'Reminds you at the chosen time if you have due cards.' },
  srs_channel_label: { es: 'Canal para el aviso de repaso:', en: 'Review reminder channel:' },
  word_toggle_title: { es: '2. Palabra en español en pantalla de bloqueo', en: '2. Spanish word on lock screen' },
  word_toggle_sub: { es: 'Envía una palabra en español por Push.', en: 'Sends a Spanish word via Push.' },
  toggle_active: { es: 'Activado', en: 'Active' },
  toggle_inactive: { es: 'Desactivado', en: 'Disabled' },
  forgot_in_settings_btn: { es: '¿Olvidaste tu contraseña? Recibir enlace por correo', en: 'Forgot your password? Email me a reset link' },
  forgot_in_settings_sent: { es: 'Enlace de recuperación enviado a tu correo.', en: 'Password reset link sent to your email.' },
  spotlight_badge: { es: 'Palabra de la notificación', en: 'Notification Flashcard' },
  spotlight_spanish_label: { es: 'Español', en: 'Spanish' },
  spotlight_english_label: { es: 'Traducción al Inglés', en: 'English Translation' },
  spotlight_close_btn: { es: 'Cerrar tarjeta', en: 'Close flashcard' },
  spotlight_autoflip_hint: { es: 'Girando a la traducción... (toca para alternar)', en: 'Flipping to translation... (tap to toggle)' },
  danger_zone_title: { es: 'Zona de peligro', en: 'Danger zone' },
  delete_all_cards_btn: { es: 'Eliminar todas mis tarjetas', en: 'Delete all my cards' },
  delete_warning_notice: { es: 'Al eliminar las tarjetas se borrarán permanentemente sus datos y progreso.', en: 'Deleting cards will permanently remove their data and study progress.' },
  admin_tools_title: { es: 'Herramientas de administrador', en: 'Admin tools' },
  reset_srs_btn: { es: 'Resetear repasos SRS (Dev Debug)', en: 'Reset SRS reviews (Dev Debug)' },
  app_info_version: { es: 'Versión:', en: 'Version:' },
  app_info_db: { es: 'Base de datos:', en: 'Database:' },
  app_info_push: { es: 'Notificaciones:', en: 'Notifications:' },
  app_info_creator: { es: 'Creador & Desarrollador:', en: 'Creator & Developer:' },

  // EDIT CARD MODAL
  edit_card_title: { es: 'Editar Tarjeta', en: 'Edit Flashcard' },
  delete_card_btn: { es: 'Eliminar', en: 'Delete' },
  confirm_delete_card: { es: '¿Seguro que deseas eliminar esta tarjeta?', en: 'Are you sure you want to delete this card?' },
  save_btn: { es: 'Guardar', en: 'Save' },
  cancel_btn: { es: 'Cancelar', en: 'Cancel' },
  card_update_error: { es: 'Error al actualizar la tarjeta.', en: 'Error updating flashcard.' },
  card_delete_error: { es: 'Error al eliminar la tarjeta.', en: 'Error deleting flashcard.' },

  // CREATE TAG MODAL
  create_tag_modal_title: { es: 'Crear y Asignar Etiqueta', en: 'Create & Apply Tag' },
  tag_name_label: { es: 'Nombre de la Etiqueta *', en: 'Tag Name *' },
  tag_name_placeholder: { es: 'Ej: Gramática, Verbo, Viajes', en: 'Ex: Grammar, Verb, Travel' },
  select_cards_count: { es: 'Seleccionar Tarjetas', en: 'Select Cards' },
  select_all: { es: 'Todas', en: 'All' },
  select_none: { es: 'Ninguna', en: 'None' },
  search_card_placeholder: { es: 'Buscar tarjeta...', en: 'Search card...' },
  no_cards_found_modal: { es: 'No se encontraron tarjetas.', en: 'No cards found.' },
  apply_tag_btn: { es: 'Añadir Etiqueta', en: 'Apply Tag' },
  tag_name_required_alert: { es: 'Por favor, introduce un nombre para la etiqueta.', en: 'Please enter a name for the tag.' },
  select_at_least_one_card_alert: { es: 'Por favor, selecciona al menos una tarjeta.', en: 'Please select at least one card.' },
  delete_tag_title: { es: 'Eliminar etiqueta', en: 'Delete tag' },

  // SPELLCHECK & FORM
  spell_suggestions: { es: 'Sugerencias ortográficas:', en: 'Spelling suggestions:' },
  spell_correction: { es: 'Corrección ortográfica:', en: 'Spelling correction:' },

  // REVIEW FLIPPER & FLIP MODE
  card_progress: { es: 'Tarjeta', en: 'Card' },
  of_label: { es: 'de', en: 'of' },
  front_label: { es: 'Anverso', en: 'Front' },
  back_label: { es: 'Reverso', en: 'Back' },
  tap_to_flip: { es: 'Pulsa para girar', en: 'Tap to flip' },
  rate_recall: { es: '¿Qué tal la recordaste?', en: 'Rate your recall' },
  english_front_title: { es: 'Inglés (Piensa la traducción)', en: 'English (Recall Spanish translation)' },
  spanish_back_title: { es: 'Respuesta en Español & Notas', en: 'Spanish Answer & Notes' },
  spanish_front_title: { es: 'Español (Piensa la traducción)', en: 'Spanish (Recall English translation)' },
  english_back_title: { es: 'Respuesta en Inglés & Notas', en: 'English Answer & Notes' },
  note_label: { es: 'Nota:', en: 'Note:' },
  flip_mode_section_title: { es: 'Modo de flipeo en repaso', en: 'Review card flip direction' },
  flip_mode_desc: { es: 'Elige la dirección de los idiomas al repasar tus tarjetas.', en: 'Choose language direction when reviewing your cards.' },
  flip_mode_en_es: { es: 'Inglés ➔ Español', en: 'English ➔ Spanish' },
  flip_mode_en_es_sub: { es: 'Anverso: Inglés | Reverso: Español', en: 'Front: English | Back: Spanish' },
  flip_mode_es_en: { es: 'Español ➔ Inglés', en: 'Spanish ➔ English' },
  flip_mode_es_en_sub: { es: 'Anverso: Español | Reverso: Inglés', en: 'Front: Spanish | Back: English' },
  flip_mode_score_notice: { es: 'Nota: La puntuación SRS de la tarjeta se mantiene estática e igual en ambos modos.', en: 'Note: Card SRS score remains static and identical in both modes.' },

  // ACCOUNT DELETION
  delete_account_btn: { es: 'Eliminar mi cuenta definitivamente', en: 'Delete my account permanently' },
  confirm_delete_account: { es: '¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer y borrará permanentemente todas tus tarjetas.', en: 'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your cards.' },
  account_deleted_toast: { es: 'Tu cuenta ha sido eliminada con éxito.', en: 'Your account has been deleted successfully.' },

  // TAG SUGGESTIONS
  tag_suggestions_title: { es: 'Sugerencias de etiquetas', en: 'Tag suggestions' },
  existing_tags_title: { es: 'Tus etiquetas existentes:', en: 'Your existing tags:' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang === 'en' || urlLang === 'es') {
        return urlLang;
      }
    }
    const saved = localStorage.getItem('flashcardapp_lang');
    return (saved === 'en' || saved === 'es') ? saved : 'es';
  });


  useEffect(() => {
    localStorage.setItem('flashcardapp_lang', language);
  }, [language]);

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry['es'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
