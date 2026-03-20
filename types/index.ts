export interface Shop {
  id: string;
  name: string;
  address: string;
  user_id: string;
  created_at?: string;
}

export interface DailyEntry {
  id: string;
  shop_id: string;
  date: string; // YYYY-MM-DD
  live_weight_kg: number;
  purchase_cost: number;
  meat_sold_kg: number;
  cash_collected: number;
  created_at?: string;
  // Computed
  yield_percent?: number;
  gross_profit?: number;
}

export interface Expense {
  id: string;
  shop_id: string;
  date: string;
  category: 'rent' | 'generator' | 'labor' | 'misc';
  amount: number;
  note: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  type: 'individual' | 'restaurant';
  created_at?: string;
}

export interface UdhaarEntry {
  id: string;
  customer_id: string;
  date: string;
  debit: number;   // amount given on credit
  credit: number;  // payment received
  note: string;
  balance: number; // running balance
  created_at?: string;
}

export interface RestaurantDaily {
  id: string;
  customer_id: string;
  shop_id: string;
  date: string;
  kg: number;
  rate_per_kg: number;
  amount: number;
  created_at?: string;
}

export interface Payment {
  id: string;
  customer_id: string;
  date: string;
  amount: number;
  note: string;
  created_at?: string;
}

export interface DailySummary {
  date: string;
  shop_id: string;
  live_weight_kg: number;
  purchase_cost: number;
  meat_sold_kg: number;
  cash_collected: number;
  total_expenses: number;
  yield_percent: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
}
