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
  footer_dev_note: { es: 'Desarrollada por Luis González 👨‍💻', en: 'Made by Luis González 👨‍💻' },

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
  reminder_time_label: { es: 'Hora del aviso:', en: 'Reminder time:' },
  save_notification_prefs: { es: 'Guardar preferencias de notificación', en: 'Save notification preferences' },
  test_push_btn: { es: 'Probar Push', en: 'Test Push' },
  test_email_btn: { es: 'Probar Email', en: 'Test Email' },
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
  spell_correction: { es: 'Corrección ortográfica:', en: 'Spelling correction:' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
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
