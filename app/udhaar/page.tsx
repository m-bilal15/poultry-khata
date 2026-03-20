'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { UdhaarCard } from '@/components/UdhaarCard';
import { supabase } from '@/lib/supabase';
import { queueOperation } from '@/lib/offline';
import { Customer, UdhaarEntry } from '@/types';
import { formatCurrency, getToday } from '@/lib/calculations';
import { useT } from '@/hooks/useT';

export default function UdhaarPage() {
  const {
    customers,
    udhaarEntries,
    addCustomer,
    addUdhaarEntry,
    isOnline,
  } = useStore();

  const { t } = useT();
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAddCustomer(true)}
          className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2.5 rounded-2xl font-bold text-sm"
          style={{ boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          {t('customer')}
        </button>
        <h1 className="text-xl font-bold text-gray-800">{t('udhaarLedger')}</h1>
      </div>

      {/* Total outstanding */}
      <div className="rounded-3xl p-5 text-right" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1px solid #fecaca' }}>
        <p className="text-red-400 text-sm font-medium">{t('totalUdhaar')}</p>
        <p className="text-4xl font-bold text-red-600 mt-1">{formatCurrency(totalOutstanding)}</p>
        <p className="text-red-400 text-xs mt-1">{sorted.filter((c) => getCustomerBalance(c.id) > 0).length} {t('customersRemain')}</p>
      </div>

      {/* Search */}
      {individualCustomers.length > 3 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-right"
          placeholder={t('searchPlaceholder')}
        />
      )}

      {/* Add customer form */}
      {showAddCustomer && (
        <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 4px 24px rgba(22,163,74,0.15)', border: '1px solid #bbf7d0' }}>
          <p className="font-bold text-gray-700 mb-4 text-right text-lg">{t('addNewCustomer')}</p>
          <input
            value={newCustomer.name}
            onChange={(e) => setNewCustomer((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-3 text-right text-base"
            placeholder={t('nameReq')}
            autoFocus
          />
          <input
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer((f) => ({ ...f, phone: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4 text-base"
            placeholder={t('whatsappNum')}
            type="tel"
            dir="ltr"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAddCustomer(false); setNewCustomer({ name: '', phone: '' }); }}
              className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-bold"
            >{t('cancel')}</button>
            <button
              onClick={handleAddCustomer}
              className="flex-1 bg-green-600 text-white py-3.5 rounded-2xl font-bold"
              style={{ boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
            >{t('save')}</button>
          </div>
        </div>
      )}

      {/* Customer list — 2-col grid on desktop */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <p className="text-gray-500 font-semibold">{t('noCustomers')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('addCustomerHint')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
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
