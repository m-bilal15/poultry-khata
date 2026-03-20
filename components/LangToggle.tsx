'use client';

import { useStore } from '@/store/useStore';

export function LangToggle({ className = '' }: { className?: string }) {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);

  return (
    <button
      onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
      className={`flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 text-sm font-bold text-gray-600 transition-all hover:border-green-300 hover:text-green-700 ${className}`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
      title="Switch language"
    >
      <span className="text-base leading-none">{lang === 'ur' ? '🇬🇧' : '🇵🇰'}</span>
      <span>{lang === 'ur' ? 'English' : 'Urdu'}</span>
    </button>
  );
}
