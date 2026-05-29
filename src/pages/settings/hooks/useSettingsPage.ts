import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  useAuthContext,
  useThemeContext,
  useCurrencyContext,
  useToastContext,
} from '@/shared/context';
import { useTransactions } from '@/pages/transactions/hooks/useTransactions';
import { useBudgets } from '@/pages/budgets/hooks/useBudgets';
import { logoutUser } from '@/services/firebase/auth';

import { NotifPrefs, PasswordForm } from '../types/settings';

// Notification preferences local storage key
const NOTIF_KEY = 'fintracker_notification_prefs';
const defaultNotifPrefs: NotifPrefs = { budgetAlerts: true, anomalyDetection: true };

// Utility to load notification preferences from local storage
function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? { ...defaultNotifPrefs, ...JSON.parse(raw) } : defaultNotifPrefs;
  } catch {
    return defaultNotifPrefs;
  }
}

export const useSettingsPage = () => {
  const { user } = useAuthContext();
  const { theme, toggleTheme } = useThemeContext();
  const { currency, setCurrency, exchangeRate, rateLoading, rateError } = useCurrencyContext();
  const { addToast } = useToastContext();
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();

  // Profile configuration state
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  
  // Avatar upload state and reference
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Security and password state
  const [pwForm, setPwForm] = useState<PasswordForm>({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Application preferences state
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(loadNotifPrefs);

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Check if the user is authenticated via email and password provider
  const isEmailProvider = user?.providerData.some((p: any) => p.providerId === 'password') ?? false;

  // Handles uploading and updating user profile picture
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid file',
        message: 'Please select an image file (JPG, PNG, WebP).',
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File too large',
        message: 'Profile picture must be under 2 MB.',
      });
      return;
    }
    
    setAvatarUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL });
      
      addToast({
        type: 'success',
        title: 'Photo updated',
        message: 'Your profile picture has been saved.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: err.message ?? 'Could not upload photo.',
      });
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  // Handles saving user display name
  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your display name has been saved.',
      });
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: e.message ?? 'Could not update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handles password changes with re-authentication
  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (pwForm.next !== pwForm.confirm) {
      addToast({
        type: 'error',
        title: 'Passwords do not match',
        message: 'New password and confirm password must match.',
      });
      return;
    }
    if (pwForm.next.length < 6) {
      addToast({
        type: 'error',
        title: 'Too short',
        message: 'Password must be at least 6 characters.',
      });
      return;
    }
    
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, pwForm.next);
      
      setPwForm({ current: '', next: '', confirm: '' });
      addToast({
        type: 'success',
        title: 'Password changed',
        message: 'Your password has been updated successfully.',
      });
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password'
          ? 'Current password is incorrect.'
          : (e.message ?? 'Could not change password.');
      addToast({
        type: 'error',
        title: 'Password change failed',
        message: msg,
      });
    } finally {
      setPwSaving(false);
    }
  };

  // Updates and persists notification preferences
  const updateNotifPref = (key: keyof NotifPrefs, value: boolean) => {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    addToast({
      type: 'success',
      title: 'Preference saved',
      message: `${key} ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  // Handles exporting user transactions to a CSV file
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      addToast({
        type: 'error',
        title: 'No data',
        message: 'No transactions to export.',
      });
      return;
    }
    const header = 'Date,Description,Category,Type,Amount';
    const rows = transactions.map(
      (t: any) => `${new Date(t.date).toLocaleDateString()},${JSON.stringify(t.description)},${t.category},${t.type},${t.amount}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinTracker_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    addToast({
      type: 'success',
      title: 'Export ready',
      message: `${transactions.length} transactions exported.`,
    });
  };

  // Handles exporting full user data to a JSON file
  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinTracker_Data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addToast({
      type: 'success',
      title: 'Export ready',
      message: 'Full data exported as JSON.',
    });
  };

  // Terminates user session
  const handleSignOut = async () => {
    await logoutUser();
    navigate('/');
  };

  // Permanently deletes the user account and data
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
      const msg = e.code === 'auth/wrong-password'
          ? 'Incorrect password.'
          : (e.message ?? 'Could not delete account.');
      addToast({ type: 'error', title: 'Deletion failed', message: msg });
      setDeleting(false);
    }
  };

  return {
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
  };
};
