import React from 'react';
import { User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Moon, Sun, Smartphone, Monitor, Flame, Sparkles } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  phoneFrameMode: boolean;
  onTogglePhoneFrame: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  darkMode,
  onToggleDarkMode,
  phoneFrameMode,
  onTogglePhoneFrame,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-blue-100/80 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="relative">
            <img
              src="/icon.svg"
              alt="Hango"
              className="w-10 h-10 rounded-2xl shadow-md shadow-blue-500/20 object-cover border-2 border-blue-400/40 group-hover:scale-105 transition-transform"
            />
            {/* Cute crown/star badge */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] shadow">
              ⭐
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                <span className="text-blue-600 dark:text-blue-400">Han</span>go
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-[9px] font-black shadow-2xs">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5 flex items-center gap-1">
              <span>한국어 마스터</span>
              <span className="text-blue-500">•</span>
              <span>Dễ thương & Dễ nhớ</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Streak Badge */}
          {user && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 text-xs font-black shadow-xs select-none"
              title={`Chuỗi ${user.streakDays} ngày học liên tiếp`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              <span>{user.streakDays} ngày</span>
            </div>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer select-none"
            title={darkMode ? 'Đang bật chế độ tối - Nhấn để chuyển sang sáng' : 'Đang bật chế độ sáng - Nhấn để chuyển sang tối'}
            aria-label="Chuyển đổi giao diện sáng tối"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
                <span className="text-[11px] text-amber-400 font-bold hidden sm:inline">Tối</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600/30" />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold hidden sm:inline">Sáng</span>
              </>
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Android Viewport Simulator Toggle */}
          <button
            onClick={onTogglePhoneFrame}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title={phoneFrameMode ? 'Chuyển sang giao diện toàn màn hình' : 'Xem dạng khung điện thoại Android'}
          >
            {phoneFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[11px]">Toàn màn</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[11px]">Khung Android</span>
              </>
            )}
          </button>

          {/* User Avatar Button */}
          {user && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 transition cursor-pointer select-none"
            >
              <span className="text-base leading-none">{user.avatar || '🧑‍🎓'}</span>
              <span className="text-xs font-black text-blue-800 dark:text-blue-300 max-w-[80px] truncate hidden sm:inline">
                {user.name}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
