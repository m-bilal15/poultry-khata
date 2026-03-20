'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { UdhaarCard } from '@/components/UdhaarCard';
import { supabase } from '@/lib/supabase';
import { queueOperation } from '@/lib/offline';
import { Customer, UdhaarEntry } from '@/types';
import { formatCurrency, getToday } from '@/lib/calculations';

export default function UdhaarPage() {
  const {
    customers,
    udhaarEntries,
    addCustomer,
    addUdhaarEntry,
    isOnline,
  } = useStore();

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [search, setSearch] = useState('');

  const individualCustomers = customers.filter((c) => c.type === 'individual');

  const getCustomerBalance = (customerId: string): number => {
    const entries = udhaarEntries.filter((e) => e.customer_id === customerId);
    if (entries.length === 0) return 0;
    return entries[entries.length - 1].balance;
  };

  const getCustomerEntries = (customerId: string): UdhaarEntry[] => {
    return udhaarEntries.filter((e) => e.customer_id === customerId);
  };

  // Sort by balance descending
  const sorted = [...individualCustomers]
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    .sort((a, b) => getCustomerBalance(b.id) - getCustomerBalance(a.id));

  const totalOutstanding = sorted.reduce((sum, c) => {
    const bal = getCustomerBalance(c.id);
    return sum + (bal > 0 ? bal : 0);
  }, 0);

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    const customer: Customer = {
      id: crypto.randomUUID(),
      user_id: 'local',
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      type: 'individual',
    };
    addCustomer(customer);
    if (isOnline) {
      await supabase.from('customers').insert(customer);
    } else {
      await queueOperation({ table: 'customers', operation: 'insert', data: customer });
    }
    setNewCustomer({ name: '', phone: '' });
    setShowAddCustomer(false);
  };

  const handleAddDebit = async (customerId: string, amount: number, note: string) => {
    const prevEntries = udhaarEntries.filter((e) => e.customer_id === customerId);
    const prevBalance = prevEntries.length > 0 ? prevEntries[prevEntries.length - 1].balance : 0;
    const entry: UdhaarEntry = {
      id: crypto.randomUUID(),
      customer_id: customerId,
      date: getToday(),
      debit: amount,
      credit: 0,
      note,
      balance: prevBalance + amount,
    };
    addUdhaarEntry(entry);
    if (isOnline) {
      await supabase.from('udhaar_entries').insert(entry);
    } else {
      await queueOperation({ table: 'udhaar_entries', operation: 'insert', data: entry });
    }
  };

  const handleAddCredit = async (customerId: string, amount: number, note: string) => {
    const prevEntries = udhaarEntries.filter((e) => e.customer_id === customerId);
    const prevBalance = prevEntries.length > 0 ? prevEntries[prevEntries.length - 1].balance : 0;
    const entry: UdhaarEntry = {
      id: crypto.randomUUID(),
      customer_id: customerId,
      date: getToday(),
      debit: 0,
      credit: amount,
      note,
      balance: prevBalance - amount,
    };
    addUdhaarEntry(entry);
    if (isOnline) {
      await supabase.from('udhaar_entries').insert(entry);
    } else {
      await queueOperation({ table: 'udhaar_entries', operation: 'insert', data: entry });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAddCustomer(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold text-sm"
        >
          + گاہک
        </button>
        <h1 className="text-xl font-bold text-gray-800">ادھار کھاتہ</h1>
      </div>

      {/* Total outstanding */}
      <div className="bg-red-50 rounded-2xl p-4 text-right">
        <p className="text-gray-500 text-sm">کل بقایا ادھار</p>
        <p className="text-3xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
        <p className="text-xs text-gray-400">{sorted.filter((c) => getCustomerBalance(c.id) > 0).length} گاہک باقی ہیں</p>
      </div>

      {/* Search */}
      {individualCustomers.length > 3 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 text-right"
          placeholder="نام یا نمبر سے تلاش کریں..."
        />
      )}

      {/* Add customer modal */}
      {showAddCustomer && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-green-200">
          <h2 className="font-bold text-gray-700 mb-3 text-right">نیا گاہک</h2>
          <input
            value={newCustomer.name}
            onChange={(e) => setNewCustomer((f) => ({ ...f, name: e.target.value }))}
            className="w-full border rounded-xl px-3 py-3 mb-2 text-right"
            placeholder="نام *"
            autoFocus
          />
          <input
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer((f) => ({ ...f, phone: e.target.value }))}
            className="w-full border rounded-xl px-3 py-3 mb-3"
            placeholder="WhatsApp نمبر (اختیاری)"
            type="tel"
            dir="ltr"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAddCustomer(false); setNewCustomer({ name: '', phone: '' }); }}
              className="flex-1 border border-gray-300 text-gray-500 py-3 rounded-xl font-semibold"
            >
              منسوخ
            </button>
            <button
              onClick={handleAddCustomer}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold"
            >
              محفوظ کریں
            </button>
          </div>
        </div>
      )}

      {/* Customer list */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">📋</p>
          <p>کوئی گاہک نہیں</p>
          <p className="text-sm">اوپر + گاہک بٹن سے شامل کریں</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((customer) => (
            <UdhaarCard
              key={customer.id}
              customer={customer}
              entries={getCustomerEntries(customer.id)}
              balance={getCustomerBalance(customer.id)}
              onAddDebit={handleAddDebit}
              onAddCredit={handleAddCredit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
