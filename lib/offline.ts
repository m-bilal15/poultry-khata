'use client';

import { get, set, del, keys } from 'idb-keyval';

export interface PendingOperation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  timestamp: number;
}

const PENDING_KEY = 'pending_sync';
const CACHE_PREFIX = 'cache_';

// Save data locally for offline use
export async function cacheData(key: string, data: unknown): Promise<void> {
  await set(`${CACHE_PREFIX}${key}`, data);
}

// Get cached data
export async function getCached<T>(key: string): Promise<T | undefined> {
  return get<T>(`${CACHE_PREFIX}${key}`);
}

// Queue an operation to sync later
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queueOperation(op: Omit<PendingOperation, 'id' | 'timestamp'> & { data: any }): Promise<void> {
  const pending = await getPendingOperations();
  const newOp: PendingOperation = {
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  pending.push(newOp);
  await set(PENDING_KEY, pending);
}

export async function getPendingOperations(): Promise<PendingOperation[]> {
  return (await get<PendingOperation[]>(PENDING_KEY)) || [];
}

export async function removePendingOperation(id: string): Promise<void> {
  const pending = await getPendingOperations();
  await set(PENDING_KEY, pending.filter((op) => op.id !== id));
}

export async function clearPendingOperations(): Promise<void> {
  await del(PENDING_KEY);
}

export async function hasPendingOperations(): Promise<boolean> {
  const pending = await getPendingOperations();
  return pending.length > 0;
}
