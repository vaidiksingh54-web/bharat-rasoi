import React, { useState } from 'react';
import { Bell, Check, LogOut, Moon, Sun } from 'lucide-react';
import {
  PageId,
  UserAccount,
  UserNotification,
  UserSettings,
} from '../types';

// ==========================================
// 1. SETTINGS PAGE
// ==========================================

interface SettingsPageProps {
  currentUser: UserAccount | null;
  settings: UserSettings;
  notifications: UserNotification[];
  onUpdateSettings: (partial: Partial<UserSettings>) => void;
  onMarkAllNotificationsRead: () => void;
  onSignOut: () => void;
  onNavigate: (page: PageId) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  settings,
  notifications,
  onUpdateSettings,
  onMarkAllNotificationsRead,
  onSignOut,
  onNavigate,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
          Kitchen Configuration
        </p>
        <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
          Account & Notification Settings
        </h1>
      </div>

      {/* Theme & Measurement Units */}
      <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-sans">
              Appearance Theme
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Choose comfortable kitchen lighting for daytime or late-evening cooking.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 dark:bg-stone-800">
            <button
              type="button"
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="pt-5 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-sans">
              Kitchen Measurement Units
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Preferred display format for liquids, grains, and spices.
            </p>
          </div>
          <select
            aria-label="Kitchen measurement units"
            value={settings.measurementSystem}
            onChange={(e) =>
              onUpdateSettings({
                measurementSystem: e.target.value as 'metric' | 'cups',
              })
            }
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
          >
            <option value="cups">Standard Cups & Spoons</option>
            <option value="metric">Metric Grams & Millilitres</option>
          </select>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
          Notification Preferences
        </h2>

        {[
          {
            key: 'dailySuggestionReminder' as const,
            label: "Today's Food Morning Menu",
            desc: 'Receive your personalized Breakfast, Lunch, Snacks, and Dinner suggestions each morning.',
          },
          {
            key: 'mealPlanReminder' as const,
            label: 'Weekly Meal Planner & Grocery Reminder',
            desc: 'Sunday evening prompt to review your weekly meal schedule and shopping list.',
          },
          {
            key: 'newRecipeAlerts' as const,
            label: 'Regional Seasonal Recipes',
            desc: 'Updates when new festive and regional Indian dishes are added.',
          },
        ].map((item) => {
          const checked = settings[item.key];
          return (
            <label
              key={item.key}
              className="flex items-start justify-between gap-4 py-2 cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {item.label}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onUpdateSettings({ [item.key]: e.target.checked })}
                className="mt-1 w-4 h-4 accent-orange-700 rounded cursor-pointer"
              />
            </label>
          );
        })}
      </section>

