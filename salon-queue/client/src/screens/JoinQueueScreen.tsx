import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { calculateWaitTime } from '../queueLogic';

interface JoinQueueScreenProps {
  onNavigate: (screen: string, ticketId?: string) => void;
}

export const JoinQueueScreen: React.FC<JoinQueueScreenProps> = ({ onNavigate }) => {
  const { state, t, language, joinQueue } = useSalon();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['srv-1']); // Default to haircut
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeServices = state.services.filter(s => s.active);

  // Toggle service selection with maximum 3 rule
  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      if (selectedServices.length === 1) return; // Must have at least 1 service
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
      setError(null);
    } else {
      if (selectedServices.length >= 3) {
        setError(t.maxServicesAlert);
        return;
      }
      setSelectedServices([...selectedServices, serviceId]);
      setError(null);
    }
  };

  // Calculations for live summary
  const chosenServices = state.services.filter(s => selectedServices.includes(s.id));
  const totalDuration = chosenServices.reduce((acc, s) => acc + s.duration, 0);
  const totalPrice = chosenServices.reduce((acc, s) => acc + s.price, 0);
  const activeBarbers = state.barbers.filter(b => b.onDuty && b.status !== 'break');
  const estimatedWait = calculateWaitTime(state.tickets, activeBarbers.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError(t.nameError);
      return;
    }

    // 10-digit validation
    const cleanPhone = phone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(t.phoneError);
      return;
    }

    if (selectedServices.length === 0) {
      setError(t.selectServices);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await joinQueue(customerName, cleanPhone, selectedServices, selectedBarberId);
      if (result?.ticket) {
        onNavigate('status', result.ticket.id);
      }
    } catch (err: any) {
      setError(err.message || 'Error joining queue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-32 space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{t.joinQueueTitle}</h1>
          <p className="text-xs text-gray-400">{t.salonName}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <div className="space-y-4 bg-charcoal-800 p-4 rounded-2xl border border-charcoal-700">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              {t.yourName} *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              {t.phone} *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-gray-400 font-medium">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={t.phonePlaceholder}
                className="w-full bg-charcoal-900 border border-charcoal-700 rounded-xl pl-12 pr-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">
              Used to track your ticket and prevent duplicate spots
            </span>
          </div>
        </div>

        {/* Services Selection (Max 3) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-gray-300">{t.selectServices}</span>
            <span className={`font-medium ${selectedServices.length === 3 ? 'text-amber-400' : 'text-gray-400'}`}>
              {selectedServices.length}/3 {t.servicesSelected}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {activeServices.map(service => {
              const isSelected = selectedServices.includes(service.id);
              const displayName = language === 'gu' ? service.nameGu : service.nameEn;

              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                      : 'bg-charcoal-800 border-charcoal-700 text-gray-300 hover:border-charcoal-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-amber-500 text-charcoal-900' : 'border border-charcoal-600 bg-charcoal-900'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 font-bold" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{displayName}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration} {t.mins}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-bold text-amber-400 text-sm">
                    ₹{service.price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barber Picker */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-300 px-1">
            {t.selectBarber}
          </label>

          {/* Any Barber (Fastest) */}
          <div
            onClick={() => setSelectedBarberId('any')}
            className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
              selectedBarberId === 'any'
                ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                : 'bg-charcoal-800 border-charcoal-700 hover:border-charcoal-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{t.anyBarber}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-charcoal-900 font-bold">Fastest</span>
                </div>
                <div className="text-xs text-gray-400">{t.anyBarberSub}</div>
              </div>
            </div>
            {selectedBarberId === 'any' && (
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-charcoal-900">
                <Check className="w-3.5 h-3.5 font-bold" />
              </div>
            )}
          </div>

          {/* Individual Stylists */}
          <div className="grid grid-cols-3 gap-2">
            {state.barbers.filter(b => b.onDuty).map(barber => {
              const isSelected = selectedBarberId === barber.id;
              const isOnBreak = barber.status === 'break';

              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-charcoal-800 border-charcoal-700 hover:border-charcoal-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{barber.photo}</div>
                  <div className="text-xs font-bold text-white truncate">{barber.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {isOnBreak ? (
                      <span className="text-rose-400">{t.onBreak}</span>
                    ) : (
                      <span className="text-emerald-400">{t.free}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Bottom Summary Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-charcoal-900/95 backdrop-blur-md border-t border-charcoal-700 p-4 shadow-2xl z-40">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <div>
                <span className="font-bold text-white">{totalDuration} {t.mins}</span> · ₹{totalPrice}
              </div>
              <div className="text-amber-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>~{estimatedWait} {t.mins} {t.aboutWait}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || selectedServices.length === 0}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-600 text-charcoal-900 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 font-bold" />
              <span>{isSubmitting ? 'Joining...' : t.confirmAndJoin}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
