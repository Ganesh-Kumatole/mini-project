import { Currency } from '@/shared/types/currency';
import { useSettingsPage } from '../hooks/useSettingsPage';
import {
  SectionCard,
  SectionHeader,
  FieldLabel,
  Input,
  PrimaryBtn,
  NotifRow,
  getInitials,
} from './SettingsPrimitives';

export const Settings = () => {
  const {
    user,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    exchangeRate,
    rateLoading,
    rateError,
    transactions,
    displayName,
    setDisplayName,
    profileSaving,
    avatarUploading,
    avatarInputRef,
    handleAvatarUpload,
    handleSaveProfile,
    pwForm,
    setPwForm,
    pwSaving,
    showPasswords,
    setShowPasswords,
    handleChangePassword,
    notifPrefs,
    updateNotifPref,
    handleExportCSV,
    handleExportJSON,
    handleSignOut,
    showDeleteModal,
    setShowDeleteModal,
    deleteConfirmText,
    setDeleteConfirmText,
    deletePassword,
    setDeletePassword,
    deleting,
    handleDeleteAccount,
    isEmailProvider,
  } = useSettingsPage();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1
        id="settings-heading"
        className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark"
      >
        Settings
      </h1>

      {/* User Profile Settings Section */}
      <SectionCard>
        <SectionHeader
          icon="person"
          title="Profile"
          subtitle="Update your display name visible across the app"
        />

        {/* Profile Avatar Management */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0 group">
            <div className="h-16 w-16 rounded-full overflow-hidden ring-2 ring-indigo-200 dark:ring-indigo-800 shadow-lg">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
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
                <span className="material-icons text-white text-lg animate-spin">
                  refresh
                </span>
              ) : (
                <span className="material-icons text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  photo_camera
                </span>
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
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {user?.email}
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
              Signed in via{' '}
              {user?.providerData[0]?.providerId === 'password'
                ? 'Email / Password'
                : 'Google'}
            </p>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="space-y-4">
          <div>
            <FieldLabel>Display Name</FieldLabel>
            <Input
              id="settings-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <Input
              id="settings-email"
              type="email"
              value={user?.email ?? ''}
              disabled
            />
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Email cannot be changed here for security reasons.
            </p>
          </div>
          <PrimaryBtn
            id="settings-save-profile"
            onClick={handleSaveProfile}
            loading={profileSaving}
          >
            Save Profile
          </PrimaryBtn>
        </div>
      </SectionCard>

      {/* App Appearance Preferences */}
      <SectionCard>
        <SectionHeader
          icon="palette"
          title="Appearance"
          subtitle="Customize the look and feel of FinTracker"
        />
        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
          Theme
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              id={`settings-theme-${t}`}
              onClick={() => {
                if (theme !== t) toggleTheme();
              }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                theme === t
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-border-light dark:border-border-dark hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <span className="material-icons text-xl text-indigo-500">
                {t === 'light' ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark capitalize">
                {t}
              </span>
              {theme === t && (
                <span className="material-icons text-indigo-500 text-base ml-auto">
                  check_circle
                </span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Currency Display Options */}
      <SectionCard>
        <SectionHeader
          icon="currency_exchange"
          title="Currency"
          subtitle="All amounts across the app update instantly"
        />
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(['INR', 'USD'] as Currency[]).map((c) => (
            <button
              key={c}
              id={`settings-currency-${c.toLowerCase()}`}
              onClick={() => {
                setCurrency(c);
              }}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                currency === c
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-border-light dark:border-border-dark hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <span className="text-2xl">{c === 'INR' ? '₹' : '$'}</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {c}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {c === 'INR' ? 'Indian Rupee' : 'US Dollar'}
                </p>
              </div>
              {currency === c && (
                <span className="material-icons text-indigo-500 text-base ml-auto">
                  check_circle
                </span>
              )}
            </button>
          ))}
        </div>
        <div
          className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
            rateError
              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
              : 'bg-gray-50 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark'
          }`}
        >
          <span
            className={`material-icons text-sm ${rateLoading ? 'animate-spin' : ''}`}
          >
            {rateLoading ? 'refresh' : rateError ? 'warning' : 'info'}
          </span>
          {rateLoading
            ? 'Fetching live exchange rate…'
            : rateError
              ? `${rateError} — 1 USD ≈ ₹${exchangeRate?.toFixed(2)}`
              : `Live rate: 1 USD = ₹${exchangeRate?.toFixed(2)} · Updates every 6 hours`}
        </div>
      </SectionCard>

      {/* Notifications Preferences */}
      <SectionCard>
        <SectionHeader
          icon="notifications"
          title="Notifications"
          subtitle="Control which alerts FinTracker sends you"
        />
        <div className="divide-y divide-border-light dark:divide-border-dark">
          <NotifRow
            id="notif-budget-alerts"
            icon="account_balance"
            label="Budget Alerts"
            description="Notify when a budget category reaches its threshold"
            checked={notifPrefs.budgetAlerts}
            onChange={(v) => updateNotifPref('budgetAlerts', v)}
          />
          <NotifRow
            id="notif-anomaly"
            icon="notifications_active"
            label="Anomaly Detection"
            description="Alert when a transaction is unusually large for its category"
            checked={notifPrefs.anomalyDetection}
            onChange={(v) => updateNotifPref('anomalyDetection', v)}
          />
        </div>
      </SectionCard>

      {/* Security and Password Management */}
      <SectionCard>
        <SectionHeader
          icon="lock"
          title="Security"
          subtitle="Manage your password and active session"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            {
              label: 'Account Created',
              value: user?.metadata.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : '—',
            },
            {
              label: 'Last Sign-in',
              value: user?.metadata.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                : '—',
            },
            {
              label: 'Sign-in Method',
              value: isEmailProvider ? 'Email / Password' : 'Google OAuth',
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3"
            >
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {label}
              </p>
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mt-0.5">
                {value}
              </p>
            </div>
          ))}
        </div>
        
        {/* Render password form only for email provider logins */}
        {isEmailProvider ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Change Password
            </p>
            <Input
              id="settings-pw-current"
              type={showPasswords ? 'text' : 'password'}
              placeholder="Current password"
              value={pwForm.current}
              onChange={(e) =>
                setPwForm((f) => ({ ...f, current: e.target.value }))
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="settings-pw-new"
                type={showPasswords ? 'text' : 'password'}
                placeholder="New password"
                value={pwForm.next}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, next: e.target.value }))
                }
              />
              <Input
                id="settings-pw-confirm"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={pwForm.confirm}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, confirm: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-4">
              <PrimaryBtn
                id="settings-change-password"
                onClick={handleChangePassword}
                loading={pwSaving}
              >
                Update Password
              </PrimaryBtn>
              <button
                onClick={() => setShowPasswords((s) => !s)}
                className="flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-indigo-500 transition-colors"
              >
                <span className="material-icons text-sm">
                  {showPasswords ? 'visibility_off' : 'visibility'}
                </span>
                {showPasswords ? 'Hide' : 'Show'} passwords
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
            <span className="material-icons text-blue-500 text-base mt-0.5">
              info
            </span>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You signed in with Google. Password management is handled by your
              Google account.
            </p>
          </div>
        )}
      </SectionCard>

      {/* Data Export Management */}
      <SectionCard>
        <SectionHeader
          icon="storage"
          title="Data Management"
          subtitle="Export your financial data at any time"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="settings-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-3 px-4 py-4 rounded-xl border border-border-light dark:border-border-dark hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <span className="material-icons text-2xl text-indigo-500">
              table_chart
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                Export as CSV
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {transactions.length} transactions · spreadsheet-ready
              </p>
            </div>
            <span className="material-icons text-gray-400 group-hover:text-indigo-500 text-base ml-auto transition-colors">
              download
            </span>
          </button>
          <button
            id="settings-export-json"
            onClick={handleExportJSON}
            className="flex items-center gap-3 px-4 py-4 rounded-xl border border-border-light dark:border-border-dark hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <span className="material-icons text-2xl text-indigo-500">
              data_object
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                Export as JSON
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Full backup of all app data
              </p>
            </div>
            <span className="material-icons text-gray-400 group-hover:text-indigo-500 text-base ml-auto transition-colors">
              download
            </span>
          </button>
        </div>
      </SectionCard>

      {/* Danger Zone: Session and Account Termination */}
      <div className="pt-6 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          id="settings-sign-out"
          onClick={handleSignOut}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center"
        >
          <span className="material-icons text-base">logout</span>
          Sign Out
        </button>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full sm:w-auto justify-center"
        >
          <span className="material-icons text-base">delete_forever</span>
          Delete Account
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-[slideUp_0.3s_ease_out]">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <span className="material-icons text-red-600 dark:text-red-400 text-2xl">
                  warning
                </span>
              </div>
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                Delete your account?
              </h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
                This action is <strong>permanent</strong> and cannot be undone. All your
                transactions, budgets, and settings will be wiped.
              </p>

              <div className="space-y-4">
                {isEmailProvider && (
                  <div>
                    <FieldLabel>Verify Password</FieldLabel>
                    <Input
                      id="settings-delete-password"
                      type="password"
                      placeholder="Enter your password to confirm"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <FieldLabel>
                    Type <strong>DELETE</strong> to confirm
                  </FieldLabel>
                  <Input
                    id="settings-delete-confirm"
                    type="text"
                    placeholder="DELETE"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                id="settings-delete-account-btn"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting && (
                  <span className="material-icons text-base animate-spin">
                    refresh
                  </span>
                )}
                Yes, delete my account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
