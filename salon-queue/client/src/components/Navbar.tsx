import React from 'react';
import { Scissors, Globe, Monitor, Shield, Users, Clock } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate }) => {
  const { language, setLanguage, t, state, isConnected } = useSalon();

  return (
    <header className="bg-charcoal-900 border-b border-charcoal-700 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-charcoal-900 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-charcoal-900 font-bold" />
            </div>
            <div>
              <span className="font-bold text-lg text-amber-400 tracking-wide block">
                {t.salonName}
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">
                {t.salonTagline}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden md:flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                state.isQueueOpen
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${state.isQueueOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {state.isQueueOpen ? t.openStatus : t.closedStatus}
            </span>

            <span className="text-xs text-gray-400 px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              {isConnected ? 'Live Sync' : 'Direct Sync'}
            </span>
          </div>

          {/* Right Controls: Navigation tabs & Language switch */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Test Navigation */}
            <div className="hidden lg:flex items-center space-x-1 bg-charcoal-800 p-1 rounded-xl border border-charcoal-700 text-xs font-medium">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentScreen === 'home' ? 'bg-amber-500 text-charcoal-900 font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                {t.navHome}
              </button>
              <button
                onClick={() => onNavigate('join')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentScreen === 'join' ? 'bg-amber-500 text-charcoal-900 font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                {t.navJoin}
              </button>
              <button
                onClick={() => onNavigate('reception')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  currentScreen === 'reception' ? 'bg-amber-500 text-charcoal-900 font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                {t.navReception}
              </button>
              <button
                onClick={() => onNavigate('barber')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  currentScreen === 'barber' ? 'bg-amber-500 text-charcoal-900 font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {t.navBarber}
              </button>
              <button
                onClick={() => onNavigate('display')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  currentScreen === 'display' ? 'bg-amber-500 text-charcoal-900 font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                {t.navDisplay}
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  currentScreen === 'admin' ? 'bg-amber-500 text-charcoal-900 font-bold' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                {t.navAdmin}
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-charcoal-800 rounded-xl p-1 border border-charcoal-700">
              <Globe className="w-4 h-4 text-amber-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-amber-500 text-charcoal-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('gu')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  language === 'gu'
                    ? 'bg-amber-500 text-charcoal-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                ગુજરાતી
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
