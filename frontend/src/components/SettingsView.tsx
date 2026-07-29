import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { subscribeToPushNotifications, sendTestPushNotification } from '../services/pushService';
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
  BellOff,
  Send
} from 'lucide-react';

interface SettingsViewProps {
  totalCardsCount: number;
  onRefresh: () => void;
}

export type NotificationChannel = 'off' | 'push' | 'mail' | 'push_mail';

export const SettingsView: React.FC<SettingsViewProps> = ({ totalCardsCount, onRefresh }) => {
  const { user, logout } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Notification Preferences State
  const [reminderTime, setReminderTime] = useState<string>('20:00');
  const [channel, setChannel] = useState<NotificationChannel>('push');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Admin & Delete State
  const [isDeletingAll, setIsDeletingAll] = useState(false);
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
          if (!data.reminder_enabled || data.notification_channel === 'off') {
            setChannel('off');
          } else {
            setChannel((data.notification_channel as NotificationChannel) || 'push');
          }
        })
        .catch((err) => console.error('Error cargando ajustes de notificaciones:', err));
    }
  }, [user]);

  // Save notification preferences
  const handleSaveNotificationSettings = async () => {
    if (!user) return;
    try {
      setIsSavingSettings(true);

      const reminder_enabled = channel !== 'off';
      const notification_channel = channel;

      // If Push is enabled in the selection, register push subscription in browser
      if (channel === 'push' || channel === 'push_mail') {
        try {
          await subscribeToPushNotifications(reminderTime);
        } catch (pushErr: any) {
          console.warn('Advertencia de suscripción Push:', pushErr);
        }
      }

      await api.updateNotificationSettings({
        reminder_time: reminderTime,
        reminder_enabled,
        notification_channel
      });

      showToast('¡Preferencias de notificación guardadas!');
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
      // Ensure current browser device is subscribed to Push first
      await subscribeToPushNotifications(reminderTime);
      const sentCount = await sendTestPushNotification();
      showToast(`¡Notificación de prueba enviada! (${sentCount} dispositivo)`);
    } catch (err: any) {
      alert(err.message || 'Error enviando la notificación de prueba Push.');
    } finally {
      setIsTestingPush(false);
    }
  };

  // Send Test Email
  const handleTestEmail = async () => {
    if (!user) return;
    try {
      setIsTestingEmail(true);
      const res = await api.sendTestEmail();
      showToast(res.message || '¡Correo de prueba enviado!');
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
      showToast('¡Contraseña actualizada con éxito!');
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
      '⚠️ ATENCIÓN / WARNING: ¿Estás seguro de que deseas eliminar TODAS las tarjetas de tu biblioteca?\n\nEsta acción NO se puede deshacer.'
    );
    if (!firstConfirm) return;

    const secondConfirm = confirm(
      '🚨 CONFIRMACIÓN FINAL / FINAL CONFIRMATION: Se borrarán permanentemente tus tarjetas y tu progreso de estudio. ¿Proceder?'
    );

    if (!secondConfirm) return;

    try {
      setIsDeletingAll(true);
      const res = await api.deleteAllCards();
      showToast(`¡Biblioteca borrada! Se eliminaron ${res.deleted_count} tarjetas.`);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar las tarjetas.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleResetDebug = async () => {
    if (confirm('[DEBUG] ¿Restablecer las fechas de repaso de tus tarjetas a "hoy"?')) {
      try {
        setIsResettingDebug(true);
        const res = await api.resetSrsDebug();
        showToast(`[DEBUG] Se reseteó el repaso de ${res.reset_count} tarjetas.`);
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
              title="Cerrar sesión / Log Out"
              className="p-2 text-rose-700 hover:bg-rose-50 rounded-xl transition border border-rose-200 flex items-center gap-1 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          )}
        </div>

        {/* Change Password Trigger Button */}
        <div className="pt-2 border-t border-[#F0EBE1]">
          <button
            type="button"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="text-xs font-bold text-[#2C2621] hover:text-[#C86D51] transition flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>{isChangingPassword ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}</span>
          </button>

          {isChangingPassword && (
            <form onSubmit={handleChangePasswordSubmit} className="mt-3 space-y-3 bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl p-3 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold text-[#2C2621] mb-1">Contraseña actual</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-1.5 text-xs text-[#2C2621] focus:outline-none focus:border-[#C86D51]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2C2621] mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="Mínimo 4 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-[#E6E0D4] rounded-lg px-3 py-1.5 text-xs text-[#2C2621] focus:outline-none focus:border-[#C86D51]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-white rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                {isSubmittingPassword ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5" />
                )}
                <span>Actualizar contraseña</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* NOTIFICATION PREFERENCES & BOX SELECTOR (PUSH / MAIL / PUSH_MAIL / OFF) */}
      <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#2C2621]">
          <Bell className="w-4 h-4 text-[#C86D51] shrink-0" />
          <div>
            <h3 className="text-xs font-bold leading-tight">Canal de notificaciones</h3>
            <p className="text-[10px] text-[#7C746A] leading-none">Notification channel selector</p>
          </div>
        </div>

        {/* 4-BOX SELECTOR */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* BOX 1: OFF */}
          <div
            onClick={() => setChannel('off')}
            className={`cursor-pointer border rounded-xl p-3 transition flex flex-col justify-between ${
              channel === 'off'
                ? 'bg-[#2C2621] border-[#2C2621] text-white shadow-xs'
                : 'bg-[#FAF8F5] border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <BellOff className={`w-4 h-4 ${channel === 'off' ? 'text-amber-400' : 'text-[#7C746A]'}`} />
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                channel === 'off' ? 'border-white bg-white' : 'border-[#A0988E]'
              }`}>
                {channel === 'off' && <div className="w-2 h-2 rounded-full bg-[#2C2621]" />}
              </div>
            </div>
            <div>
              <span className="block text-xs font-bold">Desactivado</span>
              <span className={`block text-[9px] ${channel === 'off' ? 'opacity-80' : 'text-[#7C746A]'}`}>
                Off / Sin avisos
              </span>
            </div>
          </div>

          {/* BOX 2: PUSH */}
          <div
            onClick={() => setChannel('push')}
            className={`cursor-pointer border rounded-xl p-3 transition flex flex-col justify-between ${
              channel === 'push'
                ? 'bg-[#2C2621] border-[#2C2621] text-white shadow-xs'
                : 'bg-[#FAF8F5] border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Bell className={`w-4 h-4 ${channel === 'push' ? 'text-[#C86D51]' : 'text-[#C86D51]'}`} />
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                channel === 'push' ? 'border-white bg-white' : 'border-[#A0988E]'
              }`}>
                {channel === 'push' && <div className="w-2 h-2 rounded-full bg-[#2C2621]" />}
              </div>
            </div>
            <div>
              <span className="block text-xs font-bold">Push</span>
              <span className={`block text-[9px] ${channel === 'push' ? 'opacity-80' : 'text-[#7C746A]'}`}>
                Sólo en dispositivo
              </span>
            </div>
          </div>

          {/* BOX 3: MAIL */}
          <div
            onClick={() => setChannel('mail')}
            className={`cursor-pointer border rounded-xl p-3 transition flex flex-col justify-between ${
              channel === 'mail'
                ? 'bg-[#2C2621] border-[#2C2621] text-white shadow-xs'
                : 'bg-[#FAF8F5] border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Mail className={`w-4 h-4 ${channel === 'mail' ? 'text-sky-400' : 'text-sky-600'}`} />
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                channel === 'mail' ? 'border-white bg-white' : 'border-[#A0988E]'
              }`}>
                {channel === 'mail' && <div className="w-2 h-2 rounded-full bg-[#2C2621]" />}
              </div>
            </div>
            <div>
              <span className="block text-xs font-bold">Mail</span>
              <span className={`block text-[9px] ${channel === 'mail' ? 'opacity-80' : 'text-[#7C746A]'}`}>
                Por correo electrónico
              </span>
            </div>
          </div>

          {/* BOX 4: PUSH & MAIL */}
          <div
            onClick={() => setChannel('push_mail')}
            className={`cursor-pointer border rounded-xl p-3 transition flex flex-col justify-between ${
              channel === 'push_mail'
                ? 'bg-[#2C2621] border-[#2C2621] text-white shadow-xs'
                : 'bg-[#FAF8F5] border-[#E6E0D4] text-[#2C2621] hover:border-[#C86D51]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Bell className={`w-3.5 h-3.5 ${channel === 'push_mail' ? 'text-[#C86D51]' : 'text-[#C86D51]'}`} />
                <Mail className={`w-3.5 h-3.5 ${channel === 'push_mail' ? 'text-sky-400' : 'text-sky-600'}`} />
              </div>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                channel === 'push_mail' ? 'border-white bg-white' : 'border-[#A0988E]'
              }`}>
                {channel === 'push_mail' && <div className="w-2 h-2 rounded-full bg-[#2C2621]" />}
              </div>
            </div>
            <div>
              <span className="block text-xs font-bold">Push & Mail</span>
              <span className={`block text-[9px] ${channel === 'push_mail' ? 'opacity-80' : 'text-[#7C746A]'}`}>
                Ambos canales
              </span>
            </div>
          </div>
        </div>

        {/* TIME INPUT & SAVE BUTTON */}
        {channel !== 'off' && (
          <div className="flex items-center gap-3 pt-1 animate-fade-in">
            <div className="flex-1 bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-[#7C746A] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2C2621]" />
                <span>Hora del aviso:</span>
              </span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-white border border-[#E6E0D4] rounded-lg px-2 py-1 text-xs font-mono font-bold text-[#2C2621] focus:outline-none focus:border-[#C86D51]"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveNotificationSettings}
          disabled={isSavingSettings}
          className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs mt-2"
        >
          {isSavingSettings ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>Guardar preferencias de notificación</span>
        </button>

        {/* TEST BUTTONS */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0EBE1]">
          <button
            type="button"
            onClick={handleTestPush}
            disabled={isTestingPush}
            className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E6E0D4] text-[#2C2621] rounded-xl py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            {isTestingPush ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2C2621]" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-[#C86D51]" />
            )}
            <span>Probar Push</span>
          </button>

          <button
            type="button"
            onClick={handleTestEmail}
            disabled={isTestingEmail}
            className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E6E0D4] text-[#2C2621] rounded-xl py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            {isTestingEmail ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2C2621]" />
            ) : (
              <Send className="w-3.5 h-3.5 text-sky-600" />
            )}
            <span>Probar Email</span>
          </button>
        </div>
      </div>

      {/* DANGER ZONE - DELETE ALL CARDS */}
      <div className="bg-white border border-red-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 text-red-700">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <div>
            <h3 className="text-xs font-bold leading-tight">Zona de peligro</h3>
            <p className="text-[10px] text-red-500 leading-none">Danger zone</p>
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs text-[#5C5549]">
            Actualmente tienes <span className="font-bold text-[#2C2621]">{totalCardsCount} tarjetas</span> guardadas en tu biblioteca.
          </p>
          <p className="text-[11px] text-[#8C8479]">
            You currently have <span className="font-bold text-[#2C2621]">{totalCardsCount} cards</span> saved in your library.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDeleteAllCards}
          disabled={isDeletingAll || totalCardsCount === 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
        >
          {isDeletingAll ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>Eliminar todas mis tarjetas ({totalCardsCount})</span>
        </button>

        <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#2C2621]">Al eliminar las tarjetas se borrarán permanentemente sus datos y progreso.</p>
            <p className="text-[10px] text-amber-900/70 font-normal">Deleting cards will permanently remove their data and study progress.</p>
          </div>
        </div>
      </div>

      {/* DEV & DEBUG TOOLS (ADMIN ONLY) */}
      {user?.is_admin && (
        <div className="bg-white border border-[#E6E0D4] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 text-[#2C2621]">
            <Bug className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-xs font-bold leading-tight">Herramientas de administrador</h3>
              <p className="text-[10px] text-[#7C746A] leading-none">Admin & dev tools</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDebug}
            disabled={isResettingDebug || totalCardsCount === 0}
            className="w-full bg-[#FAF8F5] hover:bg-[#F5F2EB] border border-[#E6E0D4] text-[#2C2621] rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            {isResettingDebug ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#2C2621]" />
            ) : (
              <Bug className="w-4 h-4 text-amber-600" />
            )}
            <span>Resetear repasos SRS (Dev Debug)</span>
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
            <span>Versión / Version:</span>
            <span className="font-mono text-[#2C2621]">1.0.0 (Fase 6 Push & Auth)</span>
          </div>
          <div className="flex justify-between">
            <span>Base de datos / DB:</span>
            <span className="font-mono text-[#2C2621]">SQLite (flashcardapp.db)</span>
          </div>
          <div className="flex justify-between">
            <span>Notificaciones / Push:</span>
            <span className="font-mono text-[#2C2621]">Web Push, Email & APScheduler</span>
          </div>
          <div className="flex justify-between">
            <span>Creador & Desarrollador:</span>
            <span className="font-mono text-[#2C2621]">Luis González 👨‍💻</span>
          </div>
        </div>
      </div>
    </div>
  );
};
