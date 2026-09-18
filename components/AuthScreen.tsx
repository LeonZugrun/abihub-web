'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, Mail, Lock, User, ArrowRight, CheckCircle2, 
  Sparkles, AlertCircle, Eye, EyeOff, ShieldCheck, RefreshCw,
  Users, KeyRound, ExternalLink
} from 'lucide-react';
import { 
  registerUser, loginUser, resetPassword, 
  isSupabaseConfigured, UserProfile 
} from '../lib/supabase';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile, isNewRegistration?: boolean) => void;
  onQuickDemo: (role: 'Ersteller' | 'Schüler') => void;
  themeClasses: {
    bgApp: string;
    bgCard: string;
    bgCardElevated: string;
    border: string;
    textMain: string;
    textMuted: string;
  };
}

export default function AuthScreen({
  onAuthSuccess,
  onQuickDemo,
  themeClasses,
}: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'email_sent'>('login');
  
  // Formulardaten
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Statusmeldungen
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  // Registrierung absenden
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Bitte gib deinen vollständigen Namen ein.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(email.trim(), password, fullName.trim());
      setRegisteredEmail(email.trim());
      setPendingProfile(res.profile);

      if (res.needsEmailConfirmation) {
        setAuthMode('email_sent');
      } else {
        onAuthSuccess(res.profile, true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // Anmeldung absenden
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(email.trim(), password);
      onAuthSuccess(res.profile, false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.');
    } finally {
      setIsLoading(false);
    }
  };

  // Passwort zurücksetzen
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setRegisteredEmail(email.trim());
      setAuthMode('email_sent');
    } catch (err: any) {
      setErrorMessage(err.message || 'Konnte Wiederherstellungs-Mail nicht senden.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[var(--tw-bg-app)] text-[var(--tw-text-main)] transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        
        {/* APP-HEADER & LOGO */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/20 mb-2 border border-blue-400/30">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--tw-text-main)] flex items-center justify-center">
            AbiHub
          </h1>
          <p className="text-xs text-[var(--tw-text-muted)] font-medium max-w-xs mx-auto">
            Das Portal für deinen Abiturjahrgang: Notenrechner, Termine, News & Abizeitung
          </p>
        </div>

        {/* AUTH-KARTE */}
        <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md`}>
          
          {/* Supabase Status Banner */}
          <div className="mb-6 flex items-center justify-between px-3.5 py-2 rounded-xl text-[11px] font-semibold bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)]/60">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
              <span className="text-[var(--tw-text-muted)]">
                {isSupabaseConfigured ? 'Supabase E-Mail Auth aktiv' : 'Auth & Stufen-System bereit'}
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isSupabaseConfigured 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
            }`}>
              {isSupabaseConfigured ? 'PROD' : 'BEREIT'}
            </span>
          </div>

          {/* TAB-SWITCHER: ANMELDEN vs REGISTRIEREN */}
          {authMode !== 'email_sent' && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)]/50 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)]'
                }`}
              >
                Anmelden
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'register'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)]'
                }`}
              >
                Registrieren
              </button>
            </div>
          )}

          {/* FEHLERMELDUNG */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* ============================================================= */}
          {/* FORMULAR: ANMELDEN */}
          {/* ============================================================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1.5 uppercase tracking-wider">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine.adresse@schule.de"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-4 py-3 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] uppercase tracking-wider">
                    Passwort
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setErrorMessage(null); }}
                    className="text-[11px] font-semibold text-blue-400 hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-10 py-3 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Anmeldung läuft...
                  </>
                ) : (
                  <>
                    Anmelden <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ============================================================= */}
          {/* FORMULAR: REGISTRIEREN */}
          {/* ============================================================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1 uppercase tracking-wider">
                  Vor- & Nachname
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Leon Hillger"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1 uppercase tracking-wider">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine.adresse@schule.de"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <p className="text-[10px] text-[var(--tw-text-muted)] mt-1">
                  Hierhin wird dein Bestätigungslink geschickt.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1 uppercase tracking-wider">
                  Passwort erstellen
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1 uppercase tracking-wider">
                  Passwort wiederholen
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort bestätigen"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Registrierung läuft...
                  </>
                ) : (
                  <>
                    Konto erstellen & E-Mail bestätigen <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ============================================================= */}
          {/* FORMULAR: PASSWORT VERGESSEN */}
          {/* ============================================================= */}
          {authMode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[var(--tw-text-main)]">Passwort zurücksetzen</h3>
                <p className="text-[11px] text-[var(--tw-text-muted)] mt-1">
                  Wir senden dir einen Link per E-Mail, mit dem du ein neues Passwort festlegen kannst.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1.5 uppercase tracking-wider">
                  Deine E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@schule.de"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-4 py-3 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Reset-Link senden'}
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
                className="w-full text-center text-xs font-semibold text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)] transition pt-2"
              >
                Zurück zur Anmeldung
              </button>
            </form>
          )}

          {/* ============================================================= */}
          {/* BESTÄTIGUNGS-BILDSCHIRM (E-MAIL GESENDET) */}
          {/* ============================================================= */}
          {authMode === 'email_sent' && (
            <div className="text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                <Mail className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[var(--tw-text-main)]">
                  E-Mail gesendet!
                </h3>
                <p className="text-xs text-[var(--tw-text-muted)] mt-1.5 leading-relaxed">
                  Wir haben einen Link an <span className="text-blue-400 font-bold">{registeredEmail}</span> verschickt.
                </p>
              </div>

              <div className="bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Bestätigungsschritte:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[var(--tw-text-muted)]">
                  <li>Öffne dein Postfach (auch den Spam-Ordner prüfen).</li>
                  <li>Klicke auf den Bestätigungslink in der E-Mail.</li>
                  <li>Danach kannst du deine Stufe anlegen oder beitreten!</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (pendingProfile) {
                    onAuthSuccess(pendingProfile, true);
                  } else {
                    setAuthMode('login');
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                Weiter zum Stufen-Setup <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-xs font-semibold text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)] transition block mx-auto pt-2"
              >
                Zurück zur Anmeldung
              </button>
            </div>
          )}

          {/* ============================================================= */}
          {/* SCHNELL-TESTS (DEMO MODUS) */}
          {/* ============================================================= */}
          <div className="mt-8 pt-6 border-t border-[var(--tw-border-color)]/60 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--tw-text-muted)] mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" /> Sofortige Test-Profile
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onQuickDemo('Ersteller')}
                className="p-2.5 rounded-xl bg-[var(--tw-bg-elevated)] hover:bg-white/10 border border-[var(--tw-border-color)] text-[11px] font-bold text-[var(--tw-text-main)] transition flex flex-col items-center gap-1 group"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> Ersteller / Admin
                </div>
                <span className="text-[9px] text-[var(--tw-text-muted)]">Volle Rechte & Termine</span>
              </button>

              <button
                type="button"
                onClick={() => onQuickDemo('Schüler')}
                className="p-2.5 rounded-xl bg-[var(--tw-bg-elevated)] hover:bg-white/10 border border-[var(--tw-border-color)] text-[11px] font-bold text-[var(--tw-text-main)] transition flex flex-col items-center gap-1 group"
              >
                <div className="flex items-center gap-1 text-blue-400">
                  <Users className="w-3.5 h-3.5" /> Schüler-Profil
                </div>
                <span className="text-[9px] text-[var(--tw-text-muted)]">Noten & Beitritt</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
