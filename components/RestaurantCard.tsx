'use client';

import { useState } from 'react';
import { Customer, RestaurantDaily, Payment } from '@/types';
import { WhatsAppButton } from './WhatsAppButton';
import { restaurantDailyMessage, restaurantMonthlyMessage } from '@/lib/whatsapp';
import { formatCurrency, getToday } from '@/lib/calculations';
import { useShop } from '@/hooks/useShop';
import { useT } from '@/hooks/useT';

interface Props {
  restaurant: Customer;
  dailyEntries: RestaurantDaily[];
  payments: Payment[];
  defaultRate?: number;
  onAddDaily: (customerId: string, shopId: string, kg: number, rate: number, date: string) => void;
  onAddPayment: (customerId: string, amount: number, note: string) => void;
}

export function RestaurantCard({ restaurant, dailyEntries, payments, defaultRate = 0, onAddDaily, onAddPayment }: Props) {
  const { selectedShop } = useShop();
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const [dailyForm, setDailyForm] = useState({ kg: '', rate: defaultRate.toString(), date: getToday() });
  const [payForm, setPayForm] = useState({ amount: '', note: '' });

  const totalCharged = dailyEntries.reduce((s, e) => s + e.amount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalCharged - totalPaid;
  const isOwed = balance > 0;

  const shopName = selectedShop?.name || 'Safdar & Sons';
  const lastEntry = dailyEntries[dailyEntries.length - 1];

  const dailyWaMsg = lastEntry
    ? restaurantDailyMessage(restaurant.name, lastEntry.kg, lastEntry.rate_per_kg, lastEntry.amount, balance, shopName)
    : '';

  const now = new Date();
  const monthStr = now.toLocaleString('ur-PK', { month: 'long', year: 'numeric' });
  const monthlyWaMsg = restaurantMonthlyMessage(
    restaurant.name, monthStr,
    dailyEntries.reduce((s, e) => s + e.kg, 0),
    totalCharged, totalPaid, balance
  );

  const handleAddDaily = () => {
    if (!dailyForm.kg || !selectedShop) return;
    onAddDaily(restaurant.id, selectedShop.id, parseFloat(dailyForm.kg), parseFloat(dailyForm.rate) || 0, dailyForm.date);
    setDailyForm((f) => ({ ...f, kg: '' }));
  };

  const calcAmount = dailyForm.kg && dailyForm.rate
    ? parseFloat(dailyForm.kg) * parseFloat(dailyForm.rate)
    : 0;

  return (
    <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: `1px solid ${isOwed ? '#ffedd5' : '#dcfce7'}` }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg"
              style={{ background: isOwed ? '#fff7ed' : '#f0fdf4', color: isOwed ? '#ea580c' : '#16a34a' }}>
              {restaurant.name.charAt(0)}
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{restaurant.name}</p>
              {restaurant.phone && <p className="text-xs text-gray-400">{restaurant.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className={`font-bold text-xl leading-tight ${isOwed ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-xs text-gray-400 text-right">{isOwed ? 'بقایا' : 'صاف ✓'}</p>
            </div>
            <svg className={`w-4 h-4 text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-4">
          {/* Balance summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl p-3 text-center" style={{ background: '#fff7ed' }}>
              <p className="text-xs text-gray-400">{t('totalCharged')}</p>
              <p className="font-bold text-orange-600 text-sm mt-0.5">{formatCurrency(totalCharged)}</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: '#f0fdf4' }}>
              <p className="text-xs text-gray-400">{t('paid')}</p>
              <p className="font-bold text-green-600 text-sm mt-0.5">{formatCurrency(totalPaid)}</p>
            </div>
            <div className={`rounded-2xl p-3 text-center`} style={{ background: isOwed ? '#fef2f2' : '#f0fdf4' }}>
              <p className="text-xs text-gray-400">{t('balance')}</p>
              <p className={`font-bold text-sm mt-0.5 ${isOwed ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(Math.abs(balance))}</p>
            </div>
          </div>

          {/* Add daily */}
          <div className="rounded-2xl p-3 space-y-2" style={{ background: '#fff7ed' }}>
            <p className="text-xs font-bold text-orange-700 text-right">{t('todayPurchase')}</p>
            <div className="flex gap-2 flex-wrap">
              <input type="date" value={dailyForm.date}
                onChange={(e) => setDailyForm((f) => ({ ...f, date: e.target.value }))}
                className="border border-orange-100 rounded-xl px-3 py-2 text-sm bg-white" />
              <input type="number" inputMode="decimal" value={dailyForm.kg}
                onChange={(e) => setDailyForm((f) => ({ ...f, kg: e.target.value }))}
                className="border border-orange-100 rounded-xl px-3 py-2 text-sm bg-white w-24 font-bold"
                placeholder="kg" />
              <input type="number" inputMode="numeric" value={dailyForm.rate}
                onChange={(e) => setDailyForm((f) => ({ ...f, rate: e.target.value }))}
                className="border border-orange-100 rounded-xl px-3 py-2 text-sm bg-white w-24 font-bold"
                placeholder="Rs/kg" />
            </div>
            {calcAmount > 0 && (
              <p className="text-xs text-orange-700 text-right font-semibold">
                {dailyForm.kg} kg × Rs {dailyForm.rate} = <span className="text-base font-bold">{formatCurrency(calcAmount)}</span>
              </p>
            )}
            <button onClick={handleAddDaily}
              className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm"
              style={{ boxShadow: '0 2px 8px rgba(234,88,12,0.2)' }}>
              {t('addPurchase')}
            </button>
          </div>

          {/* Add payment */}
          <div className="rounded-2xl p-3 space-y-2" style={{ background: '#f0fdf4' }}>
            <p className="text-xs font-bold text-green-700 text-right">{t('paymentRecvd')}</p>
            <div className="flex gap-2">
              <input type="number" inputMode="numeric" value={payForm.amount}
                onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                className="border border-green-100 rounded-xl px-3 py-2 text-sm bg-white flex-1 font-bold"
                placeholder="رقم" />
              <input value={payForm.note}
                onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))}
                className="border border-green-100 rounded-xl px-3 py-2 text-sm bg-white flex-1 text-right"
                placeholder="نوٹ" />
            </div>
            <button
              onClick={() => { if (payForm.amount) { onAddPayment(restaurant.id, parseFloat(payForm.amount), payForm.note); setPayForm({ amount: '', note: '' }); } }}
              className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm"
              style={{ boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}>
              {t('addPaymentBtn')}
            </button>
          </div>

          {/* WhatsApp */}
          {restaurant.phone && (
            <div className="flex gap-2 flex-wrap">
              {lastEntry && <WhatsAppButton phone={restaurant.phone} message={dailyWaMsg} label={t('todayBill')} size="sm" />}
              <WhatsAppButton phone={restaurant.phone} message={monthlyWaMsg} label={t('monthlyStmt')} size="sm" />
            </div>
          )}

          {/* Recent entries */}
          {dailyEntries.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 text-right mb-2">{t('recentEntries')}</p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {[...dailyEntries].reverse().slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <span className="font-bold text-orange-600 text-sm">{formatCurrency(entry.amount)}</span>
                    <span className="text-xs text-gray-500">{entry.date} — {entry.kg}kg @ Rs{entry.rate_per_kg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
