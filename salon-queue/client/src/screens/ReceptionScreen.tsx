import React, { useState } from 'react';
import { Users, UserPlus, PhoneCall, Clock, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const ReceptionScreen: React.FC = () => {
  const { state, t, language, callNext, updateStatus, joinQueue } = useSalon();

  // Simple Staff PIN protection
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServices, setWalkInServices] = useState<string[]>(['srv-1']);
  const [walkInBarber, setWalkInBarber] = useState('any');
  const [walkInError, setWalkInError] = useState<string | null>(null);

  const waitingTickets = state.tickets.filter(t => t.status === 'Waiting');
  const calledOrInChairTickets = state.tickets.filter(t => t.status === 'Called' || t.status === 'In chair');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === '1234') {
      setPinAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError(null);

    if (!walkInName.trim()) {
      setWalkInError('Name is required');
      return;
    }
    const cleanPhone = walkInPhone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setWalkInError('Valid 10-digit mobile number required');
      return;
    }

    try {
      await joinQueue(walkInName, cleanPhone, walkInServices, walkInBarber);
      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInServices(['srv-1']);
      setWalkInBarber('any');
    } catch (err: any) {
      setWalkInError(err.message || 'Error creating walk-in');
    }
  };

  if (!pinAuthenticated) {
    return (
      <div className="max-w-xs mx-auto mt-20 p-6 bg-charcoal-800 rounded-2xl border border-charcoal-700 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">{t.receptionTitle}</h2>
        <p className="text-xs text-gray-400">{t.enterPin}</p>

        <form onSubmit={handlePinSubmit} className="space-y-3">
          <input
            type="password"
            maxLength={4}
            value={inputPin}
            onChange={e => setInputPin(e.target.value)}
            placeholder="1234"
            className="w-full text-center tracking-widest text-lg font-mono py-2.5 bg-charcoal-900 border border-charcoal-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            autoFocus
          />
          {pinError && <div className="text-xs text-rose-400">{t.invalidPin}</div>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 text-charcoal-900 font-bold text-xs hover:bg-amber-400"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header with Title and Add Walk-in */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-charcoal-800 p-4 rounded-2xl border border-charcoal-700">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>{t.receptionTitle}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              Live Tablet Mode
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage stylist stations, call next customer in line, or register walk-ins
          </p>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-600 text-charcoal-900 shadow-md hover:brightness-110 flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 font-bold" />
          <span>{t.addWalkIn}</span>
        </button>
      </div>

      {/* Grid: Left Barber Stations (Tablet 40%), Right Waiting Queue (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Barber Workstations */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>{t.barberChairs} ({state.barbers.filter(b => b.onDuty).length})</span>
          </h2>

          <div className="space-y-3">
            {state.barbers.filter(b => b.onDuty).map(barber => {
              const currentTicket = state.tickets.find(t => t.id === barber.currentTicketId && (t.status === 'Called' || t.status === 'In chair'));
              const isFree = barber.status === 'free';
              const isBusy = barber.status === 'busy';
              const isOnBreak = barber.status === 'break';

              return (
                <div
                  key={barber.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isBusy
                      ? 'bg-charcoal-800 border-amber-500/40'
                      : isOnBreak
                      ? 'bg-charcoal-900 border-charcoal-700 opacity-60'
                      : 'bg-charcoal-800 border-charcoal-700 hover:border-charcoal-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{barber.photo}</div>
                      <div>
                        <div className="font-bold text-white text-base">Barber {barber.name}</div>
                        <div className="text-xs">
                          {isFree && <span className="text-emerald-400 font-semibold">{t.free}</span>}
                          {isBusy && <span className="text-amber-400 font-semibold">{t.busy} - Serving</span>}
                          {isOnBreak && <span className="text-gray-400 font-semibold">{t.onBreak}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Call Next Button */}
                    <button
                      onClick={() => callNext(barber.id)}
                      disabled={!isFree}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isFree
                          ? 'bg-amber-500 hover:bg-amber-400 text-charcoal-900 shadow-md cursor-pointer'
                          : 'bg-charcoal-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{t.callNext}</span>
                    </button>
                  </div>

                  {/* Active Customer Details if occupied */}
                  {currentTicket ? (
                    <div className="p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-700 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-400 text-sm">
                          {currentTicket.token} · {currentTicket.customerName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          {currentTicket.status}
                        </span>
                      </div>
                      <div className="text-gray-400 truncate">
                        {currentTicket.services.map(s => language === 'gu' ? s.nameGu : s.nameEn).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic py-1">
                      {isOnBreak ? 'Barber currently taking a break' : 'Chair empty. Click "Call Next" to assign next customer.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Waiting List Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{t.waitingList} ({waitingTickets.length})</span>
            </h2>
            <span className="text-xs text-gray-400">Strict FIFO Order</span>
          </div>

          <div className="bg-charcoal-800 rounded-2xl border border-charcoal-700 overflow-hidden shadow-lg">
            {waitingTickets.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-gray-500" />
                <div className="font-bold text-white text-sm">{t.noWaiting}</div>
                <div className="text-xs">New remote bookings and walk-ins will appear here automatically.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-charcoal-900/60 text-gray-400 border-b border-charcoal-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Token</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Services</th>
                      <th className="p-3.5">Stylist</th>
                      <th className="p-3.5">Wait</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-700/60">
                    {waitingTickets.map((ticket) => {
                      const waitMinutes = Math.round((Date.now() - ticket.createdAt) / 60000);
                      const isHighWait = waitMinutes > 60;

                      return (
                        <tr
                          key={ticket.id}
                          className={`hover:bg-charcoal-750 transition-colors ${
                            isHighWait ? 'bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="p-3.5 font-bold text-amber-400 text-sm">
                            {ticket.token}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-white">{ticket.customerName}</div>
                            <div className="text-gray-400 text-[11px]">{ticket.phone}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-gray-300 truncate max-w-[130px]">
                              {ticket.services.map(s => language === 'gu' ? s.nameGu : s.nameEn).join(', ')}
                            </div>
                            <div className="text-gray-500 text-[10px]">{ticket.totalDuration} min · ₹{ticket.totalPrice}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full bg-charcoal-900 text-gray-300 font-medium text-[11px]">
                              {ticket.preferredBarberName}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className={`font-medium flex items-center gap-1 ${isHighWait ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
                              {isHighWait && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                              <span>{waitMinutes}m</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => updateStatus(ticket.id, 'Cancelled')}
                              title="Cancel Customer Spot"
                              className="px-2.5 py-1.5 rounded-lg bg-charcoal-700 hover:bg-rose-950 hover:text-rose-400 text-gray-400 text-[11px] font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ACTIVE / CALLED TICKETS (To mark No-show) */}
          {calledOrInChairTickets.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Currently Called or In Service ({calledOrInChairTickets.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {calledOrInChairTickets.map(tkt => (
                  <div key={tkt.id} className="p-3 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">
                        <span className="text-amber-400">{tkt.token}</span> · {tkt.customerName}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {tkt.status} with Barber {tkt.assignedBarberName}
                      </div>
                    </div>
                    {tkt.status === 'Called' && (
                      <button
                        onClick={() => updateStatus(tkt.id, 'No-show')}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800"
                      >
                        {t.markNoShow}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD WALK-IN MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-800 border border-charcoal-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>{t.addWalkIn}</span>
              </h3>
              <button onClick={() => setShowWalkInModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {walkInError && (
              <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800">
                {walkInError}
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={walkInName}
                  onChange={e => setWalkInName(e.target.value)}
                  placeholder="e.g. Rahul Patel"
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={walkInPhone}
                  onChange={e => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Services (Max 3)</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {state.services.filter(s => s.active).map(srv => {
                    const isSelected = walkInServices.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => {
                          if (isSelected) {
                            if (walkInServices.length > 1) setWalkInServices(walkInServices.filter(id => id !== srv.id));
                          } else {
                            if (walkInServices.length < 3) setWalkInServices([...walkInServices, srv.id]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-xs cursor-pointer ${
                          isSelected ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-charcoal-900 border-charcoal-700 text-gray-400'
                        }`}
                      >
                        <div className="font-semibold">{language === 'gu' ? srv.nameGu : srv.nameEn}</div>
                        <div className="text-amber-400 text-[11px]">₹{srv.price}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Preferred Stylist</label>
                <select
                  value={walkInBarber}
                  onChange={e => setWalkInBarber(e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="any">⚡ Any Stylist (Fastest)</option>
                  {state.barbers.filter(b => b.onDuty).map(b => (
                    <option key={b.id} value={b.id}>
                      Barber {b.name} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-charcoal-700 text-gray-300 text-xs font-bold hover:bg-charcoal-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-charcoal-900 text-xs font-bold hover:bg-amber-400"
                >
                  Confirm Walk-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
