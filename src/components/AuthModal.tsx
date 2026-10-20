import React, { useState } from 'react';
import { storageService } from '../services/storage';
import { User } from '../types';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register' | 'forgot'>('welcome');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password states
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Status
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setResetSuccessMessage('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = storageService.register(name, email, password);
      setLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.error || 'Đăng ký không thành công.');
      }
    }, 400);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    setTimeout(() => {
      const res = storageService.login(email, password);
      setLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.error || 'Đăng nhập thất bại.');
      }
    }, 400);
  };

  const handleGuestLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const guest = storageService.loginAsGuest();
      setLoading(false);
      onSuccess(guest);
    }, 300);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetEmail) {
      setError('Vui lòng nhập địa chỉ email đã đăng ký.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = storageService.resetPassword(resetEmail, newPassword);
      setLoading(false);
      if (res.success) {
        setResetSuccessMessage('Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      } else {
        setError(res.error || 'Không thể đặt lại mật khẩu.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 my-8 transition-all">
        {/* Brand Header Banner */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8 text-white text-center overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner mb-4">
            <span className="text-3xl font-black tracking-tight text-white">한</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight">HanGo 한국어</h1>
          <p className="text-xs text-blue-100/90 mt-1 font-medium">
            Ứng dụng học tiếng Hàn thông minh cho người Việt
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-medium backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
            <span>15 Chủ đề • Ngữ pháp • Hội thoại • AI Gemini</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Reset Success Message */}
          {resetSuccessMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Mode 1: Welcome Screen */}
          {mode === 'welcome' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Chào mừng bạn đến với HanGo!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Đăng nhập để lưu tiến độ học tập, bài thi và flashcard của bạn.
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 transition py-3.5 px-4 font-bold text-white shadow-lg shadow-blue-600/25 cursor-pointer text-sm"
              >
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setMode('register');
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200 cursor-pointer text-sm"
              >
                <span>Đăng ký tài khoản mới</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">hoặc</span>
                </div>
              </div>

              <button
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <span>🚀 Trải nghiệm ngay (Chế độ Học thử)</span>
              </button>
            </div>
          )}

          {/* Mode 2: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Đăng nhập tài khoản</h2>
                <button
                  type="button"
                  onClick={() => setMode('welcome')}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Quay lại
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu@hango.edu.vn"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setResetEmail(email);
                      setMode('forgot');
                    }}
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-3 pl-10 pr-11 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 transition py-3.5 px-4 font-bold text-white shadow-lg shadow-blue-600/25 cursor-pointer text-sm mt-2 disabled:opacity-50"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập vào HanGo'}
              </button>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('register');
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* Mode 3: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tạo tài khoản mới</h2>
                <button
                  type="button"
                  onClick={() => setMode('welcome')}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Quay lại
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@email.com"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Mật khẩu (tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-11 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-11 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 transition py-3.5 px-4 font-bold text-white shadow-lg shadow-blue-600/25 cursor-pointer text-sm mt-3 disabled:opacity-50"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất Đăng ký'}
              </button>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('login');
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          )}

          {/* Mode 4: Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Đặt lại mật khẩu</h2>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('login');
                  }}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Đăng nhập
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Nhập địa chỉ email tài khoản của bạn cùng mật khẩu mới để hệ thống cập nhật mã bảo mật.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Email đã đăng ký
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="vidu@hango.edu.vn"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 transition py-3.5 px-4 font-bold text-white shadow-lg shadow-blue-600/25 cursor-pointer text-sm disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu mới'}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Quay lại màn hình đăng nhập
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
