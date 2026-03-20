'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ShopSelector } from '@/components/ShopSelector';
import { supabase } from '@/lib/supabase';
import { queueOperation } from '@/lib/offline';
import { Customer, RestaurantDaily, Payment } from '@/types';
import { formatCurrency, getToday } from '@/lib/calculations';
import { useShop } from '@/hooks/useShop';

export default function RestaurantsPage() {
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
      await supabase.from('customers').insert(customer);
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
      await supabase.from('restaurant_daily').insert(entry);
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
      await supabase.from('payments').insert(payment);
    } else {
      await queueOperation({ table: 'payments', operation: 'insert', data: payment });
    }
  };

  const sorted = [...restaurants].sort((a, b) => getRestaurantBalance(b.id) - getRestaurantBalance(a.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdd(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm"
        >
          + ریسٹورنٹ
        </button>
        <h1 className="text-xl font-bold text-gray-800">ریسٹورنٹ</h1>
      </div>

      <ShopSelector />

      {/* Total due */}
      <div className="bg-orange-50 rounded-2xl p-4 text-right">
        <p className="text-gray-500 text-sm">کل بقایا رقم</p>
        <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalDue)}</p>
        <p className="text-xs text-gray-400">{restaurants.length} ریسٹورنٹ</p>
      </div>

      {/* Add restaurant */}
      {showAdd && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-200">
          <h2 className="font-bold text-gray-700 mb-3 text-right">نیا ریسٹورنٹ</h2>
          <input
            value={newRest.name}
            onChange={(e) => setNewRest((f) => ({ ...f, name: e.target.value }))}
            className="w-full border rounded-xl px-3 py-3 mb-2 text-right"
            placeholder="ریسٹورنٹ کا نام *"
            autoFocus
          />
          <input
            value={newRest.phone}
            onChange={(e) => setNewRest((f) => ({ ...f, phone: e.target.value }))}
            className="w-full border rounded-xl px-3 py-3 mb-2"
            placeholder="WhatsApp نمبر"
            type="tel"
            dir="ltr"
          />
          <input
            value={newRest.rate}
            onChange={(e) => setNewRest((f) => ({ ...f, rate: e.target.value }))}
            className="w-full border rounded-xl px-3 py-3 mb-3"
            placeholder="معمول کا ریٹ (Rs/kg)"
            type="number"
            dir="ltr"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAdd(false); setNewRest({ name: '', phone: '', address: '', rate: '' }); }}
              className="flex-1 border border-gray-300 text-gray-500 py-3 rounded-xl font-semibold"
            >
              منسوخ
            </button>
            <button
              onClick={handleAddRestaurant}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold"
            >
              محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {/* Restaurant list */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">🍗</p>
          <p>کوئی ریسٹورنٹ نہیں</p>
          <p className="text-sm">اوپر + ریسٹورنٹ بٹن سے شامل کریں</p>
        </div>
      ) : (
        <div className="space-y-3">
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
