'use client';

import { useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { getPendingOperations, removePendingOperation } from '@/lib/offline';

export function useOfflineSync() {
  const {
    setIsOnline,
    isOnline,
    setIsLoading,
    setShops,
    setCustomers,
    setDailyEntries,
    setExpenses,
    setUdhaarEntries,
    setRestaurantDaily,
    setPayments,
  } = useStore();

  const syncPending = useCallback(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!url || url.includes('placeholder')) return;
    const pending = await getPendingOperations();
    for (const op of pending) {
      try {
        if (op.operation === 'insert') {
          await supabase.from(op.table).upsert(op.data, { onConflict: 'id' });
        } else if (op.operation === 'update') {
          const { id, ...rest } = op.data as Record<string, unknown>;
          await supabase.from(op.table).update(rest).eq('id', id);
        } else if (op.operation === 'delete') {
          await supabase.from(op.table).delete().eq('id', op.data.id);
        }
        await removePendingOperation(op.id);
      } catch (err) {
        console.error('Sync error:', err);
      }
    }
  }, []);

  const loadFromSupabase = useCallback(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!url || url.includes('placeholder')) { setIsLoading(false); return; }
    try {
      const [shopsRes, customersRes, entriesRes, expensesRes, udhaarRes, restDailyRes, paymentsRes] =
        await Promise.all([
          supabase.from('shops').select('*').order('created_at'),
          supabase.from('customers').select('*').order('name'),
          supabase.from('daily_entries').select('*').order('date'),
          supabase.from('expenses').select('*').order('date'),
          supabase.from('udhaar_entries').select('*').order('date'),
          supabase.from('restaurant_daily').select('*').order('date'),
          supabase.from('payments').select('*').order('date'),
        ]);

      // Only overwrite local data when Supabase has actual records
      if (shopsRes.data && shopsRes.data.length > 0) setShops(shopsRes.data);
      if (customersRes.data && customersRes.data.length > 0) setCustomers(customersRes.data);
      if (entriesRes.data && entriesRes.data.length > 0) setDailyEntries(entriesRes.data);
      if (expensesRes.data && expensesRes.data.length > 0) setExpenses(expensesRes.data);
      if (udhaarRes.data && udhaarRes.data.length > 0) setUdhaarEntries(udhaarRes.data);
      if (restDailyRes.data && restDailyRes.data.length > 0) setRestaurantDaily(restDailyRes.data);
      if (paymentsRes.data && paymentsRes.data.length > 0) setPayments(paymentsRes.data);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setShops, setCustomers, setDailyEntries, setExpenses, setUdhaarEntries, setRestaurantDaily, setPayments]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPending().then(() => loadFromSupabase());
    };
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      syncPending().then(() => loadFromSupabase());
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPending, loadFromSupabase, setIsOnline]);

  return { isOnline };
}
