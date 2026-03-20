'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function OfflineSyncProvider() {
  useOfflineSync();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return null;
}
