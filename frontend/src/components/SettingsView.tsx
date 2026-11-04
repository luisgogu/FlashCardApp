import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFlipMode } from '../context/FlipModeContext';
import {
  subscribeToPushNotifications,
  sendTestPushNotification,
  sendTestWordPushNotification,
} from '../services/pushService';
import {
  Trash2,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Database,
  ShieldAlert,
  Loader2,
  User,
  LogOut,
  Bell,
  Clock,
  KeyRound,
  Mail,
  Send,
  Eye,
  EyeOff,
  UserX,
  ArrowRightLeft,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  totalCardsCount: number;
  onRefresh: () => void;
}

export type SrsChannel = 'push' | 'mail' | 'push_mail';

export const SettingsView: React.FC<SettingsViewProps> = ({ totalCardsCount, onRefresh }) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { flipMode, setFlipMode } = useFlipMode();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSendingForgotEmail, setIsSendingForgotEmail] = useState(false);

  // Notification Preferences State (1 shared time + 2 independent toggles)
  const [reminderTime, setReminderTime] = useState<string>('20:00');
  const [srsReminderEnabled, setSrsReminderEnabled] = useState<boolean>(true);
  const [wordNotificationEnabled, setWordNotificationEnabled] = useState<boolean>(false);
  const [srsChannel, setSrsChannel] = useState<SrsChannel>('push');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [isTestingWordPush, setIsTestingWordPush] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Admin & Delete State
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isResettingDebug, setIsResettingDebug] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch user notification preferences on mount
  useEffect(() => {
    if (user) {
      api.getNotificationSettings()
        .then((data) => {
          setReminderTime(data.reminder_time || '20:00');
          const srsActive = Boolean(data.reminder_enabled) && data.notification_channel !== 'off';
          setSrsReminderEnabled(srsActive);
          setWordNotificationEnabled(Boolean(data.word_notification_enabled));
          if (
            data.notification_channel === 'push' ||
            data.notification_channel === 'mail' ||
            data.notification_channel === 'push_mail'
          ) {
            setSrsChannel(data.notification_channel);
          } else {
            setSrsChannel('push');
          }
        })
        .catch((err) => console.error('Error cargando ajustes de notificaciones:', err));
    }
  }, [user]);

  // Save notification preferences (1 shared time + 2 independent buttons)
  const handleSaveNotificationSettings = async () => {
    if (!user) return;
    try {
      setIsSavingSettings(true);

      const needsPushSubscription =
        wordNotificationEnabled ||
        (srsReminderEnabled && (srsChannel === 'push' || srsChannel === 'push_mail'));

      if (needsPushSubscription) {
        try {
          await subscribeToPushNotifications(reminderTime);
        } catch (pushErr: any) {
          console.warn('Advertencia de suscripción Push:', pushErr);
        }
      }

      let detectedTimezone: string | undefined;
      try {
        detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        detectedTimezone = undefined;
      }

      await api.updateNotificationSettings({
        reminder_time: reminderTime,
        reminder_enabled: srsReminderEnabled,
        word_notification_enabled: wordNotificationEnabled,
        notification_channel: srsReminderEnabled ? srsChannel : 'off',
        timezone: detectedTimezone,
      });

      showToast(t('save_notification_prefs'));
    } catch (err: any) {
      alert(err.message || 'Error al guardar las preferencias de notificación.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Send Test Push
  const handleTestPush = async () => {
    if (!user) return;
    try {
      setIsTestingPush(true);
      await subscribeToPushNotifications(reminderTime);
      const sentCount = await sendTestPushNotification();
      showToast(`Push OK! (${sentCount})`);
    } catch (err: any) {
      alert(err.message || 'Error enviando la notificación de prueba Push.');
    } finally {
      setIsTestingPush(false);
    }
  };

  // Send Test Lock-Screen Word Push
  const handleTestWordPush = async () => {
    if (!user) return;
    try {
      setIsTestingWordPush(true);
      await subscribeToPushNotifications(reminderTime);
      const res = await sendTestWordPushNotification();
      showToast(`🇪🇸 "${res.text_es}" (${res.sent_count})`);
    } catch (err: any) {
      alert(err.message || 'Error enviando la notificación de palabra.');
    } finally {
      setIsTestingWordPush(false);
    }
  };

  // Send Password Recovery Email directly from Settings
  const handleSendResetEmailFromSettings = async () => {
    if (!user?.email) return;
    try {
      setIsSendingForgotEmail(true);
      await api.requestPasswordReset(user.email, language);
      showToast(t('forgot_in_settings_sent'));
    } catch (err: any) {
      alert(err.message || t('generic_error'));
    } finally {
      setIsSendingForgotEmail(false);
    }
  };

  // Send Test Email
  const handleTestEmail = async () => {
    if (!user) return;
    try {
      setIsTestingEmail(true);
      const res = await api.sendTestEmail();
      showToast(res.message || 'Email OK!');
    } catch (err: any) {
      alert(err.message || 'Error enviando el correo de prueba.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Change Password Form
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    try {
      setIsSubmittingPassword(true);
      await api.changePassword(currentPassword, newPassword);
      showToast(t('update_password_btn'));
      setCurrentPassword('');
      setNewPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleDeleteAllCards = async () => {
    const firstConfirm = confirm(
      '⚠️ ' + t('delete_warning_notice')
    );
    if (!firstConfirm) return;

    try {
      setIsDeletingAll(true);
      const res = await api.deleteAllCards();
      showToast(`(${res.deleted_count})`);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar las tarjetas.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm(t('confirm_delete_account'))) {
      try {
        setIsDeletingAccount(true);
        await api.deleteAccount();
        logout();
      } catch (error) {
        console.error(error);
        alert(t('generic_error'));
      } finally {
        setIsDeletingAccount(false);
      }
    }
  };

  const handleResetDebug = async () => {
    if (confirm('[DEBUG] SRS reset?')) {
      try {
        setIsResettingDebug(true);
        const res = await api.resetSrsDebug();
        showToast(`[DEBUG] (${res.reset_count})`);
        onRefresh();
      } catch (error) {
        console.error(error);
        alert('Error al resetear tarjetas para depuración.');
      } finally {
        setIsResettingDebug(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 animate-fade-in pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2C2621] text-white font-medium px-4 py-2 rounded-full shadow-md text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACCOUNT CARD */}
      <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E6E0D4] flex items-center justify-center text-[#2C2621]">
              <User className="w-5 h-5 text-[#C86D51]" />
            </div>
            <div>
              {user && (
                <>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-[#2C2621]">{user.name}</h2>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md uppercase ${
                        user.is_admin
                          ? 'bg-[#C86D51]/15 text-[#C86D51] border border-[#C86D51]/30'
                          : 'bg-[#7C746A]/15 text-[#5C5549] border border-[#7C746A]/30'
                      }`}
                    >
                      {user.is_admin ? 'Admin' : 'Student'}
                    </span>
                  </div>
                  <p className="text-xs text-[#7C746A]">{user.email}</p>
                </>
              )}
            </div>
          </div>

          {user && (
            <button
              onClick={logout}
              className="p-2 text-rose-700 hover:bg-rose-50 rounded-xl transition border border-rose-200 flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout_btn')}</span>
            </button>
          )}
        </div>

        {/* Change Password Trigger Button */}
        <div className="pt-2 border-t border-[#F0EBE1]">
          <button
            type="button"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="text-xs font-bold text-[#2C2621] hover:text-[#C86D51] transition flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>{isChangingPassword ? t('cancel_change_password') : t('change_password_btn')}</span>
          </button>

          {isChangingPassword && (
            <form onSubmit={handleChangePasswordSubmit} className="mt-3 space-y-3 bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl p-3 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold text-[#2C2621] mb-1">{t('current_password_label')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D4] rounded-lg pl-3 pr-8 py-1.5 text-xs text-[#2C2621] focus:outline-none focus:border-[#C86D51]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 p-0.5 text-[#7C746A] hover:text-[#2C2621] transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 text-[#C86D51]" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2C2621] mb-1">{t('new_password_label')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder={t('min_chars')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D4] rounded-lg pl-3 pr-8 py-1.5 text-xs text-[#2C2621] focus:outline-none focus:border-[#C86D51]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 p-0.5 text-[#7C746A] hover:text-[#2C2621] transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 text-[#C86D51]" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-white rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmittingPassword ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5" />
                )}
                <span>{t('update_password_btn')}</span>
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleSendResetEmailFromSettings}
                  disabled={isSendingForgotEmail}
                  className="text-[11px] font-semibold text-[#C86D51] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {isSendingForgotEmail && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{t('forgot_in_settings_btn')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* NOTIFICATION PREFERENCES: 1 SHARED TIME + 2 INDEPENDENT BUTTONS */}
      <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#2C2621]">
          <Bell className="w-4 h-4 text-[#C86D51] shrink-0" />
          <div>
            <h3 className="text-xs font-bold leading-tight">{t('notification_channel_title')}</h3>
          </div>
        </div>

        {/* SHARED TIME PICKER ("UNA HORA") */}
        <div className="bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span className="text-xs text-[#2C2621] font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C86D51]" />
            <span>{t('reminder_time_label')}</span>
          </span>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="bg-white border border-[#E6E0D4] rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-[#2C2621] focus:outline-none focus:border-[#C86D51]"
          />
        </div>

        {/* INDEPENDENT BUTTON 1: SRS FLASHCARD GAME REMINDER */}
        <div
          className={`border rounded-xl p-3 transition space-y-2.5 ${
            srsReminderEnabled
              ? 'bg-[#FAF8F5] border-[#2C2621]'
              : 'bg-[#FAF8F5]/60 border-[#E6E0D4]'
          }`}
        >
          <button
            type="button"
            onClick={() => setSrsReminderEnabled((prev) => !prev)}
            className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
          >
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-[#2C2621]">
                {t('srs_toggle_title')}
              </span>
              <span className="block text-[10px] text-[#7C746A] leading-snug">
                {t('srs_toggle_sub')}
              </span>
            </div>

            <span
              className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                srsReminderEnabled
                  ? 'bg-[#2C2621] text-white'
                  : 'bg-[#E6E0D4] text-[#5C5549]'
              }`}
            >
              {srsReminderEnabled ? t('toggle_active') : t('toggle_inactive')}
            </span>
          </button>

          {/* CHANNEL SUB-SELECTOR WHEN BUTTON 1 IS ACTIVE */}
          {srsReminderEnabled && (
            <div className="pt-2 border-t border-[#E6E0D4] space-y-1.5 animate-fade-in">
              <span className="block text-[10px] font-semibold text-[#7C746A]">
                {t('srs_channel_label')}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSrsChannel('push')}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                    srsChannel === 'push'
                      ? 'bg-[#2C2621] border-[#2C2621] text-white'
                      : 'bg-white border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
                  }`}
                >
                  <Bell className="w-3 h-3 text-[#C86D51]" />
                  <span>{t('channel_push')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSrsChannel('mail')}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                    srsChannel === 'mail'
                      ? 'bg-[#2C2621] border-[#2C2621] text-white'
                      : 'bg-white border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
                  }`}
                >
                  <Mail className={`w-3 h-3 ${srsChannel === 'mail' ? 'text-sky-400' : 'text-sky-600'}`} />
                  <span>{t('channel_mail')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSrsChannel('push_mail')}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer ${
                    srsChannel === 'push_mail'
                      ? 'bg-[#2C2621] border-[#2C2621] text-white'
                      : 'bg-white border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#C86D51]" />
                  <span>{t('channel_push_mail')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* INDEPENDENT BUTTON 2: SPANISH WORD ON LOCK SCREEN */}
        <div
          className={`border rounded-xl p-3 transition ${
            wordNotificationEnabled
              ? 'bg-[#FAF8F5] border-[#2C2621]'
              : 'bg-[#FAF8F5]/60 border-[#E6E0D4]'
          }`}
        >
          <button
            type="button"
            onClick={() => setWordNotificationEnabled((prev) => !prev)}
            className="w-full text-left flex items-start justify-between gap-3 cursor-pointer"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#C86D51] shrink-0" />
                <span className="text-xs font-bold text-[#2C2621]">
                  {t('word_toggle_title')}
                </span>
              </div>
              <span className="block text-[10px] text-[#7C746A] leading-snug">
                {t('word_toggle_sub')}
              </span>
            </div>

            <span
              className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                wordNotificationEnabled
                  ? 'bg-[#2C2621] text-white'
                  : 'bg-[#E6E0D4] text-[#5C5549]'
              }`}
            >
              {wordNotificationEnabled ? t('toggle_active') : t('toggle_inactive')}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSaveNotificationSettings}
          disabled={isSavingSettings}
          className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs mt-2 cursor-pointer"
        >
          {isSavingSettings ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{t('save_notification_prefs')}</span>
        </button>

        {/* TEST BUTTONS */}
        <div className="space-y-2 pt-2 border-t border-[#F0EBE1]">
          <button
            type="button"
            onClick={handleTestWordPush}
            disabled={isTestingWordPush}
            className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#C86D51]/50 text-[#2C2621] rounded-xl py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isTestingWordPush ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2C2621]" />
            ) : (
              <Smartphone className="w-3.5 h-3.5 text-[#C86D51]" />
            )}
            <span>{t('test_word_push_btn')}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleTestPush}
              disabled={isTestingPush}
              className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E6E0D4] text-[#2C2621] rounded-xl py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isTestingPush ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2C2621]" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-[#C86D51]" />
              )}
              <span>{t('test_push_btn')}</span>
            </button>

            <button
              type="button"
              onClick={handleTestEmail}
              disabled={isTestingEmail}
              className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E6E0D4] text-[#2C2621] rounded-xl py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isTestingEmail ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2C2621]" />
              ) : (
                <Send className="w-3.5 h-3.5 text-sky-600" />
              )}
              <span>{t('test_email_btn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARD FLIP MODE SETTINGS */}
      <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#2C2621]">
          <ArrowRightLeft className="w-4 h-4 text-[#C86D51] shrink-0" />
          <div>
            <h3 className="text-xs font-bold leading-tight">{t('flip_mode_section_title')}</h3>
            <p className="text-[10px] text-[#7C746A] mt-0.5">{t('flip_mode_desc')}</p>
          </div>
        </div>

        {/* 2-BOX FLIP MODE SELECTOR */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* BOX 1: ENG -> ESP */}
          <div
            onClick={() => setFlipMode('en_to_es')}
            className={`cursor-pointer border rounded-xl p-3 transition flex flex-col justify-between space-y-1.5 ${
              flipMode === 'en_to_es'
                ? 'bg-[#2C2621] border-[#2C2621] text-white shadow-xs'
                : 'bg-[#FAF8F5] border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{t('flip_mode_en_es')}</span>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                flipMode === 'en_to_es' ? 'border-white bg-white' : 'border-[#A0988E]'
              }`}>
                {flipMode === 'en_to_es' && <div className="w-2 h-2 rounded-full bg-[#2C2621]" />}
              </div>
            </div>
            <span className={`block text-[9px] ${flipMode === 'en_to_es' ? 'opacity-80' : 'text-[#7C746A]'}`}>
              {t('flip_mode_en_es_sub')}
            </span>
          </div>

          {/* BOX 2: ESP -> ENG */}
          <div
            onClick={() => setFlipMode('es_to_en')}
            className={`cursor-pointer border rounded-xl p-3 transition flex flex-col justify-between space-y-1.5 ${
              flipMode === 'es_to_en'
                ? 'bg-[#2C2621] border-[#2C2621] text-white shadow-xs'
                : 'bg-[#FAF8F5] border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{t('flip_mode_es_en')}</span>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                flipMode === 'es_to_en' ? 'border-white bg-white' : 'border-[#A0988E]'
              }`}>
                {flipMode === 'es_to_en' && <div className="w-2 h-2 rounded-full bg-[#2C2621]" />}
              </div>
            </div>
            <span className={`block text-[9px] ${flipMode === 'es_to_en' ? 'opacity-80' : 'text-[#7C746A]'}`}>
              {t('flip_mode_es_en_sub')}
            </span>
          </div>
        </div>
      </div>

      {/* DANGER ZONE - DELETE ALL CARDS */}
      <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 text-red-700">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <div>
            <h3 className="text-xs font-bold leading-tight">{t('danger_zone_title')}</h3>
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs text-[#5C5549]">
            ({totalCardsCount} {t('cards_count')})
          </p>
        </div>

        <button
          type="button"
          onClick={handleDeleteAllCards}
          disabled={isDeletingAll || totalCardsCount === 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          {isDeletingAll ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>{t('delete_all_cards_btn')} ({totalCardsCount})</span>
        </button>

        <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2C2621]">{t('delete_warning_notice')}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-red-100">
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            className="w-full bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isDeletingAccount ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserX className="w-4 h-4" />
            )}
            <span>{t('delete_account_btn')}</span>
          </button>
        </div>
      </div>

      {/* DEV & DEBUG TOOLS (ADMIN ONLY) */}
      {user?.is_admin && (
        <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-[#2C2621]">
            <Bug className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold leading-tight">{t('admin_tools_title')}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDebug}
            disabled={isResettingDebug || totalCardsCount === 0}
            className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E6E0D4] text-[#2C2621] rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isResettingDebug ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#2C2621]" />
            ) : (
              <Bug className="w-4 h-4 text-amber-600" />
            )}
            <span>{t('reset_srs_btn')}</span>
          </button>
        </div>
      )}

      {/* ABOUT APP */}
      <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-xs space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#2C2621]">
          <Database className="w-4 h-4 text-[#8C5E43]" />
          <span>FlashCardApp PWA</span>
        </div>
        <div className="text-[11px] text-[#7C746A] space-y-1 pt-1 border-t border-[#F0EBE1]">
          <div className="flex justify-between">
            <span>{t('app_info_version')}</span>
            <span className="font-mono text-[#2C2621]">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>{t('app_info_db')}</span>
            <span className="font-mono text-[#2C2621]">SQLite</span>
          </div>
          <div className="flex justify-between">
            <span>{t('app_info_push')}</span>
            <span className="font-mono text-[#2C2621]">Web Push & Mail</span>
          </div>
          <div className="flex justify-between">
            <span>{t('app_info_creator')}</span>
            <span className="font-mono text-[#2C2621]">Luis González 👨‍💻</span>
          </div>
        </div>
      </div>
    </div>
  );
};
