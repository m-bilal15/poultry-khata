'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  {
    href: '/',
    label: 'ہوم',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/khata',
    label: 'خاتہ',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/udhaar',
    label: 'ادھار',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/restaurants',
    label: 'ریسٹورنٹ',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/reports',
    label: 'رپورٹ',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : '#9ca3af'} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: '#fff', borderTop: '1px solid #f0f0f0', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
      <div className="flex justify-around items-center py-2 pb-3 max-w-lg mx-auto">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl min-w-[56px]"
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-green-50' : ''}`}>
                {icon(active)}
              </div>
              <span className={`text-xs font-semibold leading-none ${active ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
