'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useShop } from '@/hooks/useShop';
import { useT } from '@/hooks/useT';
import { supabase } from '@/lib/supabase';
import { queueOperation } from '@/lib/offline';
import { buildDailySummary, formatCurrency, getToday } from '@/lib/calculations';
import { DailyEntry as DailyEntryType, Expense } from '@/types';

interface Props { date?: string; }

export function DailyEntryForm({ date = getToday() }: Props) {
  const { selectedShop } = useShop();
  const { t } = useT();
  const { dailyEntries, upsertDailyEntry, expenses, addExpense, removeExpense, isOnline } = useStore();

  const existing = dailyEntries.find((e) => e.shop_id === selectedShop?.id && e.date === date);

  // Reverse-calculate rate from stored total cost ÷ weight (for loading existing entries)
  const existingRate =
    existing && existing.live_weight_kg > 0
      ? Math.round(existing.purchase_cost / existing.live_weight_kg)
      : 0;

  const [form, setForm] = useState({
    live_weight_kg:   existing?.live_weight_kg?.toString() || '',
    purchase_rate:    existingRate > 0 ? existingRate.toString() : '',
    meat_sold_kg:     existing?.meat_sold_kg?.toString()  || '',
    cash_collected:   existing?.cash_collected?.toString() || '',
  });

  const [expForm, setExpForm] = useState({ category: 'misc' as Expense['category'], amount: '', note: '' });
  const [savedState, setSavedState] = useState(false);

  const todayExpenses = expenses.filter((e) => e.shop_id === selectedShop?.id && e.date === date);

  useEffect(() => {
    if (existing) {
      const rate =
        existing.live_weight_kg > 0
          ? Math.round(existing.purchase_cost / existing.live_weight_kg)
          : 0;
      setForm({
        live_weight_kg: existing.live_weight_kg.toString(),
        purchase_rate:  rate > 0 ? rate.toString() : '',
        meat_sold_kg:   existing.meat_sold_kg.toString(),
        cash_collected: existing.cash_collected.toString(),
      });
    }
  }, [existing]);

  // Auto-computed total purchase cost from rate × weight
  const liveKg   = parseFloat(form.live_weight_kg) || 0;
  const rate      = parseFloat(form.purchase_rate) || 0;
  const totalCost = liveKg * rate;

  const handleSave = async () => {
    if (!selectedShop) return;
    const entry: DailyEntryType = {
      id:             existing?.id || crypto.randomUUID(),
      shop_id:        selectedShop.id,
      date,
      live_weight_kg: liveKg,
      purchase_cost:  totalCost,           // stored as total Rs
      meat_sold_kg:   parseFloat(form.meat_sold_kg)   || 0,
      cash_collected: parseFloat(form.cash_collected) || 0,
    };
    upsertDailyEntry(entry);
    if (isOnline) {
      await supabase.from('daily_entries').upsert(entry, { onConflict: 'shop_id,date' });
    } else {
      await queueOperation({ table: 'daily_entries', operation: existing ? 'update' : 'insert', data: entry });
    }
    setSavedState(true);
    setTimeout(() => setSavedState(false), 2000);
  };

  const handleAddExpense = async () => {
    if (!selectedShop || !expForm.amount) return;
    const expense: Expense = {
      id:       crypto.randomUUID(),
      shop_id:  selectedShop.id,
      date,
      category: expForm.category,
      amount:   parseFloat(expForm.amount) || 0,
      note:     expForm.note,
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
      <div className="bg-white rounded-3xl p-8 text-center" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <p className="text-gray-400 text-lg">{t('selectShop')}</p>
      </div>
    );
  }

  const previewEntry: DailyEntryType = {
    id: '', shop_id: selectedShop.id, date,
    live_weight_kg: liveKg,
    purchase_cost:  totalCost,
    meat_sold_kg:   parseFloat(form.meat_sold_kg)   || 0,
    cash_collected: parseFloat(form.cash_collected) || 0,
  };

  const summary = buildDailySummary(previewEntry, todayExpenses);

  const categoryLabels: Record<Expense['category'], string> = {
    rent: t('rent'), generator: t('generator'), labor: t('labor'), misc: t('misc'),
  };

  return (
    <div className="space-y-4">
      {/* Entry form */}
      <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <p className="font-bold text-gray-700 mb-4 text-lg">{t('dailyEntry')} — {selectedShop.name}</p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Live Weight */}
          <div className="bg-gray-50 rounded-2xl p-3">
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-2 font-medium justify-end">
              {t('liveWeight')} <span>⚖️</span>
            </label>
            <input
              type="number" inputMode="decimal"
              value={form.live_weight_kg}
              onChange={(e) => setForm((f) => ({ ...f, live_weight_kg: e.target.value }))}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xl font-bold text-gray-800"
              placeholder="0"
            />
          </div>

          {/* Purchase Rate (Rs/kg) — auto-calculates total */}
          <div className="bg-gray-50 rounded-2xl p-3">
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-2 font-medium justify-end">
              {t('purchaseRate')} <span>🛒</span>
            </label>
            <input
              type="number" inputMode="numeric"
              value={form.purchase_rate}
              onChange={(e) => setForm((f) => ({ ...f, purchase_rate: e.target.value }))}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xl font-bold text-gray-800"
              placeholder="0"
            />
          </div>

          {/* Meat Sold */}
          <div className="bg-gray-50 rounded-2xl p-3">
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-2 font-medium justify-end">
              {t('meatSold')} <span>🍗</span>
            </label>
            <input
              type="number" inputMode="decimal"
              value={form.meat_sold_kg}
              onChange={(e) => setForm((f) => ({ ...f, meat_sold_kg: e.target.value }))}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xl font-bold text-gray-800"
              placeholder="0"
            />
          </div>

          {/* Cash Collected */}
          <div className="bg-gray-50 rounded-2xl p-3">
            <label className="flex items-center gap-1 text-xs text-gray-500 mb-2 font-medium justify-end">
              {t('cashCollected')} <span>💰</span>
            </label>
            <input
              type="number" inputMode="numeric"
              value={form.cash_collected}
              onChange={(e) => setForm((f) => ({ ...f, cash_collected: e.target.value }))}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xl font-bold text-gray-800"
              placeholder="0"
            />
          </div>
        </div>

        {/* Auto-calculated total cost preview */}
        {liveKg > 0 && rate > 0 && (
          <div className="flex items-center justify-between bg-blue-50 rounded-2xl px-4 py-2.5 mb-3 border border-blue-100">
            <span className="font-bold text-blue-700">{formatCurrency(totalCost)}</span>
            <span className="text-xs text-blue-500">
              {liveKg} kg × Rs {rate} = {t('totalCostCalc')}
            </span>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white"
          style={{
            background: savedState ? '#22c55e' : 'linear-gradient(135deg, #16a34a, #15803d)',
            boxShadow: savedState ? '0 4px 12px rgba(34,197,94,0.3)' : '0 4px 12px rgba(22,163,74,0.3)',
          }}
        >
          {savedState ? t('saved') : t('save')}
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', boxShadow: '0 2px 16px rgba(22,163,74,0.08)' }}>
        <p className="font-bold text-green-800 mb-4">{t('todaySummary')}</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={t('yieldPct')} value={`${summary.yield_percent}%`} color={summary.yield_percent >= 70 ? '#16a34a' : '#d97706'} />
          <StatCard label={t('grossProfit')} value={formatCurrency(summary.gross_profit)} color={summary.gross_profit >= 0 ? '#16a34a' : '#dc2626'} />
          <StatCard label={t('totalExpenses')} value={formatCurrency(summary.total_expenses)} color="#6b7280" />
          <StatCard label={t('netProfit')} value={formatCurrency(summary.net_profit)} color={summary.net_profit >= 0 ? '#16a34a' : '#dc2626'} large />
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <p className="font-bold text-gray-700 mb-4">{t('expenses')}</p>
        {todayExpenses.length > 0 && (
          <div className="space-y-2 mb-4">
            {todayExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: '#fef2f2' }}>
                <button onClick={() => handleRemoveExpense(exp.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-700">{categoryLabels[exp.category]}</span>
                  {exp.note && <span className="text-xs text-gray-400 mr-1"> — {exp.note}</span>}
                </div>
                <span className="font-bold text-red-600">{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={expForm.category}
              onChange={(e) => setExpForm((f) => ({ ...f, category: e.target.value as Expense['category'] }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white flex-shrink-0"
            >
              <option value="rent">{t('rent')}</option>
              <option value="generator">{t('generator')}</option>
              <option value="labor">{t('labor')}</option>
              <option value="misc">{t('misc')}</option>
            </select>
            <input type="number" inputMode="numeric" value={expForm.amount}
              onChange={(e) => setExpForm((f) => ({ ...f, amount: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white w-28 font-semibold"
              placeholder={t('amount')} />
            <input value={expForm.note}
              onChange={(e) => setExpForm((f) => ({ ...f, note: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white flex-1 min-w-0"
              placeholder={t('note')} />
          </div>
          <button onClick={handleAddExpense}
            className="w-full bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm"
            style={{ boxShadow: '0 2px 8px rgba(220,38,38,0.2)' }}>
            {t('addExpense')}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-3.5 text-center" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className={`font-bold leading-tight ${large ? 'text-2xl' : 'text-lg'}`} style={{ color }}>{value}</p>
    </div>
  );
}
