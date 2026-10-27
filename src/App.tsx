import React, { useState, useEffect } from 'react';
import { User } from './types';
import { storageService } from './services/storage';
import { Header } from './components/Header';
import { BottomNavigation, MainTabType } from './components/BottomNavigation';
import { HomeTab } from './components/HomeTab';
import { StudyTab } from './components/StudyTab';
import { GamesTab } from './components/GamesTab';
import { ProfileTab } from './components/ProfileTab';
import { AuthModal } from './components/AuthModal';
import { AddEditVocabularyModal } from './components/AddEditVocabularyModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Wifi, Battery, Signal } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<MainTabType>('home');
  const [studySubTab, setStudySubTab] = useState<string>('vocab');

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hango_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Android Phone Mockup Frame mode
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(false);

  // Global Modals
  const [isAddVocabModalOpen, setIsAddVocabModalOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('hango_dark_mode', String(darkMode));
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleTogglePhoneFrame = () => {
    setPhoneFrameMode(!phoneFrameMode);
  };

  const handleNavigate = (tab: MainTabType, subTab?: string) => {
    setCurrentTab(tab);
    if (subTab) {
      setStudySubTab(subTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-sky-50/40 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-blue-500 selection:text-white">
      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Auth Screen / Modal if not logged in */}
      {!currentUser && (
        <AuthModal
          onSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}

      {/* Main Container: Either Full Fluid or Phone Mockup */}
      <div
        className={`mx-auto transition-all ${
          phoneFrameMode
            ? 'max-w-md my-6 rounded-[44px] shadow-2xl border-[10px] border-slate-800 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 relative min-h-[850px]'
            : 'max-w-3xl min-h-screen bg-slate-50 dark:bg-slate-950 shadow-sm'
        }`}
      >
        {/* Realistic Android Phone Status Bar when in mockup mode */}
        {phoneFrameMode && (
          <div className="h-8 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between px-6 text-[11px] font-bold text-slate-800 dark:text-slate-200 select-none">
            <span>09:41</span>
            {/* Center camera notch */}
            <div className="w-16 h-3.5 bg-black rounded-full" />
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Top Header Navbar */}
        <Header
          user={currentUser}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          phoneFrameMode={phoneFrameMode}
          onTogglePhoneFrame={handleTogglePhoneFrame}
          onOpenProfile={() => setCurrentTab('profile')}
        />

        {/* Tab Contents */}
        <main className="px-4 py-3">
          {currentUser && (
            <>
              {currentTab === 'home' && (
                <HomeTab
                  user={currentUser}
                  onNavigate={handleNavigate}
                  onOpenAddModal={() => setIsAddVocabModalOpen(true)}
                />
              )}

              {currentTab === 'study' && (
                <StudyTab
                  initialSubTab={studySubTab}
                />
              )}

              {currentTab === 'games' && <GamesTab />}

              {currentTab === 'profile' && (
                <ProfileTab
                  user={currentUser}
                  onUserUpdated={(updated) => setCurrentUser(updated)}
                  onLogout={() => setCurrentUser(null)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation (5 tabs) */}
        {currentUser && (
          <BottomNavigation
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>

      {/* Global Quick Add Vocabulary Modal */}
      <AddEditVocabularyModal
        isOpen={isAddVocabModalOpen}
        onClose={() => setIsAddVocabModalOpen(false)}
        onSaved={() => {
          // Trigger any needed updates
        }}
      />
    </div>
  );
}
