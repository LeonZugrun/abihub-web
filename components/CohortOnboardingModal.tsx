'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, School, KeyRound, PlusCircle, Users, 
  Sparkles, ArrowRight, Shield, CheckCircle2, AlertCircle, 
  MapPin, BookOpen, Copy, Check
} from 'lucide-react';
import { 
  Cohort, UserProfile, createNewCohort, 
  joinExistingCohort, getStoredCohorts 
} from '../lib/supabase';

interface CohortOnboardingProps {
  currentUser: UserProfile;
  onCohortConfigured: (cohort: Cohort, updatedUser: UserProfile) => void;
  themeClasses: {
    bgApp: string;
    bgCard: string;
    bgCardElevated: string;
    border: string;
    textMain: string;
    textMuted: string;
  };
}

const BUNDESLAENDER = [
  'Rheinland-Pfalz',
  'Nordrhein-Westfalen',
  'Bayern',
  'Baden-Württemberg',
  'Hessen',
  'Niedersachsen',
  'Sachsen',
  'Berlin',
  'Hamburg',
  'Schleswig-Holstein',
  'Brandenburg',
  'Thüringen',
  'Sachsen-Anhalt',
  'Mecklenburg-Vorpommern',
  'Saarland',
  'Bremen'
];

export default function CohortOnboarding({
  currentUser,
  onCohortConfigured,
  themeClasses,
}: CohortOnboardingProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  
  // Stufe erstellen Felder
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('2026');
  const [cohortName, setCohortName] = useState('');
  const [state, setState] = useState('Rheinland-Pfalz');
  const [motto, setMotto] = useState('');

  // Stufe beitreten Felder
  const [joinCode, setJoinCode] = useState('');
  const [lks, setLks] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Stufe erstellen
  const handleCreateCohort = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!school.trim()) {
      setErrorMessage('Bitte gib den Namen deiner Schule oder deines Gymnasiums an.');
      return;
    }

    try {
      const res = createNewCohort({
        school: school.trim(),
        year: year.trim() || '2026',
        name: cohortName.trim() || `Abi ${year || '2026'} – ${school.trim()}`,
        state,
        motto: motto.trim(),
      }, currentUser);

      onCohortConfigured(res.cohort, res.updatedUser);
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler beim Erstellen der Stufe.');
    }
  };

  // Stufe beitreten
  const handleJoinCohort = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!joinCode.trim()) {
      setErrorMessage('Bitte gib den Beitrittsschlüssel deiner Stufe ein.');
      return;
    }

    try {
      const res = joinExistingCohort(joinCode.trim(), lks.trim(), currentUser);
      onCohortConfigured(res.cohort, res.updatedUser);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ungültiger Beitrittsschlüssel.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[var(--tw-bg-app)] text-[var(--tw-text-main)] transition-colors duration-300">
      <div className="w-full max-w-xl space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-1">
            <School className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--tw-text-main)]">
            Willkommen, {currentUser.name}! 👋
          </h2>
          <p className="text-xs text-[var(--tw-text-muted)] max-w-md mx-auto">
            Wähle aus, wie du starten möchtest: Gründe eine neue Stufe als Organisator oder tritt deiner bestehenden Stufe bei.
          </p>
        </div>

        {/* FEHLERMELDUNG */}
        {errorMessage && (
          <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* ============================================================= */}
        {/* AUSWAHL-BILDSCHIRM (SELECT) */}
        {/* ============================================================= */}
        {mode === 'select' && (
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* KARTE 1: NEUE STUFE GRÜNDEN */}
            <div 
              onClick={() => { setMode('create'); setErrorMessage(null); }}
              className={`${themeClasses.bgCard} hover:border-amber-500/60 border ${themeClasses.border} rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Stufensprecher
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--tw-text-main)] mb-2">
                  Neue Stufe anlegen
                </h3>
                <p className="text-xs text-[var(--tw-text-muted)] leading-relaxed">
                  Gründe deinen Abiturjahrgang, verwalte Termine, lade Mitschüler per Einladungscode ein und leite die Redaktion.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--tw-border-color)]/50 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
                <span>Stufe gründen</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* KARTE 2: BESTEHENDER STUFE BEITRETEN */}
            <div 
              onClick={() => { setMode('join'); setErrorMessage(null); }}
              className={`${themeClasses.bgCard} hover:border-blue-500/60 border ${themeClasses.border} rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    Mitschüler
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--tw-text-main)] mb-2">
                  Stufe beitreten
                </h3>
                <p className="text-xs text-[var(--tw-text-muted)] leading-relaxed">
                  Gib den Beitrittsschlüssel ein, den dein Stufensprecher mit dir geteilt hat, und starte sofort mit deinem Notenrechner.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--tw-border-color)]/50 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:translate-x-1 transition">
                <span>Mit Code beitreten</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        )}

        {/* ============================================================= */}
        {/* FORMULAR: NEUE STUFE ANLEGEN */}
        {/* ============================================================= */}
        {mode === 'create' && (
          <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--tw-border-color)]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--tw-text-main)]">Neue Stufe anlegen</h3>
                  <p className="text-[11px] text-[var(--tw-text-muted)]">Du wirst automatisch Stufenleiter & Ersteller</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode('select')}
                className="text-xs font-semibold text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)]"
              >
                Zurück
              </button>
            </div>

            <form onSubmit={handleCreateCohort} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1.5 uppercase tracking-wider">
                  Name der Schule / Gymnasium *
                </label>
                <div className="relative">
                  <School className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="z. B. Albert-Einstein-Gymnasium Mainz"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-4 py-3 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1.5 uppercase tracking-wider">
                    Abiturjahrgang
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1.5 uppercase tracking-wider">
                    Bundesland
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl px-3 py-3 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-amber-500 transition"
                  >
                    {BUNDESLAENDER.map((b) => (
                      <option key={b} value={b} className="bg-slate-900 text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1.5 uppercase tracking-wider">
                  Optionales Stufenmotto
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="z. B. Abios Amigos – 12 Jahre Siesta"
                  className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Nach dem Erstellen erhältst du einen geheimen Beitrittsschlüssel für deine Stufe!</span>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-4"
              >
                Stufe jetzt gründen & Dashboard öffnen <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ============================================================= */}
        {/* FORMULAR: BESTEHENDER STUFE BEITRETEN */}
        {/* ============================================================= */}
        {mode === 'join' && (
          <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--tw-border-color)]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--tw-text-main)]">Stufe beitreten</h3>
                  <p className="text-[11px] text-[var(--tw-text-muted)]">Gib den Code von deinem Stufensprecher ein</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode('select')}
                className="text-xs font-semibold text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)]"
              >
                Zurück
              </button>
            </div>

            <form onSubmit={handleJoinCohort} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1.5 uppercase tracking-wider">
                  Stufen-Schlüssel (Beitritts-Code) *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="z. B. ABI-2026-PREMIUM"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-4 py-3 text-xs uppercase font-mono tracking-wider text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--tw-text-muted)]">
                  <span>Standard-Demostufe: <button type="button" onClick={() => setJoinCode('ABI-2026-PREMIUM')} className="text-blue-400 font-bold hover:underline">ABI-2026-PREMIUM</button></span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--tw-text-muted)] mb-1.5 uppercase tracking-wider">
                  Deine Leistungskurse (LKs)
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tw-text-muted)]" />
                  <input
                    type="text"
                    value={lks}
                    onChange={(e) => setLks(e.target.value)}
                    placeholder="z. B. Mathe, Englisch, Physik"
                    className="w-full bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl pl-10 pr-4 py-3 text-xs text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 mt-4"
              >
                Der Stufe beitreten <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
