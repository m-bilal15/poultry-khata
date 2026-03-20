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

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${balance > 0 ? 'border-red-400' : 'border-green-400'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          {customer.phone && balance > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <WhatsAppButton phone={customer.phone} message={waMessage} label="" size="sm" />
            </div>
          )}
          <div className="text-right">
            <p className="font-bold text-gray-800 text-lg">{customer.name}</p>
            {customer.phone && (
              <p className="text-sm text-gray-400">{customer.phone}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-xl ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(Math.abs(balance))}
          </p>
          <p className="text-xs text-gray-400">{balance > 0 ? 'بقایا' : balance < 0 ? 'زیادہ ادائیگی' : 'صاف'}</p>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Add debit/credit */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-600 text-center">ادھار دیا (Debit)</p>
              <input
                type="number"
                inputMode="numeric"
                value={debitForm.amount}
                onChange={(e) => setDebitForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full border rounded-xl px-3 py-2 text-center"
                placeholder="رقم"
              />
              <input
                value={debitForm.note}
                onChange={(e) => setDebitForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="نوٹ"
              />
              <button
                onClick={() => {
                  if (debitForm.amount) {
                    onAddDebit(customer.id, parseFloat(debitForm.amount), debitForm.note);
                    setDebitForm({ amount: '', note: '' });
                  }
                }}
                className="w-full bg-red-500 text-white py-2 rounded-xl font-semibold text-sm"
              >
                + ادھار
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-green-600 text-center">ادائیگی ملی (Credit)</p>
              <input
                type="number"
                inputMode="numeric"
                value={creditForm.amount}
                onChange={(e) => setCreditForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full border rounded-xl px-3 py-2 text-center"
                placeholder="رقم"
              />
              <input
                value={creditForm.note}
                onChange={(e) => setCreditForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full border rounded-xl px-3 py-2 text-sm"
                placeholder="نوٹ"
              />
              <button
                onClick={() => {
                  if (creditForm.amount) {
                    onAddCredit(customer.id, parseFloat(creditForm.amount), creditForm.note);
                    setCreditForm({ amount: '', note: '' });
                  }
                }}
                className="w-full bg-green-600 text-white py-2 rounded-xl font-semibold text-sm"
              >
                + ادائیگی
              </button>
            </div>
          </div>

          {/* History */}
          {entries.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-400 text-right font-semibold">تاریخ</p>
              {[...entries].reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                  <div className="text-right">
                    <span className="text-gray-500 text-xs">{entry.date}</span>
                    {entry.note && <span className="text-gray-400 text-xs mr-1"> — {entry.note}</span>}
                  </div>
                  <div className="flex gap-2">
                    {entry.debit > 0 && (
                      <span className="text-red-600 font-semibold">-{formatCurrency(entry.debit)}</span>
                    )}
                    {entry.credit > 0 && (
                      <span className="text-green-600 font-semibold">+{formatCurrency(entry.credit)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
