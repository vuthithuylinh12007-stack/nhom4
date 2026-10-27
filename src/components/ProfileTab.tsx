import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { soundEffects } from '../services/soundEffects';
import {
  User as UserIcon,
  LogOut,
  Smartphone,
  ShieldCheck,
  Flame,
  Award,
  Sparkles,
  Info,
  Check,
  X,
  FileCode,
  Volume2,
  VolumeX,
  Star,
} from 'lucide-react';

interface ProfileTabProps {
  user: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  onUserUpdated,
  onLogout,
}) => {
  const stats = storageService.getDashboardStats();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '🧑‍🎓');
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoal || 10);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAndroidGuideModal, setShowAndroidGuideModal] = useState(false);
  const [showFirebaseInfoModal, setShowFirebaseInfoModal] = useState(false);

  const availableAvatars = ['🧑‍🎓', '🇰🇷', '🌸', '⚡', '🦊', '🐻', '🐱', '🚀', '⭐', '🍜'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storageService.updateUserProfile({
      name: name.trim(),
      avatar: selectedAvatar,
      dailyGoal: Number(dailyGoal),
    });
    if (updated) {
      onUserUpdated(updated);
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-24 pt-2 animate-in fade-in duration-200">
      {/* Profile Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm text-center relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500" />

        <div className="relative pt-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg mx-auto flex items-center justify-center text-4xl mb-3">
            {user.avatar || '🧑‍🎓'}
          </div>

          <h2 className="text-lg font-black text-slate-900 dark:text-white">{user.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>

          {user.isGuest ? (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
              Tài khoản Khách (Học thử)
            </span>
          ) : (
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
              Thành viên HanGo Chính thức
            </span>
          )}

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              {isEditing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa hồ sơ'}
            </button>
          </div>
        </div>

        {/* Profile Edit Drawer */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-left space-y-4 animate-in fade-in"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Chọn biểu tượng đại diện
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {availableAvatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition cursor-pointer shrink-0 ${
                      selectedAvatar === av
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mục tiêu học mỗi ngày (từ vựng)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setDailyGoal(goal)}
                    className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      dailyGoal === goal
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {goal} từ
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Lưu thay đổi hồ sơ
            </button>
          </form>
        )}
      </div>

      {/* Real Statistics Overview */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Thống kê học tập cá nhân
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Chuỗi liên tục:</span>
            <div className="text-lg font-black text-amber-500 mt-1 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{stats.streakDays} ngày</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Tổng từ đã thuộc:</span>
            <div className="text-lg font-black text-emerald-600 mt-1">
              {stats.learnedWords} / {stats.totalWords} từ
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Ngữ pháp hoàn thành:</span>
            <div className="text-lg font-black text-blue-600 mt-1">
              {stats.completedGrammars} / {stats.totalGrammars} bài
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">Điểm test gần nhất:</span>
            <div className="text-lg font-black text-pink-600 mt-1">
              {stats.latestQuizScore !== null ? `${stats.latestQuizScore}%` : 'Chưa có'}
            </div>
          </div>
        </div>
      </div>

      {/* Cute Achievement Badges (Bảng huy hiệu Hango PRO) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Huy hiệu học tập đạt được</span>
          </h3>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
            Mở khóa thành tích
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Badge 1 */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-2.5">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white leading-tight">Chăm chỉ</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">Chuỗi {stats.streakDays} ngày học</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center gap-2.5">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white leading-tight">Thông thái</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Thuộc {stats.learnedWords} từ vựng</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 flex items-center gap-2.5">
            <span className="text-2xl">🎮</span>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white leading-tight">Ghép từ</p>
              <p className="text-[10px] text-blue-700 dark:text-blue-400">Cao thủ hình ảnh</p>
            </div>
          </div>

          {/* Badge 4 */}
          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 flex items-center gap-2.5">
            <span className="text-2xl">🎓</span>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white leading-tight">Ngữ pháp</p>
              <p className="text-[10px] text-purple-700 dark:text-purple-400">{stats.completedGrammars} bài xong</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Options & University Presentation Guides */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        {/* Sound toggle item */}
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Âm thanh trò chơi & thông báo
              </span>
              <p className="text-[11px] text-slate-500">Bật hiệu ứng âm thanh sống động</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.toggleSound();
            }}
            className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
          >
            {soundEffects.isEnabled() ? 'Bật 🔊' : 'Tắt 🔇'}
          </button>
        </div>

        {/* Android Native & APK Guide for University Presentation */}
        <button
          onClick={() => setShowAndroidGuideModal(true)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Hướng dẫn chạy Android & Đóng gói APK
              </span>
              <p className="text-[11px] text-slate-500">
                Cài đặt PWA, xuất Capacitor APK hoặc Kotlin/Compose
              </p>
            </div>
          </div>
          <span className="text-slate-400">→</span>
        </button>

        {/* Firebase Config Info */}
        <button
          onClick={() => setShowFirebaseInfoModal(true)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Cấu hình Firebase & Đồng bộ dữ liệu
              </span>
              <p className="text-[11px] text-slate-500">
                Trạng thái lưu trữ cục bộ & thiết lập đám mây
              </p>
            </div>
          </div>
          <span className="text-slate-400">→</span>
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-xs transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Đăng xuất tài khoản</span>
      </button>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold">Xác nhận đăng xuất?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Bạn có chắc chắn muốn đăng xuất khỏi HanGo không? Toàn bộ từ vựng và tiến độ học tập
              vẫn được bảo toàn an toàn trong cơ sở dữ liệu của bạn.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  storageService.logout();
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                Đăng xuất ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Android & APK University Presentation Guide */}
      {showAndroidGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold">Hướng dẫn Chạy trên Android & Tạo APK</h3>
              </div>
              <button
                onClick={() => setShowAndroidGuideModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 max-h-[65vh] overflow-y-auto leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300">
                  1. Cài đặt trực tiếp lên điện thoại Android (PWA Chuẩn):
                </h4>
                <p className="mt-1 text-[11px]">
                  Mở ứng dụng trên trình duyệt Google Chrome trên Android, nhấn nút{' '}
                  <strong>"Cài app Android"</strong> ở thanh trên cùng hoặc chọn menu 3 chấm ⋮{' '}
                  → <strong>Cài đặt ứng dụng (Install App)</strong>. Ứng dụng sẽ xuất hiện như một
                  app độc lập không thanh địa chỉ, có icon riêng trên màn hình chính và hoạt động
                  ngoại tuyến!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
                <h4 className="font-bold text-blue-800 dark:text-blue-300">
                  2. Đóng gói ra file APK Native bằng Capacitor:
                </h4>
                <p className="mt-1 text-[11px]">
                  Để xuất file APK hoặc AAB nộp bài thuyết trình hoặc tải lên Google Play:
                </p>
                <pre className="mt-2 p-2.5 rounded-xl bg-slate-900 text-blue-200 font-mono text-[10px] overflow-x-auto">
{`npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init HanGo com.hango.app --web-dir dist
npm run build
npx cap add android
npx cap open android   # Mở trong Android Studio và nhấn Build APK`}
                </pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50">
                <h4 className="font-bold text-purple-800 dark:text-purple-300">
                  3. Kiến trúc Kotlin Jetpack Compose & Room Database:
                </h4>
                <p className="mt-1 text-[11px]">
                  Dự án HanGo được thiết kế cấu trúc dữ liệu mô phỏng hoàn toàn kiến trúc MVVM:
                  Room Database (Entities: VocabularyEntity, CategoryEntity), DataStore (Preferences),
                  và Navigation Compose. Nếu bạn muốn code phiên bản thuần 100% Kotlin Compose, toàn bộ
                  schema dữ liệu và seed data trong thư mục <code>src/types/</code> và{' '}
                  <code>src/data/</code> có thể chuyển đổi tương ứng 1-1.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidGuideModal(false)}
              className="w-full mt-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Modal: Firebase Info */}
      {showFirebaseInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Trạng thái lưu trữ dữ liệu</span>
              </h3>
              <button
                onClick={() => setShowFirebaseInfoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                ✅ <strong>Lưu trữ cục bộ an toàn:</strong> Ứng dụng hiện lưu trữ bền vững toàn bộ từ
                vựng, flashcard, điểm thi và tài khoản người dùng theo cơ chế mã hóa cục bộ phân tách
                theo UID (mỗi tài khoản có kho dữ liệu riêng).
              </p>
              <p>
                🌐 <strong>Đồng bộ Firebase Cloud:</strong> Để kích hoạt Firebase Auth & Cloud
                Firestore cho việc đồng bộ đa thiết bị trực tuyến, cấu hình Firebase project có thể
                được bật thông qua công cụ tích hợp nền tảng.
              </p>
            </div>

            <button
              onClick={() => setShowFirebaseInfoModal(false)}
              className="w-full mt-4 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
