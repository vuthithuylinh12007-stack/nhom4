import React from 'react';
import { User } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Moon, Sun, Smartphone, Monitor, Flame } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-lg">
            한
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                <span className="text-blue-600 dark:text-blue-400">Han</span>Go
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
              Học tiếng Hàn thông minh
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Streak Badge */}
          {user && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-2xs select-none"
              title={`Chuỗi ${user.streakDays} ngày học liên tiếp`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              <span>{user.streakDays}</span>
            </div>
          )}

          {/* Dark / Light Mode Toggle - Nằm ngay bên phải cái chuỗi */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition active:scale-95 shadow-2xs cursor-pointer select-none"
            title={darkMode ? 'Đang bật chế độ tối - Nhấn để chuyển sang sáng' : 'Đang bật chế độ sáng - Nhấn để chuyển sang tối'}
            aria-label="Chuyển đổi giao diện sáng tối"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                <span className="text-[11px] text-amber-400 font-bold">Tối</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600/30" />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Sáng</span>
              </>
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Android Viewport Simulator Toggle */}
          <button
            onClick={onTogglePhoneFrame}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition"
            title={phoneFrameMode ? 'Chuyển sang giao diện toàn màn hình' : 'Xem dạng khung điện thoại Android'}
          >
            {phoneFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-500" />
                <span>Toàn màn hình</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                <span>Khung Android</span>
              </>
            )}
          </button>

          {/* User Avatar Button */}
          {user && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <span className="text-base">{user.avatar || '🧑‍🎓'}</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[80px] truncate hidden sm:inline">
                {user.name}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
