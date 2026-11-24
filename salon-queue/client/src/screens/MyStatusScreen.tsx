import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, AlertTriangle, Sparkles, X, CheckCircle2, Scissors } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSalon } from '../context/SalonContext';
import { calculateWaitTime, getQueuePosition } from '../queueLogic';

interface MyStatusScreenProps {
  ticketId: string;
  onNavigate: (screen: string) => void;
}

export const MyStatusScreen: React.FC<MyStatusScreenProps> = ({ ticketId, onNavigate }) => {
  const { state, t, language, updateStatus } = useSalon();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const ticket = state.tickets.find(t => t.id === ticketId);

  // Position and waiting time calculations
  const activeBarbers = state.barbers.filter(b => b.onDuty && b.status !== 'break');
  const position = ticket ? getQueuePosition(state.tickets, ticket.id) : 0;
  const estimatedWait = ticket ? calculateWaitTime(state.tickets, activeBarbers.length, ticket.id) : 0;

  // Trigger celebration on 'Called'
  useEffect(() => {
    if (ticket?.status === 'Called' && !hasCelebrated) {
      setHasCelebrated(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4A017', '#F59E0B', '#FBBF24', '#ffffff']
        });
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      } catch {}
    }
  }, [ticket?.status, hasCelebrated]);

  if (!ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto text-gray-500">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Ticket Not Found</h2>
        <p className="text-xs text-gray-400">
          This ticket may have been completed, cancelled, or expired.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-charcoal-900 font-bold text-sm"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const isCalled = ticket.status === 'Called';
  const isInChair = ticket.status === 'In chair';
  const isDone = ticket.status === 'Done';
  const isCancelled = ticket.status === 'Cancelled';
  const isNoShow = ticket.status === 'No-show';
  const isSecondInLine = position === 2 && ticket.status === 'Waiting';

  const handleCancel = async () => {
    await updateStatus(ticket.id, 'Cancelled');
    setShowCancelModal(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-gray-400">{t.myStatusTitle}</span>
        <div className="w-9"></div> {/* balance spacer */}
      </div>

      {/* FULL-SCREEN GOLD TAKEOVER ALERT WHEN CALLED */}
      {isCalled && (
        <div className="bg-gradient-to-b from-amber-400 to-yellow-500 rounded-3xl p-6 text-charcoal-900 shadow-2xl pulse-gold text-center space-y-4 transform animate-bounce-short">
          <div className="inline-flex p-3 rounded-full bg-charcoal-900/10 text-charcoal-900">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            {t.turnAlertHeader}
          </h2>
          <div className="py-2">
            <span className="text-xs font-bold uppercase tracking-wider block opacity-80">
              {t.proceedTo}
            </span>
            <span className="text-2xl font-black block mt-1">
              Barber {ticket.assignedBarberName || 'Stylist'} 💈
            </span>
          </div>
          <p className="text-xs font-semibold opacity-90">
            Please make your way directly to the styling chair now.
          </p>
        </div>
      )}

      {/* 2nd IN LINE WARNING BANNER */}
      {isSecondInLine && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">{t.youAreNext}</span>
            <span className="text-xs text-amber-400/80">
              There is only 1 person ahead of you. Head towards the salon so you do not miss your call!
            </span>
          </div>
        </div>
      )}

      {/* IN CHAIR BANNER */}
      {isInChair && (
        <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-800 text-blue-300 text-sm flex items-center gap-3">
          <Scissors className="w-6 h-6 text-blue-400 animate-spin" />
          <div>
            <span className="font-bold block">{t.inChairStatus} {ticket.assignedBarberName}</span>
            <span className="text-xs text-blue-400/80">Your grooming session is currently in progress. Sit back and relax!</span>
          </div>
        </div>
      )}

      {/* DONE OR CANCELLED STATUS */}
      {isDone && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm text-center space-y-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <div className="font-bold text-base">Service Completed!</div>
          <div className="text-xs text-emerald-400/80">Thank you for visiting Royal Touch Salon. Have a great day!</div>
        </div>
      )}

      {isCancelled && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm text-center">
          <div className="font-bold">Ticket Cancelled</div>
          <div className="text-xs text-rose-400/80 mt-1">This queue spot was cancelled. You can join again anytime.</div>
        </div>
      )}

      {isNoShow && (
        <div className="p-4 rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 text-sm text-center">
          <div className="font-bold">Marked as No-Show</div>
          <div className="text-xs text-gray-400 mt-1">You were called but were not present. Please see the receptionist.</div>
        </div>
      )}

      {/* Central Token Card */}
      <div className="bg-charcoal-800 rounded-3xl p-6 border border-charcoal-700 shadow-xl text-center space-y-6 relative overflow-hidden">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t.tokenLabel}
          </span>
          <div className="text-6xl font-black tracking-tight text-amber-400">
            {ticket.token}
          </div>
          <div className="text-sm font-semibold text-white">
            {ticket.customerName}
          </div>
        </div>

        {/* Circular Estimated Wait & Queue Position */}
        {ticket.status === 'Waiting' && (
          <div className="py-2">
            <div className="w-36 h-36 rounded-full border-4 border-amber-500/20 border-t-amber-400 flex flex-col items-center justify-center mx-auto shadow-inner">
              <span className="text-3xl font-extrabold text-white">
                ~{estimatedWait}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {t.mins} {t.aboutWait}
              </span>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-900 border border-charcoal-700 text-xs text-gray-300">
              <span className="font-bold text-amber-400">#{position}</span>
              <span>{t.positionInLine}</span>
            </div>
          </div>
        )}

        {/* Selected Services Info */}
        <div className="pt-4 border-t border-charcoal-700/70 text-left space-y-2">
          <div className="text-xs font-semibold text-gray-400">Selected Services:</div>
          <div className="space-y-1.5">
            {ticket.services.map(s => (
              <div key={s.id} className="flex justify-between text-xs">
                <span className="text-gray-300">{language === 'gu' ? s.nameGu : s.nameEn} ({s.duration}m)</span>
                <span className="text-amber-400 font-semibold">₹{s.price}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-charcoal-700/40 flex justify-between text-xs font-bold text-white">
            <span>Total Duration & Price:</span>
            <span>{ticket.totalDuration} min · ₹{ticket.totalPrice}</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Preferred Stylist: <span className="text-gray-200 font-semibold">{ticket.preferredBarberName}</span>
          </div>
        </div>
      </div>

      {/* Cancel Spot Button (Allowed only while status is Waiting) */}
      {ticket.status === 'Waiting' && (
        <div className="text-center pt-2">
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-4 cursor-pointer"
          >
            {t.cancelSpot}
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">{t.confirmCancelTitle}</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-300">
              {t.confirmCancelMsg}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-charcoal-700 text-gray-300 text-xs font-bold hover:bg-charcoal-600"
              >
                {t.keepSpot}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {t.yesCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
