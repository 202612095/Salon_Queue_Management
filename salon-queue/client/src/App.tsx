import React, { useState, useEffect } from 'react';
import { SalonProvider } from './context/SalonContext';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './screens/HomeScreen';
import { JoinQueueScreen } from './screens/JoinQueueScreen';
import { MyStatusScreen } from './screens/MyStatusScreen';
import { ReceptionScreen } from './screens/ReceptionScreen';
import { BarberScreen } from './screens/BarberScreen';
import { TvDisplayScreen } from './screens/TvDisplayScreen';
import { AdminScreen } from './screens/AdminScreen';

const MainApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [activeTicketId, setActiveTicketId] = useState<string>('');

  // Handle URL sync (e.g. /#join, /#status/tkt-123)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('status/')) {
        const id = hash.replace('status/', '');
        setActiveTicketId(id);
        setCurrentScreen('status');
      } else {
        setCurrentScreen(hash || 'home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (screen: string, ticketId?: string) => {
    if (screen === 'status' && ticketId) {
      setActiveTicketId(ticketId);
      window.location.hash = `status/${ticketId}`;
      setCurrentScreen('status');
    } else {
      window.location.hash = screen;
      setCurrentScreen(screen);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-gray-100 flex flex-col font-sans">
      {/* Hide standard navbar on full-screen TV display mode */}
      {currentScreen !== 'display' && (
        <Navbar currentScreen={currentScreen} onNavigate={navigateTo} />
      )}

      <main className="flex-grow">
        {currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} />}
        {currentScreen === 'join' && <JoinQueueScreen onNavigate={navigateTo} />}
        {currentScreen === 'status' && (
          <MyStatusScreen ticketId={activeTicketId} onNavigate={navigateTo} />
        )}
        {currentScreen === 'reception' && <ReceptionScreen />}
        {currentScreen === 'barber' && <BarberScreen />}
        {currentScreen === 'display' && <TvDisplayScreen />}
        {currentScreen === 'admin' && <AdminScreen />}
      </main>

      {/* Floating Exit Button when on full TV Display */}
      {currentScreen === 'display' && (
        <button
          onClick={() => navigateTo('home')}
          className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-charcoal-800 text-gray-400 hover:text-white text-xs border border-charcoal-700 opacity-40 hover:opacity-100 transition-opacity"
        >
          ✕ Exit TV View
        </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    <SalonProvider>
      <MainApp />
    </SalonProvider>
  );
}
