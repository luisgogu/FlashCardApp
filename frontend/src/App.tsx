import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import type { TabType } from './components/Navbar';
import { AddCardForm } from './components/AddCardForm';
import { GlossaryView } from './components/GlossaryView';
import { ReviewModuleView } from './components/ReviewModuleView';
import { SettingsView } from './components/SettingsView';
import { EditCardModal } from './components/EditCardModal';
import { NotificationCardModal } from './components/NotificationCardModal';
import { AuthScreen } from './components/AuthScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { FlipModeProvider } from './context/FlipModeContext';
import { api } from './services/api';
import type { Card } from './types/card';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam === 'review' || tabParam === 'glossary' || tabParam === 'settings' || tabParam === 'add') {
        return tabParam;
      }
    }
    return 'add';
  });
  const [cards, setCards] = useState<Card[]>([]);
  const [dueCardsCount, setDueCardsCount] = useState(0);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<Card | null>(null);

  // Notification deep-link spotlight state (?flashcard_id=... or Service Worker postMessage)
  const [pendingSpotlight, setPendingSpotlight] = useState<{ cardId: number; triggerTs: number } | null>(() => {
    if (typeof window !== 'undefined') {
      const rawId = new URLSearchParams(window.location.search).get('flashcard_id');
      const parsed = rawId ? Number(rawId) : NaN;
      if (!Number.isNaN(parsed) && parsed > 0) {
        return { cardId: parsed, triggerTs: Date.now() };
      }
    }
    return null;
  });
  const [spotlightCard, setSpotlightCard] = useState<{ card: Card; key: number } | null>(null);
  const cardsRef = useRef<Card[]>(cards);
  cardsRef.current = cards;

  // URL token detection for password recovery
  const [resetToken, setResetToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('reset_token') || params.get('token') || null;
    }
    return null;
  });
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  const fetchCards = async () => {
    if (!user) return;
    try {
      setIsLoadingCards(true);
      const data = await api.getCards();
      const due = await api.getDueCards();
      setCards(data);
      setDueCardsCount(due.length);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [activeTab, user]);

  // Listen for Service Worker notification clicks when PWA is already open in background
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'NOTIFICATION_CLICK') return;
      const directCardId = Number(event.data.cardId);
      if (!Number.isNaN(directCardId) && directCardId > 0) {
        setPendingSpotlight({ cardId: directCardId, triggerTs: Date.now() });
        return;
      }
      if (typeof event.data.url === 'string') {
        try {
          const parsedUrl = new URL(event.data.url, window.location.origin);
          const urlCardId = Number(parsedUrl.searchParams.get('flashcard_id'));
          if (!Number.isNaN(urlCardId) && urlCardId > 0) {
            setPendingSpotlight({ cardId: urlCardId, triggerTs: Date.now() });
            return;
          }
          const tab = parsedUrl.searchParams.get('tab');
          if (tab === 'review' || tab === 'glossary' || tab === 'settings' || tab === 'add') {
            setActiveTab(tab);
          }
        } catch {
          // Ignore malformed URLs
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
  }, []);

  // Resolve pending flashcard notification spotlight once user is authenticated
  useEffect(() => {
    if (!user || isAuthLoading || !pendingSpotlight) return;

    let cancelled = false;
    const { cardId, triggerTs } = pendingSpotlight;

    (async () => {
      try {
        const fetched = await api.getCard(cardId);
        if (!cancelled) {
          setSpotlightCard({ card: fetched, key: triggerTs });
        }
      } catch {
        const fallback = cardsRef.current.find((c) => c.id === cardId);
        if (!cancelled && fallback) {
          setSpotlightCard({ card: fallback, key: triggerTs });
        }
      } finally {
        if (!cancelled) {
          setPendingSpotlight(null);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('flashcard_id');
            url.searchParams.delete('autoflip');
            url.searchParams.delete('tab');
            const qs = url.searchParams.toString();
            window.history.replaceState({}, document.title, qs ? `${url.pathname}?${qs}` : url.pathname);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isAuthLoading, pendingSpotlight]);

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#C86D51] mb-2" />
        <p className="text-xs text-[#7C746A] font-medium">{t('loading_app')}</p>
      </div>
    );
  }

  // PASSWORD RESET SCREEN (Triggered by email link ?reset_token=...)
  if (resetToken) {
    return (
      <ResetPasswordScreen
        token={resetToken}
        onSuccess={() => {
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('reset_token');
            url.searchParams.delete('token');
            window.history.replaceState({}, document.title, url.pathname);
          }
          setResetToken(null);
          setAuthSuccessMessage(t('reset_success_msg'));
        }}
        onCancel={() => {
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('reset_token');
            url.searchParams.delete('token');
            window.history.replaceState({}, document.title, url.pathname);
          }
          setResetToken(null);
        }}
      />
    );
  }

  // MANDATORY AUTH SCREEN (NO GUEST MODE)
  if (!user) {
    return <AuthScreen successMessage={authSuccessMessage} />;
  }


  const handleCardAdded = (newCard: Card) => {
    setCards((prev) => [newCard, ...prev]);
    setDueCardsCount((prev) => prev + 1);
  };

  const handleUpdateCard = async (updatedCard: Card) => {
    const res = await api.updateCard(updatedCard.id, {
      text_es: updatedCard.text_es,
      translation_en: updatedCard.translation_en,
      note: updatedCard.note || undefined,
      tags: updatedCard.tags || undefined,
    });
    setCards((prev) => prev.map((c) => (c.id === res.id ? res : c)));
  };

  const handleDeleteCard = async (cardId: number) => {
    await api.deleteCard(cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setDueCardsCount((prev) => Math.max(0, prev - 1));
    setSelectedCardForEdit(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2621] flex flex-col antialiased selection:bg-[#2C2621] selection:text-white">
      {/* App Header */}
      <Header cardCount={cards.length} />

      {/* Main Viewport */}
      <main className="flex-1 w-full pb-24 pt-2">
        {activeTab === 'add' && (
          <div className="space-y-2">
            <AddCardForm onCardAdded={handleCardAdded} existingCards={cards} />
          </div>
        )}

        {activeTab === 'review' && (
          <ReviewModuleView />
        )}

        {activeTab === 'glossary' && (
          <GlossaryView
            cards={cards}
            isLoading={isLoadingCards}
            onCardClick={(card) => setSelectedCardForEdit(card)}
            onRefresh={fetchCards}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            totalCardsCount={cards.length}
            onRefresh={fetchCards}
          />
        )}
      </main>

      {/* Edit Card Modal */}
      {selectedCardForEdit && (
        <EditCardModal
          card={selectedCardForEdit}
          isOpen={Boolean(selectedCardForEdit)}
          onClose={() => setSelectedCardForEdit(null)}
          onSave={handleUpdateCard}
          onDelete={handleDeleteCard}
          existingCards={cards}
        />
      )}

      {/* Lock-Screen Notification Spotlight 3D Auto-Flip Modal */}
      {spotlightCard && (
        <NotificationCardModal
          key={spotlightCard.key}
          card={spotlightCard.card}
          autoFlip={true}
          onClose={() => setSpotlightCard(null)}
          onRated={fetchCards}
        />
      )}

      {/* Bottom Tab Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} dueCount={dueCardsCount} totalCardsCount={cards.length} />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <FlipModeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </FlipModeProvider>
    </LanguageProvider>
  );
}

export default App;
