'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useShop } from '@/hooks/useShop';
import { ShopSelector } from '@/components/ShopSelector';
import { formatCurrency, formatKg, buildDailySummary, getMonthRange, getWeekRange } from '@/lib/calculations';
import { useT } from '@/hooks/useT';
import { ReportsSkeleton } from '@/components/Skeleton';

type Period = 'week' | 'month' | 'all';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const { shops, dailyEntries, expenses, customers, udhaarEntries, restaurantDaily, payments, isLoading } = useStore();

  if (isLoading && shops.length === 0) return <ReportsSkeleton />;
  const { selectedShop } = useShop();
  const { t } = useT();

  const getDateRange = (): { start: string; end: string } => {
    if (period === 'week') return getWeekRange();
    if (period === 'month') return getMonthRange();
    return { start: '2000-01-01', end: '2999-12-31' };
  };

  const { start, end } = getDateRange();

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

  const periodKeys = { week: 'week', month: 'month', all: 'all' } as const;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 text-right">{t('reportsPage')}</h1>

      {/* Period selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all ${period === p ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            style={period === p ? { boxShadow: '0 4px 12px rgba(22,163,74,0.25)' } : {}}>
            {t(periodKeys[p])}
          </button>
        ))}
      </div>

      <ShopSelector />

      {/* Grand total hero */}
      <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
        <p className="text-green-200 text-sm mb-1">{t('totalNetProfit')}</p>
        <p className="text-4xl font-bold">{formatCurrency(grandTotal.netProfit)}</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 rounded-2xl p-2.5">
            <p className="text-green-200 text-xs">{t('revenue')}</p>
            <p className="font-bold text-sm mt-0.5">{formatCurrency(grandTotal.cash)}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5">
            <p className="text-green-200 text-xs">{t('purchase')}</p>
            <p className="font-bold text-sm mt-0.5">{formatCurrency(grandTotal.cost)}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5">
            <p className="text-green-200 text-xs">{t('expenses')}</p>
            <p className="font-bold text-sm mt-0.5">{formatCurrency(grandTotal.expenses)}</p>
          </div>
        </div>
      </div>

      {/* ── Desktop: 3-col grid / Mobile: stacked ── */}
      {shopReports.every((r) => r.days === 0) ? (
        <div className="bg-white rounded-3xl p-12 text-center" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <p className="text-gray-500 font-semibold">{t('noDataPeriod')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('writeKhataHint')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Per-shop breakdown */}
          {shopReports.length > 0 && (
            <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <p className="font-bold text-gray-700 mb-4 text-right">{t('perShopBreakdown')}</p>
              <div className="space-y-3">
                {shopReports.map(({ shop, totalNetProfit, totalMeatSold, avgYield, totalCash, days }) => (
                  <div key={shop.id} className="border border-gray-100 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-lg ${totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalNetProfit)}</span>
                      <span className="font-bold text-gray-700 text-sm">{shop.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-center">
                      <MiniStat label={t('days')} value={days.toString()} />
                      <MiniStat label="Yield" value={`${avgYield}%`} />
                      <MiniStat label={t('meat')} value={formatKg(totalMeatSold)} />
                      <MiniStat label={t('revenue')} value={formatCurrency(totalCash)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top udhaar defaulters */}
          {udhaarDefaulters.length > 0 && (
            <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <p className="font-bold text-gray-700 mb-4 text-right">{t('highestUdhaar')}</p>
              <div className="space-y-2">
                {udhaarDefaulters.map(({ customer, balance }, i) => (
                  <div key={customer.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-red-600 font-bold">{formatCurrency(balance)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 text-sm">{customer.name}</span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top restaurant buyers */}
          {topRestaurants.length > 0 && (
            <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <p className="font-bold text-gray-700 mb-4 text-right">{t('topBuyers')}</p>
              <div className="space-y-2">
                {topRestaurants.map(({ restaurant, totalKg, balance }, i) => (
                  <div key={restaurant.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-orange-600 font-bold text-sm">{formatKg(totalKg)}</p>
                      {balance > 0 && <p className="text-red-500 text-xs">{t('balance')}: {formatCurrency(balance)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 text-sm">{restaurant.name}</span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">{i + 1}</span>
                    </div>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-1.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs font-bold text-gray-700">{value}</p>
    </div>
  );
}
