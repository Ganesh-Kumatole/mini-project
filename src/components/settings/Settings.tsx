import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency, Currency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { logoutUser } from '@/services/firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ── Primitives ────────────────────────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex-shrink-0">
      <span className="material-icons text-indigo-500 text-xl">{icon}</span>
    </div>
    <div>
      <h2 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">{title}</h2>
      {subtitle && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
    {children}
  </label>
);

const Input = ({ id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) => (
  <input
    id={id}
    {...props}
    className="w-full px-4 py-2.5 border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 focus:border-transparent transition-all disabled:opacity-50"
  />
);

const PrimaryBtn = ({ children, loading, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; className?: string }) => (
  <button
    {...props}
    disabled={props.disabled || loading}
    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading && <span className="material-icons text-base animate-spin">refresh</span>}
    {children}
  </button>
);

const Toggle = ({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const NotifRow = ({ icon, label, description, checked, onChange, id }: { icon: string; label: string; description: string; checked: boolean; onChange: (v: boolean) => void; id: string }) => (
  <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border-light dark:border-border-dark last:border-0">
    <div className="flex items-start gap-3">
      <span className="material-icons text-indigo-400 text-xl flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{label}</p>
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">{description}</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} id={id} />
  </div>
);

// ── Notification prefs (localStorage) ────────────────────────────────────────

const NOTIF_KEY = 'fintracker_notification_prefs';
const defaultNotifPrefs = { budgetAlerts: true, anomalyDetection: true };
type NotifPrefs = typeof defaultNotifPrefs;

function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? { ...defaultNotifPrefs, ...JSON.parse(raw) } : defaultNotifPrefs;
  } catch { return defaultNotifPrefs; }
}

// ── Avatar initials ───────────────────────────────────────────────────────────

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── Settings Component ────────────────────────────────────────────────────────

