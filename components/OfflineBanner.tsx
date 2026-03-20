'use client';

import { useStore } from '@/store/useStore';

export function OfflineBanner() {
  const isOnline = useStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium">
      آف لائن موڈ — ڈیٹا محفوظ ہو رہا ہے، انٹرنیٹ آنے پر sync ہوگا
    </div>
  );
}
