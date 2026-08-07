import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import type { TabType } from './components/Navbar';
import { AddCardForm } from './components/AddCardForm';
import { GlossaryView } from './components/GlossaryView';
import { ReviewModuleView } from './components/ReviewModuleView';
import { SettingsView } from './components/SettingsView';
import { EditCardModal } from './components/EditCardModal';
import { AuthScreen } from './components/AuthScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { api } from './services/api';
import type { Card } from './types/card';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('add');
  const [cards, setCards] = useState<Card[]>([]);
  const [dueCardsCount, setDueCardsCount] = useState(0);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<Card | null>(null);

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

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#C86D51] mb-2" />
        <p className="text-xs text-[#7C746A] font-medium">{t('loading_app')}</p>
      </div>
    );
  }

  // MANDATORY AUTH SCREEN (NO GUEST MODE)
  if (!user) {
    return <AuthScreen />;
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

      {/* Bottom Tab Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} dueCount={dueCardsCount} totalCardsCount={cards.length} />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
