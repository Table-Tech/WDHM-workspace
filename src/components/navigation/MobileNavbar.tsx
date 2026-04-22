'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Clock,
  Award,
  MapPin,
  BarChart3,
  MoreHorizontal,
  Gamepad2,
  Crown,
  Heart,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Taken', icon: LayoutGrid, color: 'text-purple-400', activeColor: 'text-purple-300' },
  { href: '/te-laat', label: 'Te Laat', icon: Clock, color: 'text-red-400', activeColor: 'text-red-300' },
  { href: '/badges', label: 'Badges', icon: Award, color: 'text-yellow-400', activeColor: 'text-yellow-300' },
  { href: '/stats', label: 'Stats', icon: BarChart3, color: 'text-blue-400', activeColor: 'text-blue-300' },
];

const MORE_ITEMS = [
  { href: '/map', label: 'Kaart', icon: MapPin, color: 'text-green-400' },
  { href: '/games', label: 'Games', icon: Gamepad2, color: 'text-pink-400' },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Crown, color: 'text-yellow-400' },
  { href: '/memories', label: 'Herinneringen', icon: Heart, color: 'text-pink-400' },
  { href: '/gallery', label: 'Galerij', icon: ImageIcon, color: 'text-blue-400' },
];

export function MobileNavbar() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  // Check if current path is in the more menu
  const isMoreActive = MORE_ITEMS.some((item) => pathname === item.href);

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu */}
      {showMore && (
        <div className="fixed bottom-24 left-3 right-3 z-50 md:hidden animate-scale-in">
          <div className="bg-black rounded-2xl p-4 border-2 border-zinc-700 shadow-[0_0_30px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-white">Meer opties</span>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 rounded-xl bg-zinc-900 border-2 border-zinc-700 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl transition-all border-2
                      ${isActive
                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                        : 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : item.color}`} style={{ filter: 'drop-shadow(0 0 2px currentColor)' }} />
                    <span className="text-sm font-bold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-black border-t-2 border-purple-500/30 px-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-around h-18 py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1.5 px-2 py-1 min-w-[56px]"
                >
                  <div
                    className={`
                      p-3 rounded-2xl transition-all border-2
                      ${isActive
                        ? 'bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                        : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : item.color}`} style={{ filter: 'drop-shadow(0 0 2px currentColor)' }} />
                  </div>
                  <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex flex-col items-center justify-center gap-1.5 px-2 py-1 min-w-[56px]"
            >
              <div
                className={`
                  p-3 rounded-2xl transition-all border-2
                  ${isMoreActive || showMore
                    ? 'bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]'
                    : 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'
                  }
                `}
              >
                <MoreHorizontal className={`w-6 h-6 ${isMoreActive || showMore ? 'text-white' : 'text-pink-400'}`} style={{ filter: 'drop-shadow(0 0 2px currentColor)' }} />
              </div>
              <span className={`text-[11px] font-bold ${isMoreActive || showMore ? 'text-white' : 'text-zinc-400'}`}>
                Meer
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
