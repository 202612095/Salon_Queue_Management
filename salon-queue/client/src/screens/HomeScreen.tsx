import React from 'react';
import { Users, Clock, Sparkles, ChevronRight, ShieldAlert } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { calculateWaitTime } from '../queueLogic';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { state, t } = useSalon();

  const waitingCount = state.tickets.filter(t => t.status === 'Waiting').length;
  const activeBarbers = state.barbers.filter(b => b.onDuty && b.status !== 'break');
  const estimatedWait = calculateWaitTime(state.tickets, activeBarbers.length);

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Hero Welcome */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.salonTagline}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {t.salonName}
        </h1>
        <p className="text-sm text-gray-400">
          {t.openStatus}
        </p>
      </div>

      {/* Queue Closed Banner if disabled */}
      {!state.isQueueOpen && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <span className="font-semibold block">{t.closedStatus}</span>
            <span className="text-xs text-rose-400/90">
              Online joining is temporarily paused by the manager. You can still get a walk-in token at the salon counter.
            </span>
          </div>
        </div>
      )}

      {/* Live Status Metric Card */}
      <div className="bg-charcoal-800 rounded-2xl p-6 border border-charcoal-700 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            {t.waitingCardTitle}
          </h2>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 divide-x divide-charcoal-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-charcoal-700/60 flex items-center justify-center text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">
                {waitingCount}
              </div>
              <div className="text-xs text-gray-400">
                {t.peopleWaiting}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pl-4">
            <div className="w-12 h-12 rounded-xl bg-charcoal-700/60 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-amber-400">
                ~{estimatedWait}
              </div>
              <div className="text-xs text-gray-400">
                {t.mins} {t.aboutWait}
              </div>
            </div>
          </div>
        </div>

        {waitingCount === 0 && (
          <div className="mt-4 pt-3 border-t border-charcoal-700/60 text-center text-xs text-emerald-400 font-medium">
            ✨ {t.noWaiting}
          </div>
        )}
      </div>

      {/* Stylists Availability Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium px-1">
          <span>{t.barberChairs}</span>
          <span>{activeBarbers.length} on duty</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {state.barbers.map((barber) => {
            const isFree = barber.status === 'free';
            const isBusy = barber.status === 'busy';
            const isOnBreak = barber.status === 'break';

            return (
              <div
                key={barber.id}
                className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-3 text-center transition-all"
              >
                <div className="text-2xl mb-1">{barber.photo}</div>
                <div className="text-sm font-bold text-white truncate">
                  {barber.name}
                </div>
                <div className="mt-1">
                  {isFree && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {t.free}
                    </span>
                  )}
                  {isBusy && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                      {t.busy}
                    </span>
                  )}
                  {isOnBreak && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-400 border border-gray-700">
                      {t.onBreak}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={() => onNavigate('join')}
          disabled={!state.isQueueOpen}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-98 ${
            state.isQueueOpen
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-charcoal-900 shadow-amber-500/20 hover:brightness-110 cursor-pointer'
              : 'bg-charcoal-700 text-gray-500 cursor-not-allowed border border-charcoal-600'
          }`}
        >
          <span>{t.joinQueueBtn}</span>
          <ChevronRight className="w-5 h-5 font-bold" />
        </button>
      </div>

      {/* Quick Staff Jump Links (For MSC IT Lab testing ease) */}
      <div className="pt-6 border-t border-charcoal-800 text-center">
        <div className="text-xs text-gray-500 mb-2 font-medium">Quick Screen Switcher (Test PIN: 1234)</div>
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('reception')}
            className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-800 text-gray-300 hover:text-amber-400 border border-charcoal-700"
          >
            📋 Reception
          </button>
          <button
            onClick={() => onNavigate('barber')}
            className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-800 text-gray-300 hover:text-amber-400 border border-charcoal-700"
          >
            💈 Barber View
          </button>
          <button
            onClick={() => onNavigate('display')}
            className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-800 text-gray-300 hover:text-amber-400 border border-charcoal-700"
          >
            📺 TV Display
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-800 text-gray-300 hover:text-amber-400 border border-charcoal-700"
          >
            ⚙️ Admin
          </button>
        </div>
      </div>
    </div>
  );
};