      {/* Recent Notifications Table View */}
      <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-700 dark:text-orange-400" />
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
              Recent Kitchen Notifications
            </h2>
          </div>
          <button
            type="button"
            onClick={onMarkAllNotificationsRead}
            className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-orange-700 cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        <ul className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
          {notifications.map((n) => (
            <li key={n.id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <p
                  className={`font-medium ${
                    n.read
                      ? 'text-stone-600 dark:text-stone-400'
                      : 'text-stone-900 dark:text-stone-100 font-semibold'
                  }`}
                >
                  {n.title}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{n.message}</p>
              </div>
              <span className="text-xs text-stone-400 tabular-nums shrink-0">
                {n.createdAt.slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Account Session */}
      <section className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-sans">
            {currentUser ? `Signed in as ${currentUser.email}` : 'Not currently signed in'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Manage your authentication session or switch to another Bharat Rasoi account.
          </p>
        </div>

        {currentUser ? (
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="px-4 py-2 rounded-lg bg-orange-700 text-white text-xs font-semibold cursor-pointer"
          >
            Sign In
          </button>
        )}
      </section>
    </div>
  );
};

// ==========================================
// 2. SEPARATE LOGIN PAGE
// ==========================================

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
  onNavigate: (page: PageId) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [email, setEmail] = useState('ananya.verma@bharatrasoi.in');
  const [password, setPassword] = useState('rasoi123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to sign in.');
      } else {
        onLoginSuccess(data.user);
      }
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    onLoginSuccess({
      id: 'user-ananya-01',
      name: 'Ananya Verma',
      email: 'ananya.verma@bharatrasoi.in',
      avatarUrl: '',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Culinary Showcase */}
      <div className="lg:col-span-5 bg-stone-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <p className="text-xs font-medium text-amber-400">Bharat Rasoi Kitchen</p>
          <h1 className="font-display text-3xl font-bold leading-tight balance-text">
            Good food, warm spices, everyday joy.
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            Sign in to access your personal cooking dashboard, saved collections, daily tailored meal menus, and grocery lists.
          </p>
        </div>

        <div className="relative z-10 mt-8 rounded-xl overflow-hidden border border-stone-700 aspect-[4/3]">
          <img
            src="/assets/aistudio/Screenshot_2026-11-03_232145_4e222cc4.png"
            alt="Authentic Indian dishes spread"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Login Form */}
      <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
              Welcome Back
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Sign in to your Bharat Rasoi account
            </p>
          </div>

          {forgotMode ? (
            <div className="p-5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-4">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-sans">
                Reset Your Password
              </h3>
              {resetSent ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Password recovery instructions sent to {email || 'your email'}.
                </p>
              ) : (
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Enter your account email above and click below to receive a reset link.
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setResetSent(true)}
                  className="px-4 py-2 rounded-lg bg-orange-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setResetSent(false);
                  }}
                  className="text-xs text-stone-600 dark:text-stone-400 hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-stone-700 dark:text-stone-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-xs font-medium text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-orange-700 rounded"
                />
                <span>Remember me on this device</span>
              </label>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-stone-200 dark:border-stone-800" />
            <span className="px-3 text-xs text-stone-400">or continue with</span>
            <div className="flex-grow border-t border-stone-200 dark:border-stone-800" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-medium text-stone-800 dark:text-stone-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-xs text-stone-600 dark:text-stone-400">
            New to Bharat Rasoi?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-semibold text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. SEPARATE REGISTER PAGE
// ==========================================

interface RegisterPageProps {
  onRegisterSuccess: (user: UserAccount) => void;
  onNavigate: (page: PageId) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigate,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in your full name, email address, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptedTerms) {
      setError('Please accept the Bharat Rasoi Terms & Privacy Policy to create your account.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        onRegisterSuccess(data.user);
      }
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Onboarding Story */}
      <div className="lg:col-span-5 bg-stone-900 text-white p-8 flex flex-col justify-between">
        <div className="space-y-4">
          <p className="text-xs font-medium text-amber-400">Join Bharat Rasoi</p>
          <h1 className="font-display text-3xl font-bold leading-tight balance-text">
            Start your personalized Indian cooking journey.
          </h1>
          <ul className="space-y-3 text-sm text-stone-300 pt-2">
            <li>• Tailored daily Breakfast, Lunch, Snacks & Dinner menus</li>
            <li>• Save favourites into custom recipe collections</li>
            <li>• Set up your spice, regional, and dietary profile right after sign-up</li>
          </ul>
        </div>

        <div className="mt-8 rounded-xl overflow-hidden border border-stone-700 aspect-[4/3]">
          <img
            src="/assets/aistudio/Screenshot_2026-11-03_232145_4e222cc4.png"
            alt="Indian dishes spread"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right Register Form */}
      <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
              Create Your Account
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              After registration, you will customize your personal cooking preferences.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reg-fullname"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="reg-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Priya Nair"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-orange-700 rounded"
              />
              <span>
                I agree to the Bharat Rasoi Terms of Service and Privacy Policy.
              </span>
            </label>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-stone-600 dark:text-stone-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-semibold text-orange-700 dark:text-orange-400 hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