export const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, exchangeRate, rateLoading, rateError } = useCurrency();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();

  // ── Profile state ──
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Avatar upload ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Invalid file', message: 'Please select an image file (JPG, PNG, WebP).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: 'error', title: 'File too large', message: 'Profile picture must be under 2 MB.' });
      return;
    }
    setAvatarUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL });
      addToast({ type: 'success', title: 'Photo updated', message: 'Your profile picture has been saved.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload failed', message: err.message ?? 'Could not upload photo.' });
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  // ── Password state ──
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // ── Notification prefs state ──
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(loadNotifPrefs);

  // ── Delete account state ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isEmailProvider = user?.providerData.some(p => p.providerId === 'password') ?? false;

  // ── Profile save ──
  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      addToast({ type: 'success', title: 'Profile updated', message: 'Your display name has been saved.' });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Update failed', message: e.message ?? 'Could not update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Password change ──
  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (pwForm.next !== pwForm.confirm) {
      addToast({ type: 'error', title: 'Passwords do not match', message: 'New password and confirm password must match.' });
      return;
    }
    if (pwForm.next.length < 6) {
      addToast({ type: 'error', title: 'Too short', message: 'Password must be at least 6 characters.' });
      return;
    }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      addToast({ type: 'success', title: 'Password changed', message: 'Your password has been updated successfully.' });
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password' ? 'Current password is incorrect.' : (e.message ?? 'Could not change password.');
      addToast({ type: 'error', title: 'Password change failed', message: msg });
    } finally {
      setPwSaving(false);
    }
  };

  // ── Notification prefs persist ──
  const updateNotifPref = (key: keyof NotifPrefs, value: boolean) => {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    addToast({ type: 'success', title: 'Preference saved', message: `${key} ${value ? 'enabled' : 'disabled'}.` });
  };

  // ── CSV export ──
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      addToast({ type: 'error', title: 'No data', message: 'No transactions to export.' });
      return;
    }
    const header = 'Date,Description,Category,Type,Amount';
    const rows = transactions.map(t =>
      `${new Date(t.date).toLocaleDateString()},${JSON.stringify(t.description)},${t.category},${t.type},${t.amount}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinTracker_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Export ready', message: `${transactions.length} transactions exported.` });
  };

  // ── JSON export ──
  const handleExportJSON = () => {
    const payload = { exportedAt: new Date().toISOString(), transactions, budgets };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinTracker_Data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Export ready', message: 'Full data exported as JSON.' });
  };

  // ── Sign out ──
  const handleSignOut = async () => {
    await logoutUser();
    navigate('/');
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      if (isEmailProvider && user.email) {
        const credential = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, credential);
      }
      await deleteUser(user);
      navigate('/');
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password' ? 'Incorrect password.' : (e.message ?? 'Could not delete account.');
      addToast({ type: 'error', title: 'Deletion failed', message: msg });
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 id="settings-heading" className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
        Settings
      </h1>

      {/* ── 1. PROFILE ──────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon="person" title="Profile" subtitle="Update your display name visible across the app" />

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0 group">
            <div className="h-16 w-16 rounded-full overflow-hidden ring-2 ring-indigo-200 dark:ring-indigo-800 shadow-lg">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(user?.displayName)}
                </div>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors cursor-pointer"
              title="Change profile picture"
            >
              {avatarUploading ? (
                <span className="material-icons text-white text-lg animate-spin">refresh</span>
              ) : (
                <span className="material-icons text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity">photo_camera</span>
              )}
            </button>
            <input
              ref={avatarInputRef}
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              {user?.displayName || 'No name set'}
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{user?.email}</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
              Signed in via {user?.providerData[0]?.providerId === 'password' ? 'Email / Password' : 'Google'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <FieldLabel>Display Name</FieldLabel>
            <Input
              id="settings-display-name"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <Input id="settings-email" type="email" value={user?.email ?? ''} disabled />
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Email cannot be changed here for security reasons.
            </p>
          </div>
          <PrimaryBtn id="settings-save-profile" onClick={handleSaveProfile} loading={profileSaving}>
            Save Profile
          </PrimaryBtn>
        </div>
      </SectionCard>

      {/* ── 2. APPEARANCE ───────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon="palette" title="Appearance" subtitle="Customize the look and feel of FinTracker" />
        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">Theme</p>
        <div className="grid grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map(t => (
            <button
              key={t}
              id={`settings-theme-${t}`}
              onClick={() => { if (theme !== t) toggleTheme(); }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                theme === t
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-border-light dark:border-border-dark hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <span className="material-icons text-xl text-indigo-500">
                {t === 'light' ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark capitalize">{t}</span>
              {theme === t && (
                <span className="material-icons text-indigo-500 text-base ml-auto">check_circle</span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── 3. CURRENCY ─────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon="currency_exchange" title="Currency" subtitle="All amounts across the app update instantly" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(['INR', 'USD'] as Currency[]).map(c => (
            <button
              key={c}
              id={`settings-currency-${c.toLowerCase()}`}
              onClick={() => {
                setCurrency(c);
                addToast({ type: 'success', title: 'Currency updated', message: `Display currency set to ${c}.` });
              }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                currency === c
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-border-light dark:border-border-dark hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <span className="text-2xl">{c === 'INR' ? '₹' : '$'}</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">{c}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {c === 'INR' ? 'Indian Rupee' : 'US Dollar'}
                </p>
              </div>
              {currency === c && (
                <span className="material-icons text-indigo-500 text-base ml-auto">check_circle</span>
              )}
            </button>
          ))}
        </div>
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
          rateError
            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
            : 'bg-gray-50 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark'
        }`}>
          <span className={`material-icons text-sm ${rateLoading ? 'animate-spin' : ''}`}>
            {rateLoading ? 'refresh' : rateError ? 'warning' : 'info'}
          </span>
          {rateLoading
            ? 'Fetching live exchange rate…'
            : rateError
              ? `${rateError} — 1 USD ≈ ₹${exchangeRate?.toFixed(2)}`
              : `Live rate: 1 USD = ₹${exchangeRate?.toFixed(2)} · Updates every 6 hours`}
        </div>
      </SectionCard>

      {/* ── 4. NOTIFICATIONS ────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon="notifications" title="Notifications" subtitle="Control which alerts FinTracker sends you" />
        <div className="divide-y divide-border-light dark:divide-border-dark">
          <NotifRow
            id="notif-budget-alerts"
            icon="account_balance"
            label="Budget Alerts"
            description="Notify when a budget category reaches its threshold"
            checked={notifPrefs.budgetAlerts}
            onChange={v => updateNotifPref('budgetAlerts', v)}
          />
          <NotifRow
            id="notif-anomaly"
            icon="notifications_active"
            label="Anomaly Detection"
            description="Alert when a transaction is unusually large for its category"
            checked={notifPrefs.anomalyDetection}
            onChange={v => updateNotifPref('anomalyDetection', v)}
          />
        </div>
      </SectionCard>

      {/* ── 5. SECURITY ─────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon="lock" title="Security" subtitle="Manage your password and active session" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Account Created', value: user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '—' },
            { label: 'Last Sign-in', value: user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : '—' },
            { label: 'Sign-in Method', value: isEmailProvider ? 'Email / Password' : 'Google OAuth' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{label}</p>
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {isEmailProvider ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">Change Password</p>
            <Input
              id="settings-pw-current"
              type={showPasswords ? 'text' : 'password'}
              placeholder="Current password"
              value={pwForm.current}
              onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="settings-pw-new"
                type={showPasswords ? 'text' : 'password'}
                placeholder="New password"
                value={pwForm.next}
                onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
              />
              <Input
                id="settings-pw-confirm"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-4">
              <PrimaryBtn id="settings-change-password" onClick={handleChangePassword} loading={pwSaving}>
                Update Password
              </PrimaryBtn>
              <button
                onClick={() => setShowPasswords(s => !s)}
                className="flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-indigo-500 transition-colors"
              >
                <span className="material-icons text-sm">{showPasswords ? 'visibility_off' : 'visibility'}</span>
                {showPasswords ? 'Hide' : 'Show'} passwords
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
            <span className="material-icons text-blue-500 text-base mt-0.5">info</span>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You signed in with Google. Password management is handled by your Google account.
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── 6. DATA MANAGEMENT ──────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon="storage" title="Data Management" subtitle="Export your financial data at any time" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="settings-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-3 px-4 py-4 rounded-xl border border-border-light dark:border-border-dark hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <span className="material-icons text-2xl text-indigo-500">table_chart</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Export as CSV</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {transactions.length} transactions · spreadsheet-ready
              </p>
            </div>
            <span className="material-icons text-gray-400 group-hover:text-indigo-500 text-base ml-auto transition-colors">download</span>
          </button>
          <button
            id="settings-export-json"
            onClick={handleExportJSON}
            className="flex items-center gap-3 px-4 py-4 rounded-xl border border-border-light dark:border-border-dark hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <span className="material-icons text-2xl text-indigo-500">data_object</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">Export as JSON</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Full data · {transactions.length} transactions + {budgets.length} budgets
              </p>
            </div>
            <span className="material-icons text-gray-400 group-hover:text-indigo-500 text-base ml-auto transition-colors">download</span>
          </button>
        </div>
      </SectionCard>

      {/* ── 7. DANGER ZONE ──────────────────────────────────────────────── */}
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/40 flex-shrink-0">
            <span className="material-icons text-red-500 text-xl">dangerous</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">These actions are permanent and cannot be undone.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="settings-sign-out"
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium transition-colors"
          >
            <span className="material-icons text-base">logout</span>
            Sign Out
          </button>
          <button
            id="settings-delete-account"
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            <span className="material-icons text-base">delete_forever</span>
            Delete Account
          </button>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons text-red-500 text-2xl">warning</span>
              <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Delete Account</h3>
            </div>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
              This will permanently delete your account and all associated data (transactions, budgets, preferences). This action <strong>cannot be undone</strong>.
            </p>
            {isEmailProvider && (
              <div className="mb-3">
                <FieldLabel>Your current password</FieldLabel>
                <Input
                  id="delete-password"
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                />
              </div>
            )}
            <div className="mb-5">
              <FieldLabel>Type <strong className="text-red-500">DELETE</strong> to confirm</FieldLabel>
              <Input
                id="delete-confirm-text"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeletePassword(''); }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                id="delete-confirm-btn"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting || (isEmailProvider && !deletePassword)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting && <span className="material-icons text-base animate-spin">refresh</span>}
                {deleting ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
