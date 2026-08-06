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
  footer_dev_note: { es: 'Desarrollada con cariño por Luis González 👨‍💻❤️', en: 'Made with love by Luis González 👨‍💻❤️' },

  // SETTINGS VIEW
  daily_reminder_title: { es: 'Recordatorio Diario de Repaso (Push)', en: 'Daily Review Reminder (Push)' },
  daily_reminder_desc: {
    es: 'Recibe un aviso diario en tu pantalla de inicio indicando cuántas tarjetas tienes listas para repasar.',
    en: 'Receive a daily reminder on your home screen showing how many cards are due for review.'
  },
  time_label: { es: 'Hora del aviso:', en: 'Reminder time:' },
  save_time: { es: 'Guardar Hora', en: 'Save Time' },
  test_push: { es: 'Probar Notificación', en: 'Test Notification' },
  danger_zone_title: { es: 'Zona de Peligro / Danger Zone', en: 'Danger Zone / Zona de Peligro' },
  total_cards_saved: { es: 'Actualmente tienes', en: 'You currently have' },
  cards_in_library: { es: 'tarjetas guardadas en tu biblioteca.', en: 'cards saved in your library.' },
  delete_all_btn: { es: 'Eliminar todas mis tarjetas', en: 'Delete all my cards' },
  delete_warning: {
    es: 'Al eliminar las tarjetas se borrarán permanentemente sus datos y progreso.',
    en: 'Deleting cards will permanently remove their data and progress.'
  },
  admin_tools_title: { es: 'Herramientas de Administrador / Dev Tools', en: 'Admin Tools / Dev Tools' },
  reset_srs_btn: { es: 'Resetear Repasos SRS (Dev Debug)', en: 'Reset SRS Reviews (Dev Debug)' },
  about_title: { es: 'FlashCardApp PWA', en: 'FlashCardApp PWA' },
  version_label: { es: 'Versión:', en: 'Version:' },
  db_label: { es: 'Base de datos:', en: 'Database:' },
  push_label: { es: 'Notificaciones:', en: 'Notifications:' },
  creator_label: { es: 'Creador & Desarrollador:', en: 'Creator & Developer:' },

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
  conjugations_error: { es: 'No se pudieron cargar las conjugaciones.', en: 'Could not load conjugations.' }
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
