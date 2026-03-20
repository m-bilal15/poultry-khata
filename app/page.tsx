'use client';

import { useStore } from '@/store/useStore';
import { useShop } from '@/hooks/useShop';
import { useT } from '@/hooks/useT';
import { ShopSelector } from '@/components/ShopSelector';
import { DashboardSkeleton } from '@/components/Skeleton';
import { formatCurrency, getToday, buildDailySummary } from '@/lib/calculations';
import Link from 'next/link';

export default function Dashboard() {
  const { shops, dailyEntries, expenses, udhaarEntries, customers, restaurantDaily, payments, isLoading } = useStore();
  const { t, lang } = useT();
  const today = getToday();

  if (isLoading && shops.length === 0) return <DashboardSkeleton />;

  const todayNetProfit = shops.reduce((total, shop) => {
    const entry = dailyEntries.find((e) => e.shop_id === shop.id && e.date === today);
    if (!entry) return total;
    const shopExpenses = expenses.filter((e) => e.shop_id === shop.id && e.date === today);
    return total + buildDailySummary(entry, shopExpenses).net_profit;
  }, 0);

  const totalUdhaar = customers
    .filter((c) => c.type === 'individual')
    .reduce((total, customer) => {
      const entries = udhaarEntries.filter((e) => e.customer_id === customer.id);
      if (!entries.length) return total;
      const bal = entries[entries.length - 1].balance;
      return total + (bal > 0 ? bal : 0);
    }, 0);

  const totalRestaurantDue = customers
    .filter((c) => c.type === 'restaurant')
    .reduce((total, r) => {
      const charged = restaurantDaily.filter((e) => e.customer_id === r.id).reduce((s, e) => s + e.amount, 0);
      const paid = payments.filter((p) => p.customer_id === r.id).reduce((s, p) => s + p.amount, 0);
      const bal = charged - paid;
      return total + (bal > 0 ? bal : 0);
    }, 0);

  const udhaarCount = customers.filter((c) => c.type === 'individual').length;
  const restCount = customers.filter((c) => c.type === 'restaurant').length;

  const todayDateStr = new Date().toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-PK', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* ── Desktop: 2-col grid / Mobile: single col ── */}
      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-6 space-y-5 md:space-y-0">

        {/* Left column: Hero + Quick Actions */}
        <div className="space-y-4">
          {/* Hero */}
          <div
            className="rounded-3xl p-6 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 55%, #14532d 100%)', boxShadow: '0 8px 32px rgba(22,163,74,0.35)' }}
          >
            <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(-35%, -35%)' }} />
            <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(35%, 35%)' }} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="bg-white/20 rounded-2xl px-3 py-1.5 flex-shrink-0">
                  <p className="text-green-100 text-xs font-medium leading-snug">{todayDateStr}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-xl font-bold leading-tight">{t('brandName')}</h1>
                  <p className="text-green-200 text-xs">{t('brandSub')}</p>
                </div>
              </div>
              <p className="text-green-200 text-sm mb-1">{t('todayProfit')}</p>
              <p className={`text-5xl font-bold tracking-tight ${todayNetProfit < 0 ? 'text-red-300' : 'text-white'}`}>
                {formatCurrency(todayNetProfit)}
              </p>
              <p className="text-green-300 text-xs mt-2">{t('allShopsCombined')}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <p className="font-bold text-gray-600 text-sm mb-3">{t('quickEntry')}</p>
            <div className="grid grid-cols-3 gap-3">
              <QuickAction href="/khata" label={t('writeKhata')} color="green"
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
              />
              <QuickAction href="/udhaar" label={t('writeUdhaar')} color="red"
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              />
              <QuickAction href="/restaurants" label={t('restaurants')} color="orange"
                icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              />
            </div>
          </div>
        </div>

        {/* Right column: Stats + Shop selector + Shops summary */}
        <div className="space-y-4">
          {/* Balance stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <Link href="/udhaar">
              <div className="bg-white rounded-3xl p-4 h-full hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 16px rgba(220,38,38,0.09)', border: '1px solid #fee2e2' }}>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#fef2f2' }}>
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-xs mb-1">{t('totalUdhaarDue')}</p>
                <p className="text-2xl font-bold text-red-600 leading-tight">{formatCurrency(totalUdhaar)}</p>
                <p className="text-gray-300 text-xs mt-1.5">{udhaarCount} {t('customers')}</p>
              </div>
            </Link>

            <Link href="/restaurants">
              <div className="bg-white rounded-3xl p-4 h-full hover:shadow-md transition-shadow" style={{ boxShadow: '0 2px 16px rgba(234,88,12,0.09)', border: '1px solid #ffedd5' }}>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#fff7ed' }}>
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-400 text-xs mb-1">{t('restaurantDue')}</p>
                <p className="text-2xl font-bold text-orange-600 leading-tight">{formatCurrency(totalRestaurantDue)}</p>
                <p className="text-gray-300 text-xs mt-1.5">{restCount} {t('restaurants')}</p>
              </div>
            </Link>
          </div>

          {/* Shop selector */}
          <ShopSelector />

          {/* Per-shop today summary */}
          {shops.length > 1 && (
            <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <p className="font-bold text-gray-600 text-sm mb-3">{t('todayShops')}</p>
              <div className="space-y-2">
                {shops.map((shop) => {
                  const entry = dailyEntries.find((e) => e.shop_id === shop.id && e.date === today);
                  const shopExpenses = expenses.filter((e) => e.shop_id === shop.id && e.date === today);
                  const profit = entry ? buildDailySummary(entry, shopExpenses).net_profit : null;
                  return (
                    <div key={shop.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <span className={`font-bold text-base ${profit === null ? 'text-gray-300' : profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {profit === null ? t('noEntry') : formatCurrency(profit)}
                      </span>
                      <span className="font-semibold text-gray-700 text-sm">{shop.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, label, color, icon }: { href: string; label: string; color: 'green' | 'red' | 'orange'; icon: React.ReactNode }) {
  const styles = {
    green:  { bg: '#f0fdf4', iconBg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
    red:    { bg: '#fef2f2', iconBg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
    orange: { bg: '#fff7ed', iconBg: '#ffedd5', text: '#ea580c', border: '#fed7aa' },
  }[color];

  return (
    <Link href={href}>
      <div
        className="rounded-2xl p-3 text-center flex flex-col items-center gap-2 border hover:opacity-80 transition-opacity"
        style={{ background: styles.bg, borderColor: styles.border }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: styles.iconBg, color: styles.text }}>
          {icon}
        </div>
        <span className="text-xs font-bold leading-tight" style={{ color: styles.text }}>{label}</span>
      </div>
    </Link>
  );
}
