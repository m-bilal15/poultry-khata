'use client';

import { useState } from 'react';
import { ShopSelector } from '@/components/ShopSelector';
import { DailyEntryForm } from '@/components/DailyEntry';
import { getToday } from '@/lib/calculations';
import { useStore } from '@/store/useStore';
import { useShop } from '@/hooks/useShop';
import { formatCurrency, buildDailySummary } from '@/lib/calculations';

export default function KhataPage() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const { dailyEntries, expenses, shops } = useStore();
  const { selectedShop } = useShop();

  // Weekly summary
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">روزانہ خاتہ</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
          max={getToday()}
        />
      </div>

      <ShopSelector />

      <DailyEntryForm date={selectedDate} />

      {/* Weekly overview */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-700 mb-3 text-right">ہفتہ وار خلاصہ</h2>
        <div className="space-y-1">
          {last7Days.map((date) => {
            const shopId = selectedShop?.id;
            if (!shopId) return null;
            const entry = dailyEntries.find((e) => e.shop_id === shopId && e.date === date);
            const dayExpenses = expenses.filter((e) => e.shop_id === shopId && e.date === date);

            const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('ur-PK', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });

            if (!entry) {
              return (
                <div key={date} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-300 text-sm">—</span>
                  <span className="text-gray-400 text-sm">{dayLabel}</span>
                </div>
              );
            }

            const summary = buildDailySummary(entry, dayExpenses);
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`w-full flex items-center justify-between py-2 border-b border-gray-50 ${
                  date === selectedDate ? 'bg-green-50 rounded-xl px-2' : ''
                }`}
              >
                <span className={`font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.net_profit)}
                </span>
                <span className="text-gray-600 text-sm">{dayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
