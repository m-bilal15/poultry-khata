'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ShopSelector } from '@/components/ShopSelector';
import { supabase } from '@/lib/supabase';
import { queueOperation } from '@/lib/offline';
import { Customer, RestaurantDaily, Payment } from '@/types';
import { formatCurrency, getToday } from '@/lib/calculations';
import { useT } from '@/hooks/useT';
import { useShop } from '@/hooks/useShop';

export default function RestaurantsPage() {
  const { t } = useT();
  const {
    customers,
    restaurantDaily,
    payments,
    addCustomer,
    addRestaurantDaily,
    addPayment,
    isOnline,
  } = useStore();
  const { selectedShop } = useShop();

  const [showAdd, setShowAdd] = useState(false);
  const [newRest, setNewRest] = useState({ name: '', phone: '', address: '', rate: '' });

  const restaurants = customers.filter((c) => c.type === 'restaurant');

  const getRestaurantBalance = (id: string) => {
    const charged = restaurantDaily.filter((e) => e.customer_id === id).reduce((s, e) => s + e.amount, 0);
    const paid = payments.filter((p) => p.customer_id === id).reduce((s, p) => s + p.amount, 0);
    return charged - paid;
  };

  const totalDue = restaurants.reduce((sum, r) => {
    const bal = getRestaurantBalance(r.id);
    return sum + (bal > 0 ? bal : 0);
  }, 0);

  const handleAddRestaurant = async () => {
    if (!newRest.name.trim()) return;
    const customer: Customer = {
      id: crypto.randomUUID(),
      user_id: 'local',
      name: newRest.name.trim(),
      phone: newRest.phone.trim(),
      type: 'restaurant',
    };
    addCustomer(customer);
    if (isOnline) {
      await supabase.from('customers').upsert(customer, { onConflict: 'id' });
    } else {
      await queueOperation({ table: 'customers', operation: 'insert', data: customer });
    }
    setNewRest({ name: '', phone: '', address: '', rate: '' });
    setShowAdd(false);
  };

  const handleAddDaily = async (customerId: string, shopId: string, kg: number, rate: number, date: string) => {
    const entry: RestaurantDaily = {
      id: crypto.randomUUID(),
      customer_id: customerId,
      shop_id: shopId,
      date,
      kg,
      rate_per_kg: rate,
      amount: kg * rate,
    };
    addRestaurantDaily(entry);
    if (isOnline) {
      await supabase.from('restaurant_daily').upsert(entry, { onConflict: 'id' });
    } else {
      await queueOperation({ table: 'restaurant_daily', operation: 'insert', data: entry });
    }
  };

  const handleAddPayment = async (customerId: string, amount: number, note: string) => {
    const payment: Payment = {
      id: crypto.randomUUID(),
      customer_id: customerId,
      date: getToday(),
      amount,
      note,
    };
    addPayment(payment);
    if (isOnline) {
      await supabase.from('payments').upsert(payment, { onConflict: 'id' });
    } else {
      await queueOperation({ table: 'payments', operation: 'insert', data: payment });
    }
  };

  const sorted = [...restaurants].sort((a, b) => getRestaurantBalance(b.id) - getRestaurantBalance(a.id));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2.5 rounded-2xl font-bold text-sm"
          style={{ boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          {t('restaurantPage')}
        </button>
        <h1 className="text-xl font-bold text-gray-800">{t('restaurantPage')}</h1>
      </div>

      <ShopSelector />

      {/* Total due */}
      <div className="rounded-3xl p-5 text-right" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1px solid #fed7aa' }}>
        <p className="text-orange-400 text-sm font-medium">{t('totalAmountDue')}</p>
        <p className="text-4xl font-bold text-orange-600 mt-1">{formatCurrency(totalDue)}</p>
        <p className="text-orange-400 text-xs mt-1">{restaurants.length} {t('restaurantPage')}</p>
      </div>

      {/* Add restaurant form */}
      {showAdd && (
        <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 4px 24px rgba(234,88,12,0.15)', border: '1px solid #fed7aa' }}>
          <p className="font-bold text-gray-700 mb-4 text-right text-lg">{t('newRestaurant')}</p>
          <input value={newRest.name} onChange={(e) => setNewRest((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-3 text-right text-base"
            placeholder={t('restaurantName')} autoFocus />
          <input value={newRest.phone} onChange={(e) => setNewRest((f) => ({ ...f, phone: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-3 text-base"
            placeholder={t('whatsappNum')} type="tel" dir="ltr" />
          <input value={newRest.rate} onChange={(e) => setNewRest((f) => ({ ...f, rate: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4 text-base"
            placeholder={t('defaultRate')} type="number" dir="ltr" />
          <div className="flex gap-2">
            <button onClick={() => { setShowAdd(false); setNewRest({ name: '', phone: '', address: '', rate: '' }); }}
              className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-bold">{t('cancel')}</button>
            <button onClick={handleAddRestaurant}
              className="flex-1 bg-orange-500 text-white py-3.5 rounded-2xl font-bold"
              style={{ boxShadow: '0 4px 12px rgba(234,88,12,0.3)' }}>{t('save')}</button>
          </div>
        </div>
      )}

      {/* Restaurant cards — 2-col grid on desktop */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="text-gray-500 font-semibold">{t('noRestaurants')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('addRestHint')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {sorted.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              dailyEntries={restaurantDaily.filter((e) => e.customer_id === restaurant.id)}
              payments={payments.filter((p) => p.customer_id === restaurant.id)}
              onAddDaily={handleAddDaily}
              onAddPayment={handleAddPayment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
