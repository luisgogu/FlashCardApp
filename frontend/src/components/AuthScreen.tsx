import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Loader2, Sparkles, Layers } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar tu solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2621] flex flex-col justify-center items-center p-4 antialiased selection:bg-[#2C2621] selection:text-white">
      <div className="w-full max-w-sm space-y-6">
        {/* APP BRANDING LOGO */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#2C2621] text-[#FAF8F5] rounded-3xl mx-auto flex items-center justify-center shadow-lg border border-[#3C352E]">
            <Layers className="w-8 h-8 text-[#C86D51]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2621] tracking-tight">FlashCardApp</h1>
            <p className="text-xs text-[#7C746A] mt-1">Aprende y repasa vocabulario en contexto</p>
          </div>
        </div>

        {/* AUTH CONTAINER CARD */}
        <div className="bg-white border border-[#E6E0D4] rounded-3xl p-6 shadow-md relative">
          {/* TAB SELECTOR */}
          <div className="flex bg-[#E6E0D4]/50 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
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
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-white text-[#2C2621] shadow-xs'
                  : 'text-[#7C746A] hover:text-[#2C2621]'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <h2 className="text-base font-bold text-[#2C2621] mb-1">
            {mode === 'login' ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta'}
          </h2>
          <p className="text-xs text-[#7C746A] mb-5">
            {mode === 'login'
              ? 'Ingresa tus credenciales para acceder a tus tarjetas.'
              : 'Empieza a guardar tus frases y repasar con repetición espaciada.'}
          </p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#2C2621] mb-1">Nombre / Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre o apodo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#2C2621] mb-1">Correo Electrónico / Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C2621] mb-1">Contraseña / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7C746A] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6E0D4] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2C2621] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]/30 focus:border-[#C86D51]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2C2621] hover:bg-[#1A1613] text-[#FAF8F5] font-bold rounded-xl py-3 text-xs transition shadow-md flex items-center justify-center gap-2 mt-3"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span>{mode === 'login' ? 'Acceder a mi cuenta' : 'Crear Cuenta'}</span>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-[#A0988E] space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>Desarrollada con cariño por Luis González 👨‍💻❤️</span>
          </p>
        </div>
      </div>
    </div>
  );
};
