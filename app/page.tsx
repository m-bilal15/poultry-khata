'use client';

import { useStore } from '@/store/useStore';
import { useShop } from '@/hooks/useShop';
import { ShopSelector } from '@/components/ShopSelector';
import { formatCurrency, getToday, buildDailySummary } from '@/lib/calculations';
import Link from 'next/link';

export default function Dashboard() {
  const { shops, dailyEntries, expenses, udhaarEntries, customers, restaurantDaily, payments } = useStore();
  const { selectedShop } = useShop();
  const today = getToday();

  // Today's profit across all shops
  const todayNetProfit = shops.reduce((total, shop) => {
    const entry = dailyEntries.find((e) => e.shop_id === shop.id && e.date === today);
    if (!entry) return total;
    const shopExpenses = expenses.filter((e) => e.shop_id === shop.id && e.date === today);
    const summary = buildDailySummary(entry, shopExpenses);
    return total + summary.net_profit;
  }, 0);

  // Total udhaar outstanding
  const totalUdhaar = customers
    .filter((c) => c.type === 'individual')
    .reduce((total, customer) => {
      const customerEntries = udhaarEntries.filter((e) => e.customer_id === customer.id);
      if (customerEntries.length === 0) return total;
      const lastEntry = customerEntries[customerEntries.length - 1];
      return total + (lastEntry.balance > 0 ? lastEntry.balance : 0);
    }, 0);

  // Total restaurant balance due
  const totalRestaurantDue = customers
    .filter((c) => c.type === 'restaurant')
    .reduce((total, restaurant) => {
      const charged = restaurantDaily
        .filter((e) => e.customer_id === restaurant.id)
        .reduce((s, e) => s + e.amount, 0);
      const paid = payments
        .filter((p) => p.customer_id === restaurant.id)
        .reduce((s, p) => s + p.amount, 0);
      const balance = charged - paid;
      return total + (balance > 0 ? balance : 0);
    }, 0);

  const udhaarCustomerCount = customers.filter((c) => c.type === 'individual').length;
  const restaurantCount = customers.filter((c) => c.type === 'restaurant').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pt-2 pb-1">
        <h1 className="text-2xl font-bold text-green-700">صفدر اینڈ سنز</h1>
        <p className="text-gray-500 text-sm">Poultry Traders — Lahore</p>
      </div>

      {/* Shop selector */}
      <ShopSelector />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3">
        {/* Today's profit */}
        <div className={`rounded-2xl p-5 shadow-sm ${todayNetProfit >= 0 ? 'bg-green-600' : 'bg-red-500'} text-white`}>
          <p className="text-green-100 text-sm font-medium">آج کا خالص منافع</p>
          <p className="text-4xl font-bold mt-1">{formatCurrency(todayNetProfit)}</p>
          <p className="text-green-200 text-xs mt-1">تمام دکانوں کا مجموعہ</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Udhaar */}
          <Link href="/udhaar">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-red-400 h-full">
              <p className="text-gray-500 text-xs">کل ادھار بقایا</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalUdhaar)}</p>
              <p className="text-xs text-gray-400 mt-1">{udhaarCustomerCount} گاہک</p>
            </div>
          </Link>

          {/* Restaurant */}
          <Link href="/restaurants">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-orange-400 h-full">
              <p className="text-gray-500 text-xs">ریسٹورنٹ بقایا</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(totalRestaurantDue)}</p>
              <p className="text-xs text-gray-400 mt-1">{restaurantCount} ریسٹورنٹ</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2">
        <QuickAction href="/khata" icon="📊" label="خاتہ لکھیں" color="green" />
        <QuickAction href="/udhaar" icon="📋" label="ادھار لکھیں" color="red" />
        <QuickAction href="/restaurants" icon="🍗" label="ریسٹورنٹ" color="orange" />
      </div>

      {/* Per-shop today summary */}
      {shops.length > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-right">آج کی دکانیں</h2>
          <div className="space-y-2">
            {shops.map((shop) => {
              const entry = dailyEntries.find((e) => e.shop_id === shop.id && e.date === today);
              const shopExpenses = expenses.filter((e) => e.shop_id === shop.id && e.date === today);
              if (!entry) {
                return (
                  <div key={shop.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-400 text-sm">کوئی داخلہ نہیں</span>
                    <span className="font-semibold text-gray-700">{shop.name}</span>
                  </div>
                );
              }
              const summary = buildDailySummary(entry, shopExpenses);
              return (
                <div key={shop.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className={`font-bold text-lg ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.net_profit)}
                  </span>
                  <span className="font-semibold text-gray-700">{shop.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  color: 'green' | 'red' | 'orange';
}) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <Link href={href}>
      <div className={`${colors[color]} border rounded-2xl p-3 text-center flex flex-col items-center gap-1`}>
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold">{label}</span>
      </div>
    </Link>
  );
}
