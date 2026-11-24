import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Coffee, Clock, Scissors, ArrowRight } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { findNextTicketForBarber } from '../queueLogic';

export const BarberScreen: React.FC = () => {
  const { state, t, language, updateStatus, toggleBarberBreak } = useSalon();

  const [selectedBarberId, setSelectedBarberId] = useState<string>(() => {
    return state.barbers[0]?.id || 'barber-1';
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentBarber = state.barbers.find(b => b.id === selectedBarberId) || state.barbers[0];

  // Active customer assigned to this barber
  const activeTicket = state.tickets.find(
    t => (t.id === currentBarber?.currentTicketId || t.assignedBarberId === currentBarber?.id) &&
         (t.status === 'Called' || t.status === 'In chair')
  );

  // Next ticket queued up for this barber
  const nextTicket = currentBarber ? findNextTicketForBarber(state.tickets, currentBarber.id) : undefined;

  // Live timer for service in chair
  useEffect(() => {
    let interval: any = null;
    if (activeTicket?.status === 'In chair' && activeTicket.startedAt) {
      interval = setInterval(() => {
        const secs = Math.floor((Date.now() - activeTicket.startedAt!) / 1000);
        setElapsedSeconds(secs);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeTicket?.status, activeTicket?.startedAt]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartService = async () => {
    if (activeTicket) {
      await updateStatus(activeTicket.id, 'In chair');
    }
  };

  const handleCompleteService = async () => {
    if (activeTicket) {
      await updateStatus(activeTicket.id, 'Done');
    }
  };

  const handleBreakToggle = async () => {
    if (currentBarber) {
      await toggleBarberBreak(currentBarber.id);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Barber Selector Tabs */}
      <div className="bg-charcoal-800 p-2 rounded-2xl border border-charcoal-700 flex justify-between gap-1">
        {state.barbers.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBarberId(b.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedBarberId === b.id
                ? 'bg-amber-500 text-charcoal-900 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{b.photo}</span>
            <span>{b.name}</span>
          </button>
        ))}
      </div>

      {/* Header Profile & Status Toggle */}
      <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{currentBarber?.photo}</div>
          <div>
            <h1 className="text-lg font-bold text-white">Barber {currentBarber?.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                currentBarber?.status === 'busy' ? 'bg-amber-400 animate-pulse' :
                currentBarber?.status === 'break' ? 'bg-gray-400' : 'bg-emerald-400'
              }`}></span>
              <span className="text-xs text-gray-300 font-medium capitalize">
                {currentBarber?.status === 'busy' ? t.busy : currentBarber?.status === 'break' ? t.onBreak : t.free}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleBreakToggle}
          disabled={currentBarber?.status === 'busy'}
          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
            currentBarber?.status === 'break'
              ? 'bg-emerald-950 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
              : 'bg-charcoal-700 border-charcoal-600 text-gray-300 hover:bg-charcoal-600'
          } ${currentBarber?.status === 'busy' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>{currentBarber?.status === 'break' ? t.returnFromBreak : t.goOnBreak}</span>
        </button>
      </div>

      {/* ACTIVE CLIENT CARD */}
      <div className="bg-charcoal-800 rounded-3xl p-6 border border-charcoal-700 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-charcoal-700 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {t.currentClient}
          </span>
          {activeTicket && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTicket.status === 'In chair' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              {activeTicket.status}
            </span>
          )}
        </div>

        {activeTicket ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-black text-amber-400">{activeTicket.token}</div>
              <div className="text-lg font-bold text-white">{activeTicket.customerName}</div>
              <div className="text-xs text-gray-400">{activeTicket.phone}</div>
            </div>

            {/* Elapsed Timer for active haircut */}
            {activeTicket.status === 'In chair' && (
              <div className="bg-charcoal-900 rounded-2xl p-4 text-center border border-charcoal-700">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Session Elapsed Time</span>
                </div>
                <div className="text-3xl font-mono font-black text-amber-400">
                  {formatTimer(elapsedSeconds)}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Est. Duration: {activeTicket.totalDuration} min
                </div>
              </div>
            )}

            {/* Services List */}
            <div className="bg-charcoal-900/60 rounded-xl p-3 border border-charcoal-700/60 space-y-1.5">
              <div className="text-[11px] font-semibold text-gray-400">Selected Services:</div>
              {activeTicket.services.map(s => (
                <div key={s.id} className="flex justify-between text-xs text-gray-200">
                  <span>✂️ {language === 'gu' ? s.nameGu : s.nameEn}</span>
                  <span className="text-gray-400">{s.duration}m</span>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS: Start -> Done */}
            <div className="pt-2">
              {activeTicket.status === 'Called' ? (
                <button
                  onClick={handleStartService}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t.startService} (Customer In Chair)</span>
                </button>
              ) : (
                <button
                  onClick={handleCompleteService}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{t.doneService}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 space-y-3">
            <Scissors className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-xs max-w-xs mx-auto leading-relaxed">
              {t.noClientAssigned}
            </p>
          </div>
        )}
      </div>

      {/* UP NEXT PREVIEW FOR THIS BARBER */}
      <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700 space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.upNextForYou}</span>
        </div>

        {nextTicket ? (
          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">
                <span className="text-amber-400">{nextTicket.token}</span> · {nextTicket.customerName}
              </div>
              <div className="text-[11px] text-gray-400">
                {nextTicket.services.map(s => language === 'gu' ? s.nameGu : s.nameEn).join(', ')} ({nextTicket.totalDuration}m)
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-charcoal-800 text-gray-300 font-semibold border border-charcoal-700">
              {nextTicket.preferredBarberId === 'any' ? 'Any' : 'Requested You'}
            </span>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic py-2 text-center">
            No customers currently waiting for you.
          </div>
        )}
      </div>
    </div>
  );
};
