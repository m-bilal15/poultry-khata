'use client';

import { useStore } from '@/store/useStore';

export function LangToggle() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);

  return (
    <button
      onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
      className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-2xl px-3 py-1.5 text-sm font-bold text-gray-600 shrink-0"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      title="Switch language / زبان تبدیل کریں"
    >
      <span className="text-base leading-none">{lang === 'ur' ? '🇬🇧' : '🇵🇰'}</span>
      <span>{lang === 'ur' ? 'EN' : 'اردو'}</span>
    </button>
  );
}
