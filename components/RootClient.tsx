'use client';

import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

export function RootClient() {
  const lang = useStore((s) => s.lang);

  useEffect(() => {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
