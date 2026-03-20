'use client';

import { useStore } from '@/store/useStore';

export function OfflineBanner() {
  const isOnline = useStore((s) => s.isOnline);
  if (isOnline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-400 text-amber-900 text-sm font-semibold py-2 px-4">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 15.536a5 5 0 01-.07-7.001M5.636 18.364a9 9 0 010-12.728" />
      </svg>
      آف لائن موڈ — ڈیٹا محفوظ ہو رہا ہے
    </div>
  );
}
