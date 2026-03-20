'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'ہوم', icon: '🏠' },
  { href: '/khata', label: 'خاتہ', icon: '📊' },
  { href: '/udhaar', label: 'ادھار', icon: '📋' },
  { href: '/restaurants', label: 'ریسٹورنٹ', icon: '🍗' },
  { href: '/reports', label: 'رپورٹ', icon: '📈' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[56px] ${
                active ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className={`text-xs font-medium ${active ? 'text-green-600' : 'text-gray-500'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
