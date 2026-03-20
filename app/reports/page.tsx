'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useShop } from '@/hooks/useShop';
import { ShopSelector } from '@/components/ShopSelector';
import { formatCurrency, formatKg, buildDailySummary, getMonthRange, getWeekRange } from '@/lib/calculations';

type Period = 'week' | 'month' | 'all';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const { shops, dailyEntries, expenses, customers, udhaarEntries, restaurantDaily, payments } = useStore();
  const { selectedShop } = useShop();

  const getDateRange = (): { start: string; end: string } => {
    if (period === 'week') return getWeekRange();
    if (period === 'month') return getMonthRange();
    return { start: '2000-01-01', end: '2999-12-31' };
  };

  const { start, end } = getDateRange();

  // Per-shop profit
  const shopReports = shops.map((shop) => {
    const entries = dailyEntries.filter(
      (e) => e.shop_id === shop.id && e.date >= start && e.date <= end
    );
    const shopExpenses = expenses.filter(
      (e) => e.shop_id === shop.id && e.date >= start && e.date <= end
    );

    const summaries = entries.map((entry) => {
      const dayExp = shopExpenses.filter((e) => e.date === entry.date);
      return buildDailySummary(entry, dayExp);
    });

    const totalLiveWeight = summaries.reduce((s, r) => s + r.live_weight_kg, 0);
    const totalMeatSold = summaries.reduce((s, r) => s + r.meat_sold_kg, 0);
    const totalCash = summaries.reduce((s, r) => s + r.cash_collected, 0);
    const totalCost = summaries.reduce((s, r) => s + r.purchase_cost, 0);
    const totalExpenses = summaries.reduce((s, r) => s + r.total_expenses, 0);
    const totalNetProfit = summaries.reduce((s, r) => s + r.net_profit, 0);
    const avgYield = totalLiveWeight > 0 ? (totalMeatSold / totalLiveWeight) * 100 : 0;

    return {
      shop,
      totalLiveWeight,
      totalMeatSold,
      totalCash,
      totalCost,
      totalExpenses,
      totalNetProfit,
      avgYield: Math.round(avgYield * 10) / 10,
      days: entries.length,
    };
  });

  const grandTotal = {
    netProfit: shopReports.reduce((s, r) => s + r.totalNetProfit, 0),
    cash: shopReports.reduce((s, r) => s + r.totalCash, 0),
    cost: shopReports.reduce((s, r) => s + r.totalCost, 0),
    expenses: shopReports.reduce((s, r) => s + r.totalExpenses, 0),
  };

  // Top udhaar defaulters
  const udhaarDefaulters = customers
    .filter((c) => c.type === 'individual')
    .map((c) => {
      const entries = udhaarEntries.filter((e) => e.customer_id === c.id);
      const balance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
      return { customer: c, balance };
    })
    .filter((d) => d.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10);

  // Top restaurant buyers
  const topRestaurants = customers
    .filter((c) => c.type === 'restaurant')
    .map((r) => {
      const entries = restaurantDaily.filter(
        (e) => e.customer_id === r.id && e.date >= start && e.date <= end
      );
      const totalKg = entries.reduce((s, e) => s + e.kg, 0);
      const totalAmount = entries.reduce((s, e) => s + e.amount, 0);
      const totalPaid = payments
        .filter((p) => p.customer_id === r.id)
        .reduce((s, p) => s + p.amount, 0);
      const balance = restaurantDaily
        .filter((e) => e.customer_id === r.id)
        .reduce((s, e) => s + e.amount, 0) - totalPaid;
      return { restaurant: r, totalKg, totalAmount, balance };
    })
    .sort((a, b) => b.totalKg - a.totalKg)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">رپورٹس</h1>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as Period[]).map((p) => {
          const labels = { week: 'ہفتہ', month: 'مہینہ', all: 'سب' };
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${
                period === p ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {labels[p]}
            </button>
          );
        })}
      </div>

      <ShopSelector />

      {/* Grand total */}
      <div className="bg-green-600 text-white rounded-2xl p-5">
        <p className="text-green-100 text-sm">کل خالص منافع</p>
        <p className="text-4xl font-bold">{formatCurrency(grandTotal.netProfit)}</p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div>
            <p className="text-green-200 text-xs">آمدنی</p>
            <p className="font-semibold text-sm">{formatCurrency(grandTotal.cash)}</p>
          </div>
          <div>
            <p className="text-green-200 text-xs">خریداری</p>
            <p className="font-semibold text-sm">{formatCurrency(grandTotal.cost)}</p>
          </div>
          <div>
            <p className="text-green-200 text-xs">اخراجات</p>
            <p className="font-semibold text-sm">{formatCurrency(grandTotal.expenses)}</p>
          </div>
        </div>
      </div>

      {/* Per-shop breakdown */}
      {shopReports.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-right">دکان وار تفصیل</h2>
          <div className="space-y-3">
            {shopReports.map(({ shop, totalNetProfit, totalMeatSold, avgYield, totalLiveWeight, totalCash, totalExpenses, days }) => (
              <div key={shop.id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-lg ${totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalNetProfit)}
                  </span>
                  <span className="font-bold text-gray-700">{shop.name}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <MiniStat label="دن" value={days.toString()} />
                  <MiniStat label="Yield" value={`${avgYield}%`} />
                  <MiniStat label="گوشت" value={formatKg(totalMeatSold)} />
                  <MiniStat label="آمدنی" value={formatCurrency(totalCash)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top udhaar defaulters */}
      {udhaarDefaulters.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-right">سب سے زیادہ ادھار</h2>
          <div className="space-y-2">
            {udhaarDefaulters.map(({ customer, balance }, i) => (
              <div key={customer.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-red-600 font-bold">{formatCurrency(balance)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{customer.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top restaurant buyers */}
      {topRestaurants.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-right">سب سے زیادہ خریدار</h2>
          <div className="space-y-2">
            {topRestaurants.map(({ restaurant, totalKg, totalAmount, balance }, i) => (
              <div key={restaurant.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="text-right">
                  <p className="text-orange-600 font-bold text-sm">{formatKg(totalKg)}</p>
                  {balance > 0 && (
                    <p className="text-red-500 text-xs">بقایا: {formatCurrency(balance)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{restaurant.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {shopReports.every((r) => r.days === 0) && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">📈</p>
          <p>اس مدت میں کوئی ڈیٹا نہیں</p>
          <p className="text-sm">خاتہ میں داخلے لکھیں</p>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-1.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs font-bold text-gray-700">{value}</p>
    </div>
  );
}
