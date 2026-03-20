'use client';

import { useState } from 'react';
import { Customer, UdhaarEntry } from '@/types';
import { WhatsAppButton } from './WhatsAppButton';
import { udhaarReminderMessage } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/calculations';
import { useShop } from '@/hooks/useShop';

interface Props {
  customer: Customer;
  entries: UdhaarEntry[];
  balance: number;
  onAddDebit: (customerId: string, amount: number, note: string) => void;
  onAddCredit: (customerId: string, amount: number, note: string) => void;
}

export function UdhaarCard({ customer, entries, balance, onAddDebit, onAddCredit }: Props) {
  const { selectedShop } = useShop();
  const [expanded, setExpanded] = useState(false);
  const [debitForm, setDebitForm] = useState({ amount: '', note: '' });
  const [creditForm, setCreditForm] = useState({ amount: '', note: '' });

  const shopName = selectedShop?.name || 'Safdar & Sons';
  const waMessage = udhaarReminderMessage(customer.name, balance, shopName);
  const isOwed = balance > 0;

  return (
    <div className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: `1px solid ${isOwed ? '#fee2e2' : '#dcfce7'}` }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full">
        <div className="flex items-center justify-between p-4">
          {/* Right side - name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg"
              style={{ background: isOwed ? '#fef2f2' : '#f0fdf4', color: isOwed ? '#dc2626' : '#16a34a' }}>
              {customer.name.charAt(0)}
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{customer.name}</p>
              {customer.phone && <p className="text-xs text-gray-400">{customer.phone}</p>}
            </div>
          </div>

          {/* Left side - amount + chevron */}
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className={`font-bold text-xl leading-tight ${isOwed ? 'text-red-600' : balance < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-xs text-gray-400 text-right">{isOwed ? 'بقایا' : balance < 0 ? 'زیادہ' : 'صاف ✓'}</p>
            </div>
            <svg className={`w-4 h-4 text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-4">
          {/* WhatsApp */}
          {customer.phone && isOwed && (
            <div className="flex justify-end">
              <WhatsAppButton phone={customer.phone} message={waMessage} label="یاددہانی بھیجیں" size="sm" />
            </div>
          )}

          {/* Debit / Credit forms */}
          <div className="grid grid-cols-2 gap-3">
            {/* Debit */}
            <div className="rounded-2xl p-3 space-y-2" style={{ background: '#fef2f2' }}>
              <p className="text-xs font-bold text-red-600 text-center">ادھار دیا</p>
              <input type="number" inputMode="numeric" value={debitForm.amount}
                onChange={(e) => setDebitForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full bg-white border border-red-100 rounded-xl px-3 py-2 text-center font-bold text-gray-800"
                placeholder="0" />
              <input value={debitForm.note}
                onChange={(e) => setDebitForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full bg-white border border-red-100 rounded-xl px-3 py-2 text-xs text-right"
                placeholder="نوٹ" />
              <button
                onClick={() => { if (debitForm.amount) { onAddDebit(customer.id, parseFloat(debitForm.amount), debitForm.note); setDebitForm({ amount: '', note: '' }); } }}
                className="w-full bg-red-500 text-white py-2 rounded-xl font-bold text-sm"
                style={{ boxShadow: '0 2px 8px rgba(220,38,38,0.2)' }}>
                + ادھار
              </button>
            </div>

            {/* Credit */}
            <div className="rounded-2xl p-3 space-y-2" style={{ background: '#f0fdf4' }}>
              <p className="text-xs font-bold text-green-600 text-center">ادائیگی ملی</p>
              <input type="number" inputMode="numeric" value={creditForm.amount}
                onChange={(e) => setCreditForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full bg-white border border-green-100 rounded-xl px-3 py-2 text-center font-bold text-gray-800"
                placeholder="0" />
              <input value={creditForm.note}
                onChange={(e) => setCreditForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full bg-white border border-green-100 rounded-xl px-3 py-2 text-xs text-right"
                placeholder="نوٹ" />
              <button
                onClick={() => { if (creditForm.amount) { onAddCredit(customer.id, parseFloat(creditForm.amount), creditForm.note); setCreditForm({ amount: '', note: '' }); } }}
                className="w-full bg-green-600 text-white py-2 rounded-xl font-bold text-sm"
                style={{ boxShadow: '0 2px 8px rgba(22,163,74,0.2)' }}>
                + ادائیگی
              </button>
            </div>
          </div>

          {/* History */}
          {entries.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 text-right mb-2">لین دین کی تاریخ</p>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {[...entries].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{entry.date}</p>
                      {entry.note && <p className="text-xs text-gray-400">{entry.note}</p>}
                    </div>
                    <div className="flex gap-2">
                      {entry.debit > 0 && (
                        <span className="text-red-600 font-bold text-sm bg-red-50 px-2 py-0.5 rounded-lg">-{formatCurrency(entry.debit)}</span>
                      )}
                      {entry.credit > 0 && (
                        <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-0.5 rounded-lg">+{formatCurrency(entry.credit)}</span>
                      )}
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
