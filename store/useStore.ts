'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Shop, DailyEntry, Customer, UdhaarEntry, RestaurantDaily, Expense, Payment } from '@/types';
import { Lang } from '@/lib/i18n';

interface AppState {
  // Language
  lang: Lang;
  setLang: (lang: Lang) => void;

  // Selected shop
  selectedShopId: string | null;
  setSelectedShop: (id: string | null) => void;

  // Shops
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  addShop: (shop: Shop) => void;
  updateShop: (shop: Shop) => void;

  // Daily entries
  dailyEntries: DailyEntry[];
  setDailyEntries: (entries: DailyEntry[]) => void;
  upsertDailyEntry: (entry: DailyEntry) => void;

  // Expenses
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;

  // Customers
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  removeCustomer: (id: string) => void;

  // Udhaar entries
  udhaarEntries: UdhaarEntry[];
  setUdhaarEntries: (entries: UdhaarEntry[]) => void;
  addUdhaarEntry: (entry: UdhaarEntry) => void;

  // Restaurant daily
  restaurantDaily: RestaurantDaily[];
  setRestaurantDaily: (entries: RestaurantDaily[]) => void;
  addRestaurantDaily: (entry: RestaurantDaily) => void;

  // Payments
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;

  // Online status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      lang: 'ur' as Lang,
      setLang: (lang) => set({ lang }),

      selectedShopId: null,
      setSelectedShop: (id) => set({ selectedShopId: id }),

      shops: [],
      setShops: (shops) => set({ shops }),
      addShop: (shop) => set((s) => ({ shops: [...s.shops, shop] })),
      updateShop: (shop) =>
        set((s) => ({ shops: s.shops.map((sh) => (sh.id === shop.id ? shop : sh)) })),

      dailyEntries: [],
      setDailyEntries: (dailyEntries) => set({ dailyEntries }),
      upsertDailyEntry: (entry) =>
        set((s) => {
          const idx = s.dailyEntries.findIndex(
            (e) => e.shop_id === entry.shop_id && e.date === entry.date
          );
          if (idx >= 0) {
            const updated = [...s.dailyEntries];
            updated[idx] = entry;
            return { dailyEntries: updated };
          }
          return { dailyEntries: [...s.dailyEntries, entry] };
        }),

      expenses: [],
      setExpenses: (expenses) => set({ expenses }),
      addExpense: (expense) => set((s) => ({ expenses: [...s.expenses, expense] })),
      removeExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      customers: [],
      setCustomers: (customers) => set({ customers }),
      addCustomer: (customer) => set((s) => ({ customers: [...s.customers, customer] })),
      updateCustomer: (customer) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.id === customer.id ? customer : c)),
        })),
      removeCustomer: (id) =>
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),

      udhaarEntries: [],
      setUdhaarEntries: (udhaarEntries) => set({ udhaarEntries }),
      addUdhaarEntry: (entry) =>
        set((s) => ({ udhaarEntries: [...s.udhaarEntries, entry] })),

      restaurantDaily: [],
      setRestaurantDaily: (restaurantDaily) => set({ restaurantDaily }),
      addRestaurantDaily: (entry) =>
        set((s) => ({ restaurantDaily: [...s.restaurantDaily, entry] })),

      payments: [],
      setPayments: (payments) => set({ payments }),
      addPayment: (payment) => set((s) => ({ payments: [...s.payments, payment] })),

      isOnline: true,
      setIsOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: 'poultry-khata-store',
      partialize: (state) => ({
        lang: state.lang,
        selectedShopId: state.selectedShopId,
        shops: state.shops,
        dailyEntries: state.dailyEntries,
        expenses: state.expenses,
        customers: state.customers,
        udhaarEntries: state.udhaarEntries,
        restaurantDaily: state.restaurantDaily,
        payments: state.payments,
      }),
    }
  )
);
