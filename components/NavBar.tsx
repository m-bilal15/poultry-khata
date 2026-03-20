'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/hooks/useT';
import { LangToggle } from './LangToggle';
import { useStore } from '@/store/useStore';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : 'currentColor'} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function KhataIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : 'currentColor'} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
function UdhaarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : 'currentColor'} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function RestaurantIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : 'currentColor'} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
function ReportsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill={active ? '#16a34a' : 'none'} stroke={active ? '#16a34a' : 'currentColor'} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: '/',            key: 'home'        as const, Icon: HomeIcon },
  { href: '/khata',       key: 'khata'       as const, Icon: KhataIcon },
  { href: '/udhaar',      key: 'udhaar'      as const, Icon: UdhaarIcon },
  { href: '/restaurants', key: 'restaurants' as const, Icon: RestaurantIcon },
  { href: '/reports',     key: 'reports'     as const, Icon: ReportsIcon },
];

export function NavBar() {
  const pathname = usePathname();
  const { t } = useT();
  const isOnline = useStore((s) => s.isOnline);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ═══════════════════════════════════════════
          DESKTOP SIDEBAR  (md and above)
      ═══════════════════════════════════════════ */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white z-40"
        style={{ borderRight: '1px solid #ececec', boxShadow: '2px 0 20px rgba(0,0,0,0.04)' }}
      >
        {/* Brand */}
        <div className="px-5 py-6" style={{ borderBottom: '1px solid #f4f4f4' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)', boxShadow: '0 4px 14px rgba(22,163,74,0.4)' }}
            >
              🐔
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-sm leading-snug">{t('brandName')}</p>
              <p className="text-xs text-gray-400">Poultry — Lahore</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, key, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all text-sm font-semibold
                  ${active
                    ? 'bg-green-600 text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                style={active ? { boxShadow: '0 4px 12px rgba(22,163,74,0.28)' } : {}}
              >
                <Icon active={active} />
                <span>{t(key)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Online status + lang toggle */}
        <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid #f4f4f4' }}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold
              ${isOnline ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-500' : 'bg-amber-400'}`} />
            {isOnline ? 'Online' : 'Offline — saving locally'}
          </div>
          <LangToggle className="w-full justify-center" />
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM NAV  (below md)
      ═══════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50"
        style={{
          boxShadow: '0 -2px 16px rgba(0,0,0,0.09)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <div className="flex h-[58px]">
          {NAV_ITEMS.map(({ href, key, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                  ${active ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div className={`flex items-center justify-center w-9 h-7 rounded-xl transition-all ${active ? 'bg-green-50' : ''}`}>
                  <Icon active={active} />
                </div>
                <span className="text-[9px] font-bold leading-none">{t(key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
