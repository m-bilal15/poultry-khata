import { DailyEntry, Expense, DailySummary } from '@/types';

export function calculateYield(liveWeightKg: number, meatSoldKg: number): number {
  if (liveWeightKg === 0) return 0;
  return Math.round((meatSoldKg / liveWeightKg) * 100 * 10) / 10;
}

export function calculateGrossProfit(cashCollected: number, purchaseCost: number): number {
  return cashCollected - purchaseCost;
}

export function calculateNetProfit(grossProfit: number, totalExpenses: number): number {
  return grossProfit - totalExpenses;
}

export function calculateProfitMargin(netProfit: number, cashCollected: number): number {
  if (cashCollected === 0) return 0;
  return Math.round((netProfit / cashCollected) * 100 * 10) / 10;
}

export function buildDailySummary(
  entry: DailyEntry,
  expenses: Expense[]
): DailySummary {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const grossProfit = calculateGrossProfit(entry.cash_collected, entry.purchase_cost);
  const netProfit = calculateNetProfit(grossProfit, totalExpenses);
  const yieldPercent = calculateYield(entry.live_weight_kg, entry.meat_sold_kg);
  const profitMargin = calculateProfitMargin(netProfit, entry.cash_collected);

  return {
    date: entry.date,
    shop_id: entry.shop_id,
    live_weight_kg: entry.live_weight_kg,
    purchase_cost: entry.purchase_cost,
    meat_sold_kg: entry.meat_sold_kg,
    cash_collected: entry.cash_collected,
    total_expenses: totalExpenses,
    yield_percent: yieldPercent,
    gross_profit: grossProfit,
    net_profit: netProfit,
    profit_margin: profitMargin,
  };
}

export function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString('en-PK')} kg`;
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  };
}
