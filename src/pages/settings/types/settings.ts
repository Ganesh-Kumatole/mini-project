// Types related to the Settings page and user preferences

export interface NotifPrefs {
  budgetAlerts: boolean;
  anomalyDetection: boolean;
}

export interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}
