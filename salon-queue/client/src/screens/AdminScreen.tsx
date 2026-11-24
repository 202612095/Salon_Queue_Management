import React, { useState } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, DollarSign, Clock, Users, UserX, RotateCcw, Check } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const AdminScreen: React.FC = () => {
  const { state, t, updateService, toggleBarberDuty, toggleQueue, resetDailyQueue } = useSalon();

  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === '1234') {
      setPinAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSavePrice = async (serviceId: string) => {
    const num = parseFloat(tempPrice);
    if (!isNaN(num) && num > 0) {
      await updateService(serviceId, { price: num });
    }
    setEditingPriceId(null);
  };

  const handleResetQueue = async () => {
    if (window.confirm('Are you sure you want to reset all queue tokens and stats for a fresh day?')) {
      await resetDailyQueue();
    }
  };

  const avgWaitMins = state.todayStats.customersServed > 0
    ? Math.round(state.todayStats.totalWaitTimeMinutes / state.todayStats.customersServed)
    : 15;

  if (!pinAuthenticated) {
    return (
      <div className="max-w-xs mx-auto mt-20 p-6 bg-charcoal-800 rounded-2xl border border-charcoal-700 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">{t.adminTitle}</h2>
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
            Unlock Owner Settings
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white">{t.adminTitle}</h1>
          <p className="text-xs text-gray-400">Manage services, barbers on duty, queue access, and review metrics</p>
        </div>

        <button
          onClick={handleResetQueue}
          className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-rose-950/80 hover:border-rose-800 border border-charcoal-700 text-gray-300 hover:text-rose-300 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Day's Queue</span>
        </button>
      </div>

      {/* TODAY'S PERFORMANCE METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-charcoal-800 p-5 rounded-2xl border border-charcoal-700 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>{t.customersServed}</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{state.todayStats.customersServed}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Completed visits</div>
        </div>

        <div className="bg-charcoal-800 p-5 rounded-2xl border border-charcoal-700 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>{t.avgWaitTime}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">~{avgWaitMins}m</div>
          <div className="text-[11px] text-gray-400 font-medium">Per customer</div>
        </div>

        <div className="bg-charcoal-800 p-5 rounded-2xl border border-charcoal-700 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>{t.noShowsCount}</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{state.todayStats.noShows}</div>
          <div className="text-[11px] text-gray-400 font-medium">Did not arrive</div>
        </div>

        <div className="bg-charcoal-800 p-5 rounded-2xl border border-charcoal-700 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>{t.popularService}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white truncate">Haircut & Styling</div>
          <div className="text-[11px] text-amber-400 font-medium">Top booked service</div>
        </div>
      </div>

      {/* MASTER QUEUE TOGGLE */}
      <div className="bg-charcoal-800 p-6 rounded-3xl border border-charcoal-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{t.queueToggle}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              state.isQueueOpen ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {state.isQueueOpen ? t.queueOpen : t.queueClosed}
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            When closed, remote customers cannot take tickets from /join. Walk-ins can still be added by the receptionist.
          </p>
        </div>

        <button
          onClick={() => toggleQueue(!state.isQueueOpen)}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            state.isQueueOpen
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {state.isQueueOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          <span>{state.isQueueOpen ? 'Close Online Queue' : 'Open Online Queue'}</span>
        </button>
      </div>

      {/* BARBERS ON DUTY MANAGEMENT */}
      <div className="bg-charcoal-800 rounded-3xl p-6 border border-charcoal-700 space-y-4">
        <h2 className="text-base font-bold text-white">Barbers On Duty Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {state.barbers.map(barber => (
            <div
              key={barber.id}
              className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-700 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{barber.photo}</span>
                <div>
                  <div className="font-bold text-white text-sm">Barber {barber.name}</div>
                  <div className="text-[11px] text-gray-400">
                    Status: <span className="capitalize">{barber.status}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleBarberDuty(barber.id, !barber.onDuty)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  barber.onDuty
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                    : 'bg-charcoal-800 text-gray-400 border border-charcoal-700 hover:text-white'
                }`}
              >
                {barber.onDuty ? 'On Duty' : 'Off Duty'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICE CATALOG & PRICING */}
      <div className="bg-charcoal-800 rounded-3xl p-6 border border-charcoal-700 space-y-4">
        <h2 className="text-base font-bold text-white">{t.serviceManager}</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-900/60 text-gray-400 border-b border-charcoal-700 uppercase font-semibold">
              <tr>
                <th className="p-3">Service Name (EN / GU)</th>
                <th className="p-3">{t.duration}</th>
                <th className="p-3">{t.price}</th>
                <th className="p-3 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-700/60">
              {state.services.map(srv => {
                const isEditing = editingPriceId === srv.id;

                return (
                  <tr key={srv.id} className="hover:bg-charcoal-750 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{srv.nameEn}</div>
                      <div className="text-[11px] text-amber-400">{srv.nameGu}</div>
                    </td>
                    <td className="p-3 text-gray-300">
                      {srv.duration} mins
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">₹</span>
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={e => setTempPrice(e.target.value)}
                            className="w-16 bg-charcoal-900 border border-amber-500 rounded px-1.5 py-1 text-white text-xs"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(srv.id)}
                            className="p-1 rounded bg-amber-500 text-charcoal-900 hover:bg-amber-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => {
                            setEditingPriceId(srv.id);
                            setTempPrice(srv.price.toString());
                          }}
                          className="font-bold text-amber-400 cursor-pointer hover:underline"
                          title="Click to edit price"
                        >
                          ₹{srv.price}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => updateService(srv.id, { active: !srv.active })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          srv.active
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-charcoal-900 text-gray-500 border border-charcoal-700'
                        }`}
                      >
                        {srv.active ? t.active : t.inactive}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
