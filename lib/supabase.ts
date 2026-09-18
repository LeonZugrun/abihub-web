import { createClient } from '@supabase/supabase-js';

// Environment-Variablen für Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('dein-projekt')
);

// Supabase Client (nur initialisiert wenn Keys vorhanden sind)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    })
  : null;

// =========================================================================
// DATENTYPEN FÜR AUTH & STUFEN (COHORTS)
// =========================================================================
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'Ersteller' | 'Admin' | 'Schüler';
  avatar: string;
  quote?: string;
  cohortId?: string;
  cohortName?: string;
  schoolName?: string;
  lks?: string;
  isEmailVerified?: boolean;
}

export interface Cohort {
  id: string;
  name: string;
  school: string;
  year: string;
  state: string;
  motto?: string;
  joinCode: string;
  created_by: string;
  created_at: string;
  memberCount: number;
}

// =========================================================================
// LOCAL STORAGE KEYS FÜR PERSISTENZ & OFFLINE-FALLBACK
// =========================================================================
const STORAGE_KEY_USER = 'abihub_current_user';
const STORAGE_KEY_COHORT = 'abihub_current_cohort';
const STORAGE_KEY_ALL_COHORTS = 'abihub_all_cohorts';

// Standard-Demo-Stufe für Testzwecke
const DEFAULT_COHORT: Cohort = {
  id: 'cohort_default_2026',
  name: 'Abiturjahrgang 2026',
  school: 'Gymnasium Abi 2026',
  year: '2026',
  state: 'Rheinland-Pfalz',
  motto: 'Abios Amigos – 12 Jahre Siesta, jetzt Fiesta!',
  joinCode: 'ABI-2026-PREMIUM',
  created_by: 'system',
  created_at: '2026-01-15',
  memberCount: 5
};

export function getStoredCohorts(): Cohort[] {
  if (typeof window === 'undefined') return [DEFAULT_COHORT];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALL_COHORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ALL_COHORTS, JSON.stringify([DEFAULT_COHORT]));
      return [DEFAULT_COHORT];
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_COHORT];
  }
}

export function saveStoredCohorts(cohorts: Cohort[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ALL_COHORTS, JSON.stringify(cohorts));
}

// =========================================================================
// AUTH SERVICE METHODEN
// =========================================================================

/**
 * Registriert einen neuen Nutzer mit E-Mail und Passwort.
 * Wenn Supabase angebunden ist, triggert dies automatisch die echte
 * Bestätigungs-E-Mail von Supabase Auth!
 */
export async function registerUser(email: string, password: string, fullName: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar: '🎓',
        },
        // Nach Klick auf den E-Mail-Link wird der Nutzer zurück zur App geleitet
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      }
    });

    if (error) throw new Error(error.message);

    const userProfile: UserProfile = {
      id: data.user?.id || `user_${Date.now()}`,
      email: data.user?.email || email,
      name: fullName,
      role: 'Schüler',
      avatar: '🎓',
      isEmailVerified: data.user?.confirmed_at ? true : false,
    };

    return {
      profile: userProfile,
      needsEmailConfirmation: !data.session, // Wenn keine Session da ist, muss erst die Mail bestätigt werden
      isLiveSupabase: true
    };
  }

  // Fallback für Demo/Lokalmodus
  const mockId = `user_${Date.now()}`;
  const userProfile: UserProfile = {
    id: mockId,
    email,
    name: fullName,
    role: 'Schüler',
    avatar: '🎓',
    isEmailVerified: false,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
  }

  return {
    profile: userProfile,
    needsEmailConfirmation: true,
    isLiveSupabase: false
  };
}

/**
 * Meldet einen bestehenden Nutzer mit E-Mail und Passwort an.
 */
export async function loginUser(email: string, password: string) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);

    const userProfile: UserProfile = {
      id: data.user.id,
      email: data.user.email || email,
      name: data.user.user_metadata?.full_name || email.split('@')[0],
      role: data.user.user_metadata?.role || 'Schüler',
      avatar: data.user.user_metadata?.avatar || '🎓',
      cohortId: data.user.user_metadata?.cohort_id,
      cohortName: data.user.user_metadata?.cohort_name,
      schoolName: data.user.user_metadata?.school_name,
      isEmailVerified: Boolean(data.user.confirmed_at),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
    }

    return {
      profile: userProfile,
      isLiveSupabase: true
    };
  }

  // Fallback Demo-Login
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_USER) : null;
  let profile: UserProfile;
  if (stored) {
    profile = JSON.parse(stored);
    profile.email = email;
  } else {
    profile = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'Schüler',
      avatar: '🎓',
      isEmailVerified: true
    };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
  }

  return {
    profile,
    isLiveSupabase: false
  };
}

