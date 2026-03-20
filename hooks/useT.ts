'use client';

import { useStore } from '@/store/useStore';
import { tr, TKey } from '@/lib/i18n';

export function useT() {
  const lang = useStore((s) => s.lang);
  return {
    lang,
    t: (key: TKey) => tr(key, lang),
  };
}
