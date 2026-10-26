import React from 'react';
import { Home, BookOpen, Gamepad2, User } from 'lucide-react';

export type MainTabType = 'home' | 'study' | 'games' | 'profile';

interface BottomNavigationProps {
  currentTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'home' as MainTabType,
      label: 'Trang chủ',
      emoji: '🏠',
      icon: Home,
      activeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400',
      dotColor: 'bg-blue-500',
    },
    {
      id: 'study' as MainTabType,
      label: 'Học tập',
      emoji: '📚',
      icon: BookOpen,
      activeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400',
      dotColor: 'bg-purple-500',
    },
    {
      id: 'games' as MainTabType,
      label: 'Trò chơi',
      emoji: '🎮',
      icon: Gamepad2,
      activeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-500',
    },
    {
      id: 'profile' as MainTabType,
      label: 'Cá nhân',
      emoji: '🧑‍🎓',
      icon: User,
      activeColor: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400',
      dotColor: 'bg-rose-500',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-all shadow-lg shadow-blue-500/5">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer select-none group`}
              aria-label={tab.label}
            >
              {/* Active pill background */}
              <div
                className={`relative flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? `${tab.activeColor} shadow-sm scale-105 font-black`
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="text-[11px] font-black tracking-tight">{tab.label}</span>
                )}
              </div>

              {!isActive && (
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 tracking-tight">
                  {tab.label}
                </span>
              )}

              {/* Little cute dot indicator when active */}
              {isActive && (
                <span className={`w-1 h-1 rounded-full ${tab.dotColor} -mb-0.5 animate-pulse`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
