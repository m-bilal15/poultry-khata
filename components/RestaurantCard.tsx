'use client';

import { useState } from 'react';
import { Customer, RestaurantDaily, Payment } from '@/types';
import { WhatsAppButton } from './WhatsAppButton';
import { restaurantDailyMessage, restaurantMonthlyMessage } from '@/lib/whatsapp';
import { formatCurrency, getToday } from '@/lib/calculations';
import { useShop } from '@/hooks/useShop';

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
  const [expanded, setExpanded] = useState(false);
  const [dailyForm, setDailyForm] = useState({ kg: '', rate: defaultRate.toString(), date: getToday() });
  const [payForm, setPayForm] = useState({ amount: '', note: '' });

  const totalCharged = dailyEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalCharged - totalPaid;

  const shopName = selectedShop?.name || 'Safdar & Sons';
  const lastEntry = dailyEntries[dailyEntries.length - 1];

  const dailyWaMessage = lastEntry
    ? restaurantDailyMessage(
        restaurant.name,
        lastEntry.kg,
        lastEntry.rate_per_kg,
        lastEntry.amount,
        balance,
        shopName
      )
    : '';

  const now = new Date();
  const monthStr = now.toLocaleString('ur-PK', { month: 'long', year: 'numeric' });
  const monthlyWaMessage = restaurantMonthlyMessage(
    restaurant.name,
    monthStr,
    dailyEntries.reduce((s, e) => s + e.kg, 0),
    totalCharged,
    totalPaid,
    balance
  );

  const handleAddDaily = () => {
    if (!dailyForm.kg || !selectedShop) return;
    const kg = parseFloat(dailyForm.kg);
    const rate = parseFloat(dailyForm.rate) || 0;
    onAddDaily(restaurant.id, selectedShop.id, kg, rate, dailyForm.date);
    setDailyForm((f) => ({ ...f, kg: '' }));
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${balance > 0 ? 'border-orange-400' : 'border-green-400'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="text-right">
          <p className="font-bold text-gray-800 text-lg">{restaurant.name}</p>
          {restaurant.phone && <p className="text-sm text-gray-400">{restaurant.phone}</p>}
        </div>
        <div className="text-right">
          <p className={`font-bold text-xl ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {formatCurrency(Math.abs(balance))}
          </p>
          <p className="text-xs text-gray-400">{balance > 0 ? 'بقایا' : 'صاف'}</p>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-3">
          {/* Add daily entry */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2 text-right">آج کی خریداری</p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={dailyForm.date}
                onChange={(e) => setDailyForm((f) => ({ ...f, date: e.target.value }))}
                className="border rounded-xl px-3 py-2 text-sm"
              />
              <input
                type="number"
                inputMode="decimal"
                value={dailyForm.kg}
                onChange={(e) => setDailyForm((f) => ({ ...f, kg: e.target.value }))}
                className="border rounded-xl px-3 py-2 text-sm w-24"
                placeholder="kg"
              />
              <input
                type="number"
                inputMode="numeric"
                value={dailyForm.rate}
                onChange={(e) => setDailyForm((f) => ({ ...f, rate: e.target.value }))}
                className="border rounded-xl px-3 py-2 text-sm w-24"
                placeholder="Rs/kg"
              />
              <button
                onClick={handleAddDaily}
                className="bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm"
              >
                + شامل
              </button>
            </div>
            {dailyForm.kg && dailyForm.rate && (
              <p className="text-sm text-gray-500 mt-1 text-right">
                {parseFloat(dailyForm.kg)} kg × Rs {parseFloat(dailyForm.rate)} = {formatCurrency(parseFloat(dailyForm.kg) * parseFloat(dailyForm.rate))}
              </p>
            )}
          </div>

          {/* Add payment */}
          <div>
            <p className="text-sm font-semibold text-green-600 mb-2 text-right">ادائیگی</p>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={payForm.amount}
                onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                className="border rounded-xl px-3 py-2 text-sm flex-1"
                placeholder="رقم"
              />
              <input
                value={payForm.note}
                onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))}
                className="border rounded-xl px-3 py-2 text-sm flex-1"
                placeholder="نوٹ"
              />
              <button
                onClick={() => {
                  if (payForm.amount) {
                    onAddPayment(restaurant.id, parseFloat(payForm.amount), payForm.note);
                    setPayForm({ amount: '', note: '' });
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold text-sm"
              >
                + ادائیگی
              </button>
            </div>
          </div>

          {/* WhatsApp buttons */}
          {restaurant.phone && (
            <div className="flex gap-2 flex-wrap">
              {lastEntry && (
                <WhatsAppButton
                  phone={restaurant.phone}
                  message={dailyWaMessage}
                  label="آج کا حساب"
                  size="sm"
                />
              )}
              <WhatsAppButton
                phone={restaurant.phone}
                message={monthlyWaMessage}
                label="ماہانہ حساب"
                size="sm"
              />
            </div>
          )}

          {/* Balance summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-orange-50 rounded-xl p-2">
              <p className="text-xs text-gray-500">کل رقم</p>
              <p className="font-bold text-orange-600 text-sm">{formatCurrency(totalCharged)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-2">
              <p className="text-xs text-gray-500">ادائیگی</p>
              <p className="font-bold text-green-600 text-sm">{formatCurrency(totalPaid)}</p>
            </div>
            <div className={`${balance > 0 ? 'bg-red-50' : 'bg-green-50'} rounded-xl p-2`}>
              <p className="text-xs text-gray-500">بقایا</p>
              <p className={`font-bold text-sm ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(balance))}
              </p>
            </div>
          </div>

          {/* Recent entries */}
          {dailyEntries.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-400 font-semibold text-right">حالیہ داخلے</p>
              {[...dailyEntries].reverse().slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                  <span className="text-orange-600 font-semibold">{formatCurrency(entry.amount)}</span>
                  <span className="text-gray-500 text-xs">{entry.date} — {entry.kg}kg @ Rs{entry.rate_per_kg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
