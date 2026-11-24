import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, Clock, Users, Scissors } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { calculateWaitTime } from '../queueLogic';
import { playChime } from '../utils/sound';

export const TvDisplayScreen: React.FC = () => {
  const { state, t, activeAlert, clearAlert } = useSalon();
  const [flashingToken, setFlashingToken] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Newly-called token flashes gold for 5 seconds
  useEffect(() => {
    if (activeAlert?.type === 'CALLED' && activeAlert.token) {
      setFlashingToken(activeAlert.token);
      const timer = setTimeout(() => {
        setFlashingToken(null);
        clearAlert();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert, clearAlert]);

  const waitingTickets = state.tickets.filter(t => t.status === 'Waiting');
  const upNextTickets = waitingTickets.slice(0, 5);
  const activeBarbers = state.barbers.filter(b => b.onDuty && b.status !== 'break');

  return (
    <div className="min-h-screen bg-charcoal-900 text-white p-6 sm:p-10 flex flex-col justify-between selection:bg-amber-500 selection:text-charcoal-900">
      {/* Top Banner Header */}
      <header className="flex items-center justify-between border-b border-charcoal-700/80 pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-charcoal-900 shadow-xl shadow-amber-500/20">
            <Scissors className="w-8 h-8 font-black" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wide">
              {t.salonName}
            </h1>
            <p className="text-sm text-gray-400">
              {t.tvDisplayTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button
            onClick={() => playChime()}
            className="p-3 rounded-2xl bg-charcoal-800 border border-charcoal-700 text-amber-400 hover:text-amber-300 hover:border-amber-500 transition-colors flex items-center gap-2 text-xs font-bold"
            title="Test Chime Sound"
          >
            <Volume2 className="w-5 h-5" />
            <span className="hidden sm:inline">Test Chime</span>
          </button>

          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-mono font-black text-white">
              {currentTime}
            </div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE QUEUE BOARD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main 2-Column Split: Left (Active Chairs 60%), Right (Up Next 40%) */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 flex-grow">
        {/* LEFT COLUMN: Now In Chair (Barbers with active clients) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-amber-400 uppercase flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>{t.nowServing}</span>
            </h2>
            <span className="text-xs text-gray-400 font-medium">Stylist Stations</span>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-grow content-start">
            {state.barbers.filter(b => b.onDuty).map((barber) => {
              const activeTicket = state.tickets.find(
                t => (t.id === barber.currentTicketId || t.assignedBarberId === barber.id) &&
                     (t.status === 'Called' || t.status === 'In chair')
              );

              const isCalled = activeTicket?.status === 'Called';
              const isFlashing = activeTicket && flashingToken === activeTicket.token;

              return (
                <div
                  key={barber.id}
                  className={`p-6 rounded-3xl border transition-all duration-500 flex items-center justify-between shadow-2xl ${
                    isFlashing
                      ? 'flash-gold ring-4 ring-amber-400'
                      : activeTicket
                      ? 'bg-charcoal-800 border-charcoal-700'
                      : 'bg-charcoal-900/60 border-charcoal-800/80 opacity-70'
                  }`}
                >
                  {/* Barber Info */}
                  <div className="flex items-center space-x-4">
                    <div className="text-5xl">{barber.photo}</div>
                    <div>
                      <div className="text-2xl font-black text-white">Barber {barber.name}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {barber.status === 'break' ? (
                          <span className="text-gray-400 font-semibold">{t.onBreak}</span>
                        ) : activeTicket ? (
                          <span className="text-amber-400 font-bold">
                            {isCalled ? '🔔 CALLED - PROCEED TO CHAIR' : '✂️ In Service'}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Chair Ready · {t.free}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Token Display */}
                  <div>
                    {activeTicket ? (
                      <div className="text-right">
                        <div
                          className={`text-5xl sm:text-6xl font-black tracking-tighter ${
                            isFlashing ? 'text-charcoal-900' : 'text-amber-400'
                          }`}
                        >
                          {activeTicket.token}
                        </div>
                        <div
                          className={`text-sm font-bold truncate max-w-[150px] ${
                            isFlashing ? 'text-charcoal-900' : 'text-gray-300'
                          }`}
                        >
                          {activeTicket.customerName}
                        </div>
                      </div>
                    ) : (
                      <div className="text-4xl text-gray-600 font-black">---</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Up Next in Line */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-wide text-gray-200 uppercase flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-amber-400" />
              <span>{t.upNext} ({waitingTickets.length})</span>
            </h2>
            <span className="text-xs text-gray-400 font-medium">Next 5 Tokens</span>
          </div>

          <div className="bg-charcoal-800 rounded-3xl p-6 border border-charcoal-700 flex-grow shadow-2xl flex flex-col justify-start space-y-3">
            {upNextTickets.length === 0 ? (
              <div className="my-auto py-16 text-center text-gray-400 space-y-3">
                <Users className="w-12 h-12 text-gray-600 mx-auto" />
                <div className="text-lg font-bold text-white">{t.noWaiting}</div>
                <div className="text-sm">Seats available. Join online or visit the counter.</div>
              </div>
            ) : (
              upNextTickets.map((ticket, index) => {
                const waitEst = calculateWaitTime(state.tickets, activeBarbers.length, ticket.id);
                return (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-700/80 flex items-center justify-between hover:border-charcoal-600 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center font-bold text-gray-400 text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-2xl font-black text-amber-400">
                          {ticket.token}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {ticket.customerName} · Stylist: {ticket.preferredBarberName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-white">
                        ~{waitEst} {t.mins}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        estimated wait
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {waitingTickets.length > 5 && (
              <div className="text-center text-xs text-gray-400 pt-3 border-t border-charcoal-700 font-semibold">
                +{waitingTickets.length - 5} more customers waiting in line
              </div>
            )}
          </div>
        </div>
      </main>

      {/* TV Footer Ticker */}
      <footer className="border-t border-charcoal-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>When your token is called, it will flash in gold and a chime will sound.</span>
        </div>
        <div>
          Scan QR Code on your phone or visit <span className="text-amber-400 font-mono font-bold">/join</span> to take a token
        </div>
      </footer>
    </div>
  );
};
