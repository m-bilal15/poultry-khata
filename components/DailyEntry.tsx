'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useShop } from '@/hooks/useShop';
import { supabase } from '@/lib/supabase';
import { queueOperation } from '@/lib/offline';
import { buildDailySummary, formatCurrency, getToday } from '@/lib/calculations';
import { DailyEntry as DailyEntryType, Expense } from '@/types';

interface Props {
  date?: string;
}

export function DailyEntryForm({ date = getToday() }: Props) {
  const { selectedShop } = useShop();
  const { dailyEntries, upsertDailyEntry, expenses, addExpense, removeExpense, isOnline } = useStore();

  const existing = dailyEntries.find(
    (e) => e.shop_id === selectedShop?.id && e.date === date
  );

  const [form, setForm] = useState({
    live_weight_kg: existing?.live_weight_kg?.toString() || '',
    purchase_cost: existing?.purchase_cost?.toString() || '',
    meat_sold_kg: existing?.meat_sold_kg?.toString() || '',
    cash_collected: existing?.cash_collected?.toString() || '',
  });

  const [expForm, setExpForm] = useState({
    category: 'misc' as Expense['category'],
    amount: '',
    note: '',
  });

  const [saved, setSaved] = useState(false);

  const todayExpenses = expenses.filter(
    (e) => e.shop_id === selectedShop?.id && e.date === date
  );

  useEffect(() => {
    if (existing) {
      setForm({
        live_weight_kg: existing.live_weight_kg.toString(),
        purchase_cost: existing.purchase_cost.toString(),
        meat_sold_kg: existing.meat_sold_kg.toString(),
        cash_collected: existing.cash_collected.toString(),
      });
    }
  }, [existing]);

  const handleSave = async () => {
    if (!selectedShop) return;

    const entry: DailyEntryType = {
      id: existing?.id || crypto.randomUUID(),
      shop_id: selectedShop.id,
      date,
      live_weight_kg: parseFloat(form.live_weight_kg) || 0,
      purchase_cost: parseFloat(form.purchase_cost) || 0,
      meat_sold_kg: parseFloat(form.meat_sold_kg) || 0,
      cash_collected: parseFloat(form.cash_collected) || 0,
    };

    upsertDailyEntry(entry);

    if (isOnline) {
      await supabase.from('daily_entries').upsert(entry, { onConflict: 'shop_id,date' });
    } else {
      await queueOperation({
        table: 'daily_entries',
        operation: existing ? 'update' : 'insert',
        data: entry,
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddExpense = async () => {
    if (!selectedShop || !expForm.amount) return;

    const expense: Expense = {
      id: crypto.randomUUID(),
      shop_id: selectedShop.id,
      date,
      category: expForm.category,
      amount: parseFloat(expForm.amount) || 0,
      note: expForm.note,
    };

    addExpense(expense);

    if (isOnline) {
      await supabase.from('expenses').insert(expense);
    } else {
      await queueOperation({ table: 'expenses', operation: 'insert', data: expense });
    }

    setExpForm({ category: 'misc', amount: '', note: '' });
  };

  const handleRemoveExpense = async (id: string) => {
    removeExpense(id);
    if (isOnline) {
      await supabase.from('expenses').delete().eq('id', id);
    } else {
      await queueOperation({ table: 'expenses', operation: 'delete', data: { id } });
    }
  };

  if (!selectedShop) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">پہلے ایک دکان منتخب کریں</p>
      </div>
    );
  }

  const previewEntry: DailyEntryType = {
    id: '',
    shop_id: selectedShop.id,
    date,
    live_weight_kg: parseFloat(form.live_weight_kg) || 0,
    purchase_cost: parseFloat(form.purchase_cost) || 0,
    meat_sold_kg: parseFloat(form.meat_sold_kg) || 0,
    cash_collected: parseFloat(form.cash_collected) || 0,
  };

  const summary = buildDailySummary(previewEntry, todayExpenses);

  const categoryLabels: Record<Expense['category'], string> = {
    rent: 'کرایہ',
    generator: 'جنریٹر',
    labor: 'مزدوری',
    misc: 'دیگر',
  };

  return (
    <div className="space-y-4">
      {/* Main entry */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="font-bold text-gray-700 text-lg text-right">روزانہ داخلہ — {selectedShop.name}</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">زندہ وزن (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.live_weight_kg}
              onChange={(e) => setForm((f) => ({ ...f, live_weight_kg: e.target.value }))}
              className="w-full border rounded-xl px-3 py-3 text-lg font-semibold"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">خریداری قیمت (Rs)</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.purchase_cost}
              onChange={(e) => setForm((f) => ({ ...f, purchase_cost: e.target.value }))}
              className="w-full border rounded-xl px-3 py-3 text-lg font-semibold"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">فروخت شدہ گوشت (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.meat_sold_kg}
              onChange={(e) => setForm((f) => ({ ...f, meat_sold_kg: e.target.value }))}
              className="w-full border rounded-xl px-3 py-3 text-lg font-semibold"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">نقد وصولی (Rs)</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.cash_collected}
              onChange={(e) => setForm((f) => ({ ...f, cash_collected: e.target.value }))}
              className="w-full border rounded-xl px-3 py-3 text-lg font-semibold"
              placeholder="0"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-green-600 text-white active:bg-green-700'
          }`}
        >
          {saved ? '✓ محفوظ ہو گیا' : 'محفوظ کریں'}
        </button>
      </div>

      {/* Live summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-3 text-right">آج کا خلاصہ</h3>
        <div className="grid grid-cols-2 gap-3">
          <SummaryItem
            label="Yield"
            value={`${summary.yield_percent}%`}
            color={summary.yield_percent >= 70 ? 'green' : 'amber'}
          />
          <SummaryItem
            label="مجموعی منافع"
            value={formatCurrency(summary.gross_profit)}
            color={summary.gross_profit >= 0 ? 'green' : 'red'}
          />
          <SummaryItem
            label="کل اخراجات"
            value={formatCurrency(summary.total_expenses)}
            color="gray"
          />
          <SummaryItem
            label="خالص منافع"
            value={formatCurrency(summary.net_profit)}
            color={summary.net_profit >= 0 ? 'green' : 'red'}
            large
          />
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="font-bold text-gray-700 text-right">اخراجات</h3>

        {todayExpenses.length > 0 && (
          <div className="space-y-2">
            {todayExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                <button
                  onClick={() => handleRemoveExpense(exp.id)}
                  className="text-red-400 text-lg leading-none"
                >
                  ✕
                </button>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{categoryLabels[exp.category]}</span>
                  {exp.note && <span className="text-xs text-gray-400 ml-1">({exp.note})</span>}
                </div>
                <span className="font-bold text-red-600">{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <select
            value={expForm.category}
            onChange={(e) => setExpForm((f) => ({ ...f, category: e.target.value as Expense['category'] }))}
            className="border rounded-xl px-3 py-2 text-sm"
          >
            <option value="rent">کرایہ</option>
            <option value="generator">جنریٹر</option>
            <option value="labor">مزدوری</option>
            <option value="misc">دیگر</option>
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={expForm.amount}
            onChange={(e) => setExpForm((f) => ({ ...f, amount: e.target.value }))}
            className="border rounded-xl px-3 py-2 text-sm w-28"
            placeholder="رقم"
          />
          <input
            value={expForm.note}
            onChange={(e) => setExpForm((f) => ({ ...f, note: e.target.value }))}
            className="border rounded-xl px-3 py-2 text-sm flex-1 min-w-0"
            placeholder="نوٹ"
          />
          <button
            onClick={handleAddExpense}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            + شامل
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color,
  large,
}: {
  label: string;
  value: string;
  color: 'green' | 'red' | 'amber' | 'gray';
  large?: boolean;
}) {
  const colors = {
    green: 'text-green-700',
    red: 'text-red-600',
    amber: 'text-amber-600',
    gray: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-xl p-3 text-center shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-bold ${large ? 'text-xl' : 'text-lg'} ${colors[color]}`}>{value}</p>
    </div>
  );
}
