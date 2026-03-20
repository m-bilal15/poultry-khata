'use client';

import { useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { getPendingOperations, removePendingOperation } from '@/lib/offline';

export function useOfflineSync() {
  const { setIsOnline, isOnline, shops, setShops, setCustomers, setUdhaarEntries, setRestaurantDaily, setPayments } = useStore();

  const syncPending = useCallback(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!url || url.includes('placeholder')) return;
    const pending = await getPendingOperations();
    for (const op of pending) {
      try {
        if (op.operation === 'insert') {
          await supabase.from(op.table).insert(op.data);
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
    if (!url || url.includes('placeholder')) return;
    try {
      const [shopsRes, customersRes] = await Promise.all([
        supabase.from('shops').select('*').order('created_at'),
        supabase.from('customers').select('*').order('name'),
      ]);
      if (shopsRes.data) setShops(shopsRes.data);
      if (customersRes.data) setCustomers(customersRes.data);
    } catch (err) {
      console.error('Load error:', err);
    }
  }, [setShops, setCustomers]);

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
