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
      icon: Home,
    },
    {
      id: 'study' as MainTabType,
      label: 'Học tập',
      icon: BookOpen,
    },
    {
      id: 'games' as MainTabType,
      label: 'Trò chơi',
      icon: Gamepad2,
    },
    {
      id: 'profile' as MainTabType,
      label: 'Cá nhân',
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-colors">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active pill indicator */}
              <div
                className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/50 scale-105'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
