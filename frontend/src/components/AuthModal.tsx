import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Loader2, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Por favor, ingresa tu nombre');
        }
        await register(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2621]/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E6E0D4] rounded-3xl p-6 w-full max-w-sm shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#7C746A] hover:bg-[#E6E0D4]/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Selector */}
        <div className="flex bg-[#E6E0D4]/50 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'login'
                ? 'bg-white text-[#2C2621] shadow-xs'
                : 'text-[#7C746A] hover:text-[#2C2621]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'register'
                ? 'bg-white text-[#2C2621] shadow-xs'
                : 'text-[#7C746A] hover:text-[#2C2621]'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        <h2 className="text-lg font-bold text-[#2C2621] mb-1">
          {mode === 'login' ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
        </h2>
        <p className="text-xs text-[#7C746A] mb-5">
          {mode === 'login'
            ? 'Ingresa para acceder a tu colección personal de tarjetas.'
            : 'Guarda tus propias frases y sincroniza tus repasos.'}
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#2C2621] mb-1">Nombre</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7C746A] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Tu nombre o apodo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#E6E0D4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2C2621] mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7C746A] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E6E0D4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C2621] mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7C746A] absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#E6E0D4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] font-bold rounded-xl py-2.5 text-xs transition shadow-md flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span>{mode === 'login' ? 'Entrar' : 'Registrarse'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
