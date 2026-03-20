'use client';

import { useState } from 'react';
import { ShopSelector } from '@/components/ShopSelector';
import { DailyEntryForm } from '@/components/DailyEntry';
import { getToday, formatCurrency, buildDailySummary } from '@/lib/calculations';
import { useStore } from '@/store/useStore';
import { useShop } from '@/hooks/useShop';
import { useT } from '@/hooks/useT';

export default function KhataPage() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const { dailyEntries, expenses } = useStore();
  const { selectedShop } = useShop();
  const { t } = useT();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-semibold"
          max={getToday()}
        />
        <h1 className="text-xl font-bold text-gray-800">{t('dailyKhata')}</h1>
      </div>

      <ShopSelector />
      <DailyEntryForm date={selectedDate} />

      <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <p className="font-bold text-gray-700 mb-4">{t('weeklySummary')}</p>
        <div className="space-y-1">
          {last7Days.map((date) => {
            const shopId = selectedShop?.id;
            if (!shopId) return null;
            const entry = dailyEntries.find((e) => e.shop_id === shopId && e.date === date);
            const dayExpenses = expenses.filter((e) => e.shop_id === shopId && e.date === date);
            const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('ur-PK', {
              weekday: 'short', day: 'numeric', month: 'short',
            });
            const isSelected = date === selectedDate;

            if (!entry) {
              return (
                <div key={date} className={`flex items-center justify-between px-3 py-2.5 rounded-2xl ${isSelected ? 'bg-green-50' : ''}`}>
                  <span className="text-gray-300 text-sm font-semibold">—</span>
                  <span className={`text-sm ${isSelected ? 'text-green-700 font-bold' : 'text-gray-400'}`}>{dayLabel}</span>
                </div>
              );
            }

            const profit = buildDailySummary(entry, dayExpenses).net_profit;
            return (
              <button key={date} onClick={() => setSelectedDate(date)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                <span className={`font-bold text-base ${profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {formatCurrency(profit)}
                </span>
                <span className={`text-sm ${isSelected ? 'text-green-700 font-bold' : 'text-gray-500'}`}>{dayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