/**
 * Sendet eine Passwort-Zurücksetzen-E-Mail.
 */
export async function resetPassword(email: string) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
    });
    if (error) throw new Error(error.message);
    return { success: true, isLive: true };
  }
  return { success: true, isLive: false };
}

/**
 * Meldet den aktuellen Nutzer ab.
 */
export async function logoutUser() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_COHORT);
  }
}

/**
 * Erstellt eine neue Stufe (Cohort) und weist den Ersteller als 'Ersteller' zu.
 */
export function createNewCohort(data: {
  school: string;
  year: string;
  name?: string;
  state: string;
  motto?: string;
}, user: UserProfile): { cohort: Cohort; updatedUser: UserProfile } {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const joinCode = `ABI-${data.year || '2026'}-${randomSuffix}`;
  const cohortId = `cohort_${Date.now()}`;
  const cohortName = data.name || `Abiturjahrgang ${data.year || '2026'}`;

  const newCohort: Cohort = {
    id: cohortId,
    name: cohortName,
    school: data.school,
    year: data.year || '2026',
    state: data.state,
    motto: data.motto || '',
    joinCode,
    created_by: user.id,
    created_at: new Date().toISOString().split('T')[0],
    memberCount: 1
  };

  // Stufe in der Liste speichern
  const cohorts = getStoredCohorts();
  cohorts.push(newCohort);
  saveStoredCohorts(cohorts);

  // Aktualisiere Nutzer mit Rolle Ersteller
  const updatedUser: UserProfile = {
    ...user,
    role: 'Ersteller',
    cohortId: newCohort.id,
    cohortName: newCohort.name,
    schoolName: newCohort.school,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_COHORT, JSON.stringify(newCohort));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
  }

  // Falls Supabase konfiguriert ist, Update in user_metadata
  if (isSupabaseConfigured && supabase) {
    supabase.auth.updateUser({
      data: {
        role: 'Ersteller',
        cohort_id: newCohort.id,
        cohort_name: newCohort.name,
        school_name: newCohort.school,
      }
    }).catch(console.error);
  }

  return { cohort: newCohort, updatedUser };
}

/**
 * Tritt einer bestehenden Stufe anhand des Beitrittsschlüssels (Join Code) bei.
 */
export function joinExistingCohort(joinCode: string, lks: string, user: UserProfile): {
  cohort: Cohort;
  updatedUser: UserProfile;
} {
  const cleanedCode = joinCode.trim().toUpperCase();
  const cohorts = getStoredCohorts();
  
  const found = cohorts.find(c => c.joinCode.toUpperCase() === cleanedCode);
  if (!found) {
    throw new Error(`Keine Stufe mit dem Beitrittsschlüssel "${cleanedCode}" gefunden. Bitte überprüfe den Code.`);
  }

  // Member-Count hochzählen
  found.memberCount += 1;
  saveStoredCohorts(cohorts);

  const updatedUser: UserProfile = {
    ...user,
    role: 'Schüler',
    cohortId: found.id,
    cohortName: found.name,
    schoolName: found.school,
    lks: lks || user.lks,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_COHORT, JSON.stringify(found));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
  }

  if (isSupabaseConfigured && supabase) {
    supabase.auth.updateUser({
      data: {
        role: 'Schüler',
        cohort_id: found.id,
        cohort_name: found.name,
        school_name: found.school,
        lks: updatedUser.lks,
      }
    }).catch(console.error);
  }

  return { cohort: found, updatedUser };
}

/**
 * Lädt die aktuell gespeicherte Sitzung aus localStorage
 */
export function getSavedSession(): { user: UserProfile | null; cohort: Cohort | null } {
  if (typeof window === 'undefined') return { user: null, cohort: null };
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY_USER);
    const rawCohort = localStorage.getItem(STORAGE_KEY_COHORT);
    return {
      user: rawUser ? JSON.parse(rawUser) : null,
      cohort: rawCohort ? JSON.parse(rawCohort) : null,
    };
  } catch {
    return { user: null, cohort: null };
  }
}
