'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, GraduationCap, BookOpen, CalendarDays, Settings,
  Plus, ThumbsUp, Bookmark, Trash2, AlertTriangle, Check, User, Shield,
  Sparkles, MapPin, Image as ImageIcon, Download, Upload, Users, LogOut,
  ChevronRight, Calendar, Clock, Edit2, Key, Mail, Lock, Camera, Palette, Moon, Sun, Monitor, Leaf, FileText, Info, CheckCircle2, UserPlus, MoreVertical, MessageSquare
} from 'lucide-react';

// =========================================================================
// DATENMODELLE
// =========================================================================
interface SubjectGrade {
  id: string;
  name: string;
  isLk: boolean;
  examType: 'Keins' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  q1: number | '';
  q2: number | '';
  q3: number | '';
  q4: number | '';
  exam: number | '';
}

interface Post {
  id: number;
  author: string;
  authorRole: string;
  avatar: string;
  content: string;
  imageUrl?: string;
  category: string;
  votesCount: number;
  votedUserIds: string[];
  isSelectedForPrint: boolean;
  date: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  category: 'Klausur' | 'Frist' | 'Event' | 'Treffen';
  notes?: string;
}

interface NewsMessage {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  isImportant: boolean;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Schüler' | 'Ersteller' | 'Admin';
  avatar: string;
  lks: string;
  isPending: boolean;
}

// =========================================================================
// HAUPT-APP
// =========================================================================
export default function AbiHubApp() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'grades' | 'events' | 'yearbook' | 'settings' | 'members'>('dashboard');
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);

  // Benutzer & Einstellungen
  const [userName, setUserName] = useState<string>('Leon Hillger');
  const [userRole, setUserRole] = useState<'Ersteller' | 'Admin' | 'Schüler'>('Ersteller');
  const [userAvatar, setUserAvatar] = useState<string>('🎓');
  const [userEmail, setUserEmail] = useState<string>('stufensprecher@abi2026.de');
  const [userQuote, setUserQuote] = useState<string>('„Nicht für die Schule, für das Abi lernen wir!“');
  
  const [appMode, setAppMode] = useState<'dark' | 'light' | 'system' | 'sellerie'>('dark');
  const [accentColor, setAccentColor] = useState<string>('blue');

  const [joinKey] = useState<string>('ABI-2026-PREMIUM');

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // =========================================================================
  // STATE: NOTEN
  // =========================================================================
  const [subjects, setSubjects] = useState<SubjectGrade[]>([
    { id: '1', name: 'Englisch', isLk: true, examType: 'P2', q1: 11, q2: 12, q3: 13, q4: 11, exam: 12 },
    { id: '2', name: 'Informatik', isLk: true, examType: 'P3', q1: 14, q2: 13, q3: 15, q4: 14, exam: 14 },
    { id: '3', name: 'Mathematik', isLk: true, examType: 'P1', q1: 12, q2: 11, q3: 13, q4: 12, exam: 13 },
    { id: '4', name: 'Deutsch', isLk: false, examType: 'P4', q1: 10, q2: 11, q3: 11, q4: 10, exam: 11 },
    { id: '5', name: 'Geschichte', isLk: false, examType: 'Keins', q1: 12, q2: 12, q3: 13, q4: 12, exam: '' },
    { id: '6', name: 'Physik', isLk: false, examType: 'P5', q1: 13, q2: 14, q3: 13, q4: 14, exam: 13 },
    { id: '7', name: 'Sport', isLk: false, examType: 'Keins', q1: 15, q2: 14, q3: 15, q4: 15, exam: '' },
  ]);

  const [editingSubject, setEditingSubject] = useState<SubjectGrade | null>(null);
  const [isAddModal, setIsAddModal] = useState(false);

  // =========================================================================
  // STATE: TERMINE & NEWS
  // =========================================================================
  const [eventsTab, setEventsTab] = useState<'calendar' | 'news'>('calendar');
  const [eventFilter, setEventFilter] = useState<'Alle Termine' | 'Prüfungen' | 'Events & Ball' | 'Fristen'>('Alle Termine');
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Abgabe der Abizeitung-Steckbriefe', date: '2026-09-07', location: 'Online Redaktions-Portal', category: 'Frist', notes: 'Bitte alle Umfragen ausfüllen!' },
    { id: '2', title: 'Jahrgangstreffen: Motto & Abistreich', date: '2026-09-12', location: 'Aula am Campus', category: 'Treffen', notes: 'Abstimmung über die Mottotage.' },
    { id: '3', title: 'Letzte Klausur vor den Osterferien', date: '2026-09-24', location: 'Raum 302', category: 'Klausur', notes: 'Qualifikationsphase schließt.' },
  ]);

  const [news, setNews] = useState<NewsMessage[]>([
    { id: '1', title: 'Wichtig: Termine für die mündlichen Prüfungen stehen fest!', content: 'Liebe Stufe, die Prüfungspläne für das 4. und 5. Prüfungsfach hängen ab morgen im Schaukasten neben dem Oberstufenbüro aus. Bitte kontrolliert eure Zeiten.', author: 'Leon Hillger (Stufensprecher)', date: '02. September 2026, 13:33 Uhr', isImportant: true },
    { id: '2', title: 'Abizeitung Zitatesammlung läuft heiß!', content: 'Denkt daran: Die besten Lehrerzitate und lustigsten Pannen können direkt auf unserer Pinnwand gevotet werden. Die Top-Zitate schaffen es auf die Doppelseite!', author: 'Sophie Wagner (Zeitungskomitee)', date: '02. September 2026, 13:33 Uhr', isImportant: false },
  ]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({ category: 'Klausur', date: new Date().toISOString().split('T')[0], time: '09:00' });
  const [newNews, setNewNews] = useState<Partial<NewsMessage>>({ isImportant: false });

  // =========================================================================
  // STATE: ABIZEITUNG
  // =========================================================================
  const [posts, setPosts] = useState<Post[]>([
    { id: 1, author: 'Herr Dr. Weber (Physik LK)', authorRole: 'Admin', avatar: 'H', content: '„Wenn Sie hier durchfallen, ist das keine Tragödie für mich – das ist Thermodynamik: Entropie nimmt immer zu.“', category: 'Zitate', votesCount: 42, votedUserIds: ['user_me'], isSelectedForPrint: true, date: 'Gestern' },
    { id: 2, author: 'Frau Becker (Geschichte)', authorRole: 'Admin', avatar: 'F', content: '„Im Mittelalter gab es kein WLAN, aber dafür hatten die Leute damals noch Respekt vor Fristen!“', category: 'Zitate', votesCount: 37, votedUserIds: [], isSelectedForPrint: true, date: 'Vorgestern' },
  ]);

  const [ybFilter, setYbFilter] = useState<'Alle Beiträge' | 'Mit Fotos' | 'Nur Text'>('Alle Beiträge');
  const [ybOnlyPrint, setYbOnlyPrint] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempQuote, setTempQuote] = useState(userQuote);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [newPost, setNewPost] = useState<{content: string, author: string, withTime: boolean}>({content: '', author: 'Leon Hillger', withTime: false});

  // =========================================================================
  // STATE: MITGLIEDER (MEMBERS)
  // =========================================================================
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Jonas Weber', email: 'jonas.weber@schule.de', role: 'Schüler', avatar: '🎓', lks: 'Physik, Mathematik', isPending: true },
    { id: '2', name: 'Felix Neumann', email: 'felix.n@schule.de', role: 'Schüler', avatar: '🎓', lks: 'Geschichte, Englisch', isPending: false },
    { id: '3', name: 'Lena Becker', email: 'lena.b@schule.de', role: 'Schüler', avatar: '🎓', lks: 'Deutsch, Pädagogik', isPending: false },
    { id: '4', name: 'Leon Hillger', email: 'stufensprecher@abi2026.de', role: 'Ersteller', avatar: '🎓', lks: 'Mathe, Physik, Englisch', isPending: false },
  ]);

  const pendingMembers = members.filter(m => m.isPending);
  const activeMembers = members.filter(m => !m.isPending);

  // =========================================================================
  // BERECHNUNGEN (NOTENRECHNER)
  // =========================================================================
  const mss = useMemo(() => {
    let block1 = 0;
    let block2 = 0;
    let lks = 0;
    let deficits = 0;

    subjects.forEach(s => {
      const qGrades = [s.q1, s.q2, s.q3, s.q4].map(g => typeof g === 'number' ? g : 0);
      qGrades.forEach(g => {
        if (g > 0) {
          block1 += s.isLk ? g * 2 : g;
          if (g < 5) deficits++;
        }
      });
      if (s.isLk) lks++;
      if (typeof s.exam === 'number' && s.examType !== 'Keins') {
        block2 += s.exam * 4;
      }
    });

    const totalPoints = block1 + block2;
    let grade = "1.0";
    if (totalPoints >= 823) grade = "1.0";
    else if (totalPoints <= 300) grade = "4.0";
    else grade = Math.max(1.0, Math.min(4.0, (17 / 3) - (totalPoints / 180))).toFixed(1);

    const averagePoints = (totalPoints / (40 + 20)).toFixed(2);

    return { block1, block2, totalPoints, grade, averagePoints, deficits, maxDeficits: 7 };
  }, [subjects]);

  // =========================================================================
  // THEME & COLORS
  // =========================================================================
  
  const themeClasses = {
    bgApp: 'bg-[var(--tw-bg-app)]',
    bgCard: 'bg-[var(--tw-bg-card)]',
    bgCardElevated: 'bg-[var(--tw-bg-elevated)]',
    border: 'border-[var(--tw-border-color)]',
    textMain: 'text-[var(--tw-text-main)]',
    textMuted: 'text-[var(--tw-text-muted)]',
  };

  const getThemeVars = () => {
    if (appMode === 'sellerie') return {
      '--tw-bg-app': '#021206',
      '--tw-bg-card': '#05210e',
      '--tw-bg-elevated': '#0a3016',
      '--tw-border-color': '#165c2a',
      '--tw-text-main': '#bbf7d0',
      '--tw-text-muted': '#4ade80'
    };
    
    if (appMode === 'light') {
      const palettesLight = {
        blue: { app: '#f8fafc', card: '#ffffff', elevated: '#f1f5f9', border: '#e2e8f0' },
        red: { app: '#fef2f2', card: '#ffffff', elevated: '#fee2e2', border: '#fecaca' },
        purple: { app: '#faf5ff', card: '#ffffff', elevated: '#f3e8ff', border: '#e9d5ff' },
        orange: { app: '#fff7ed', card: '#ffffff', elevated: '#ffedd5', border: '#fed7aa' },
        green: { app: '#ecfdf5', card: '#ffffff', elevated: '#d1fae5', border: '#a7f3d0' },
        pink: { app: '#fdf2f8', card: '#ffffff', elevated: '#fce7f3', border: '#fbcfe8' }
      };
      const pL = (palettesLight as any)[accentColor] || palettesLight.blue;
      return {
        '--tw-bg-app': pL.app,
        '--tw-bg-card': pL.card,
        '--tw-bg-elevated': pL.elevated,
        '--tw-border-color': pL.border,
        '--tw-text-main': '#0f172a',
        '--tw-text-muted': '#64748b'
      };
    }
    
    // Dark mode (default)
    const palettesDark = {
      blue: { app: '#060913', card: '#0E1524', elevated: '#151E32', border: '#1E293B' },
      red: { app: '#120505', card: '#1f0909', elevated: '#2c1111', border: '#3b1818' },
      purple: { app: '#0b0512', card: '#13091f', elevated: '#1d112c', border: '#29183b' },
      orange: { app: '#120805', card: '#1f0d09', elevated: '#2c1511', border: '#3b1f18' },
      green: { app: '#05120a', card: '#091f11', elevated: '#112c1a', border: '#183b25' },
      pink: { app: '#12050c', card: '#1f0916', elevated: '#2c1121', border: '#3b182d' }
    };
    const pD = (palettesDark as any)[accentColor] || palettesDark.blue;
    return {
      '--tw-bg-app': pD.app,
      '--tw-bg-card': pD.card,
      '--tw-bg-elevated': pD.elevated,
      '--tw-border-color': pD.border,
      '--tw-text-main': '#F8FAFC',
      '--tw-text-muted': '#94A3B8'
    };
  };

  const effectiveAccent = appMode === 'sellerie' ? 'green' : accentColor;
  
  const accentConfigs = {
    blue: { base: 'bg-blue-600 text-blue-500 border-blue-500', grad: 'from-blue-500 to-blue-600', textLight: 'text-blue-100', textDark: 'text-blue-600' },
    red: { base: 'bg-red-600 text-red-500 border-red-500', grad: 'from-red-500 to-red-600', textLight: 'text-red-100', textDark: 'text-red-600' },
    purple: { base: 'bg-purple-600 text-purple-500 border-purple-500', grad: 'from-purple-500 to-purple-600', textLight: 'text-purple-100', textDark: 'text-purple-600' },
    orange: { base: 'bg-orange-500 text-orange-500 border-orange-500', grad: 'from-orange-500 to-orange-600', textLight: 'text-orange-100', textDark: 'text-orange-600' },
    green: { base: 'bg-emerald-600 text-emerald-500 border-emerald-500', grad: 'from-emerald-500 to-emerald-600', textLight: 'text-emerald-100', textDark: 'text-emerald-600' },
    pink: { base: 'bg-pink-600 text-pink-500 border-pink-500', grad: 'from-pink-500 to-pink-600', textLight: 'text-pink-100', textDark: 'text-pink-600' },
  };

  const currentAccentConfig = (accentConfigs as any)[effectiveAccent] || accentConfigs.blue;
  const accentClasses = currentAccentConfig.base;
  const accentBg = accentClasses.split(' ')[0];
  const accentText = accentClasses.split(' ')[1];

  const accentBorder = accentClasses.split(' ')[2];

  // =========================================================================
  // UI KOMPONENTEN
  // =========================================================================
  const TopAppBar = () => {
    let title = "AbiHub";
    if (currentView === 'grades') title = "Notenrechner";
    if (currentView === 'events') title = "Termine & News";
    if (currentView === 'yearbook') title = "Abizeitung Pinnwand";
    if (currentView === 'settings') title = "Einstellungen";
    if (currentView === 'members') title = "Stufenliste & Beitritte";

    return (
      <header className={`fixed top-0 inset-x-0 h-16 ${themeClasses.bgApp}/90 backdrop-blur-md z-40 border-b ${themeClasses.border} flex items-center justify-between px-4`}>
        <div>
          <h1 className="text-[17px] font-bold text-[var(--tw-text-main)] tracking-wide">{title}</h1>
          <p className="text-[11px] text-[var(--tw-text-muted)]">Gymnasium Abi 2026</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView('members')} className="relative text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)] transition">
            <Users className="w-5 h-5" />
            {pendingMembers.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--tw-bg-app)]">
                {pendingMembers.length}
              </span>
            )}
          </button>
          <button className="text-[var(--tw-text-muted)] hover:text-[var(--tw-text-main)] transition">
            <Shield className="w-5 h-5" />
          </button>
        </div>
      </header>
    );
  };

  
  const handleTabClick = (viewId: any, e: React.MouseEvent) => {
    setCurrentView(viewId);
    if (appMode === 'sellerie') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top;
      
      const newParticles = Array.from({length: 5}).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: centerX + (Math.random() * 40 - 20),
        y: centerY + (Math.random() * 20 - 10)
      }));
      setParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
      }, 1000);
    }
  };

const BottomNavBar = () => (
    <nav className={`fixed bottom-0 inset-x-0 h-[68px] ${themeClasses.bgApp}/95 backdrop-blur-lg border-t ${themeClasses.border} z-40 pb-safe`}>
      <div className="max-w-md mx-auto flex items-center justify-between h-full px-2">
        {[
          { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
          { id: 'grades', label: 'Noten', icon: GraduationCap },
          { id: 'events', label: 'Termine', icon: CalendarDays },
          { id: 'yearbook', label: 'Zeitung', icon: BookOpen },
          { id: 'settings', label: 'Einstellungen', icon: Settings }
        ].map(item => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={(e) => handleTabClick(item.id, e)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${active ? accentText : 'text-slate-500 hover:text-[var(--tw-text-muted)]'}`}
            >
              <div className={`relative ${active ? 'scale-110' : ''}`}>
                <item.icon className={`w-[22px] h-[22px] ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {active && <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${accentBg}`} />}
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  // =========================================================================
  // RENDER VIEWS
  // =========================================================================
  const themeStyles = getThemeVars() as React.CSSProperties;
  return (
    <div className={`min-h-screen ${themeClasses.bgApp} ${themeClasses.textMain} font-sans selection:bg-blue-500/30`} style={themeStyles}>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-up-fade {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.5) rotate(20deg); opacity: 0; }
        }
        .celery-particle {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          animation: float-up-fade 1s ease-out forwards;
          font-size: 24px;
        }
      `}} />
      {particles.map(p => (
        <div key={p.id} className="celery-particle" style={{ left: p.x, top: p.y }}>🥬</div>
      ))}

      <TopAppBar />

      <main className="pt-20 pb-28 px-4 max-w-2xl mx-auto space-y-4">

        {/* ----------------------------------------------------------------- */}
        {/* VIEW: DASHBOARD */}
        {/* ----------------------------------------------------------------- */}
        {currentView === 'dashboard' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Profil Karte */}
            <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[20px] p-4 flex items-center gap-4 shadow-lg`}>
              <div className={`w-14 h-14 rounded-full ${accentBg} flex items-center justify-center text-3xl shadow-md`}>
                {userAvatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[var(--tw-text-main)]">Hallo, {userName}!</h2>
                  {userRole === 'Ersteller' && (
                    <span className="bg-orange-500 text-orange-950 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      👑 Ersteller
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--tw-text-muted)] mt-1 flex items-center gap-1.5">
                  <span>🍇</span> Gymnasium Abi 2026 • Rheinland-Pfalz (MSS...
                </p>
              </div>
            </div>

            {/* Beitrittsanfragen Karte */}
            {pendingMembers.length > 0 && (
              <div 
                onClick={() => setCurrentView('members')}
                className="bg-[#1C160C] border border-orange-500/50 rounded-[20px] p-4 flex items-center justify-between cursor-pointer hover:bg-[#251D10] transition shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-orange-400">{pendingMembers.length} Beitrittsanfrage(n) ausstehend!</h3>
                    <p className="text-[11px] text-orange-400/80 mt-0.5">Tippe hier, um neue Stufenmitglieder zu genehmigen.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-500" />
              </div>
            )}

            {/* Ferien Widget */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold text-[var(--tw-text-main)] flex items-center gap-2">
                  <span className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg"><Calendar className="w-4 h-4" /></span>
                  Nächste Ferien
                </h3>
                <button className={`text-xs font-semibold ${accentText} flex items-center gap-1`}>
                  <CalendarDays className="w-3.5 h-3.5" /> Alle Ferien
                </button>
              </div>
              <div className={`bg-gradient-to-br ${currentAccentConfig.grad} rounded-[24px] p-5 shadow-xl relative overflow-hidden`}>
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                      🍂
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[var(--tw-text-main)] leading-tight">Herbstferien</h4>
                      <p className={`text-[11px] ${currentAccentConfig.textLight} mt-0.5 font-medium`}>05. Okt. – 16. Okt. 2026</p>
                    </div>
                  </div>
                  <div className={`bg-white ${currentAccentConfig.textDark} text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm`}>
                    Noch 32 T.
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {[{v: 32, l: 'Tage'}, {v: 10, l: 'Std'}, {v: 20, l: 'Min'}, {v: 13, l: 'Sek'}].map((t, i) => (
                    <div key={i} className="bg-white/20 backdrop-blur-md rounded-2xl py-2 flex flex-col items-center justify-center border border-white/10 shadow-sm">
                      <span className="text-xl font-bold text-[var(--tw-text-main)] leading-none">{t.v}</span>
                      <span className="text-[10px] text-blue-100 mt-1 font-medium">{t.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notenschnitt Widget */}
            <div 
              onClick={() => setCurrentView('grades')}
              className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[24px] p-5 shadow-lg cursor-pointer hover:brightness-[0.97] transition`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[var(--tw-text-main)] flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-lg"><Monitor className="w-4 h-4" /></span>
                  Dein Notenschnitt
                </h3>
                <span className={`text-xs ${accentText} font-medium`}>Details ansehen →</span>
              </div>
              <div className="flex items-end gap-5 mb-4">
                <div>
                  <div className={`text-5xl font-black ${accentText} tracking-tight leading-none`}>{mss.grade}</div>
                  <div className="text-[10px] text-[var(--tw-text-muted)] font-medium mt-1">Abiturschnitt</div>
                </div>
                <div className="w-px h-10 bg-slate-700/50 mb-1"></div>
                <div>
                  <div className="text-3xl font-black text-amber-500 tracking-tight leading-none">{mss.averagePoints} Pkt</div>
                  <div className="text-[10px] text-[var(--tw-text-muted)] font-medium mt-1">Ø Notenpunkte</div>
                </div>
                <div className="w-px h-10 bg-slate-700/50 mb-1"></div>
                <div>
                  <div className="text-2xl font-bold text-[var(--tw-text-main)] tracking-tight leading-none">{mss.totalPoints} / 900</div>
                  <div className="text-[10px] text-[var(--tw-text-muted)] font-medium mt-1">Gesamtpunkte</div>
                </div>
              </div>
              <p className="text-[11.5px] text-[var(--tw-text-muted)] leading-relaxed bg-[var(--tw-bg-elevated)] p-3 rounded-xl border border-[var(--tw-border-color)]">
                Sehr solides Abitur! Mit {mss.grade} liegst du im oberen Drittel (MSS (Mainzer Studienstufe)).
              </p>
            </div>

            {/* Nächste Termine Widget */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold text-[var(--tw-text-main)] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Nächste Termine
                </h3>
                <button onClick={() => setCurrentView('events')} className={`text-xs font-semibold ${accentText}`}>
                  Alle anzeigen
                </button>
              </div>
              <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[20px] p-4 flex items-start gap-4`}>
                 <div className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap text-center">
                   07. Sept.<br/>2026
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-[var(--tw-text-main)]">Abgabe der Abizeitung-Steckbriefe</h4>
                   <p className="text-xs text-[var(--tw-text-muted)] mt-1">Online Redaktions-Portal</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW: NOTENRECHNER */}
        {/* ----------------------------------------------------------------- */}
        {currentView === 'grades' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Overview Card */}
            <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[24px] p-5 shadow-lg`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-medium text-[var(--tw-text-muted)]">Abiturschnitt (Rheinland-Pfalz)</span>
                  <div className={`text-6xl font-black ${accentText} mt-1 tracking-tight`}>{mss.grade}</div>
                </div>
                <div className="bg-slate-500/10 text-[var(--tw-text-muted)] text-[10px] font-medium px-3 py-1.5 rounded-lg border border-[var(--tw-border-color)]/50 max-w-[120px] leading-tight">
                  MSS (Mainzer Studienstufe)
                </div>
              </div>

              <p className="text-xs text-[var(--tw-text-muted)] mb-6 pb-5 border-b border-slate-800">
                Sehr solides Abitur! Mit {mss.grade} liegst du im oberen Drittel (MSS (Mainzer Studienstufe)).
              </p>

              <div className="grid grid-cols-2 gap-6 mb-5">
                <div>
                  <div className="text-[11px] font-bold text-[var(--tw-text-muted)] mb-1">Block I (Halbjahre)</div>
                  <div className={`text-base font-bold ${accentText}`}>{mss.block1} / 600 Pkt</div>
                  <div className="text-[10px] text-slate-500 mb-2">Min. 200 erforderlich</div>
                  <div className="h-1.5 w-full bg-[var(--tw-bg-elevated)] rounded-full overflow-hidden">
                    <div className={`h-full ${accentBg} rounded-full`} style={{width: `${(mss.block1/600)*100}%`}} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[var(--tw-text-muted)] mb-1">Block II (Prüfungen)</div>
                  <div className="text-base font-bold text-amber-500">{mss.block2} / 300 Pkt</div>
                  <div className="text-[10px] text-slate-500 mb-2">Min. 100 erforderlich</div>
                  <div className="h-1.5 w-full bg-[var(--tw-bg-elevated)] rounded-full overflow-hidden flex gap-1">
                    <div className="h-full bg-amber-500 rounded-full" style={{width: '60%'}} />
                    <div className="h-full bg-amber-500 rounded-full" style={{width: '15%'}} />
                    <div className="h-full bg-amber-500 rounded-full" style={{width: '5%'}} />
                  </div>
                </div>
              </div>

              <div className="bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] rounded-xl p-3 flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${accentBg} flex items-center justify-center text-[var(--tw-text-main)]`}>
                  <Info className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Unterkurse (&lt; 5 Pkt): {mss.deficits} (Max. 7-8 erlaubt)
                </span>
              </div>
            </div>

            {/* Fächer Liste */}
            <div>
              <h3 className="text-sm font-bold text-[var(--tw-text-main)] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Deine Oberstufen-Fächer ({subjects.length})
              </h3>
              
              <div className="space-y-3">
                {subjects.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => { setEditingSubject(s); setIsAddModal(true); }}
                    className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[20px] p-4 shadow-md cursor-pointer hover:border-[var(--tw-border-color)] transition`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[var(--tw-text-main)]">{s.name}</span>
                        {s.isLk && <span className={`text-[10px] font-bold ${accentBg} text-[var(--tw-text-main)] px-1.5 py-0.5 rounded`}>LK</span>}
                        {s.examType !== 'Keins' && <span className="text-[10px] font-bold bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded">{s.examType}</span>}
                      </div>
                      <Trash2 onClick={(e) => { e.stopPropagation(); setSubjects(subjects.filter(sub => sub.id !== s.id)); }} className="w-4 h-4 text-slate-500 hover:text-red-400" />
                    </div>
                    
                    <div className="flex justify-between gap-2 text-center">
                      {[
                        { l: 'Q1', v: s.q1 }, { l: 'Q2', v: s.q2 }, { l: 'Q3', v: s.q3 }, { l: 'Q4', v: s.q4 }, { l: 'Abi-Prüfung', v: s.exam }
                      ].map((term, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-[var(--tw-text-muted)] mb-1.5">{term.l}</span>
                          {term.v !== '' ? (
                            <div className="bg-white text-slate-900 text-xs font-bold w-full py-1.5 rounded-lg border border-slate-300">
                              {term.v} Pkt
                            </div>
                          ) : (
                            <div className="bg-[var(--tw-bg-elevated)] border border-slate-800 text-slate-600 text-xs font-bold w-full py-1.5 rounded-lg">
                              -
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button 
                  onClick={() => { setEditingSubject(null); setIsAddModal(true); }}
                  className={`w-full py-4 rounded-[20px] ${accentBg} text-[var(--tw-text-main)] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition`}
                >
                  <Plus className="w-5 h-5" /> Fach hinzufügen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Fach bearbeiten */}
        {isAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className={`${themeClasses.bgCardElevated} border ${themeClasses.border} rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl`}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${accentBg}/20 flex items-center justify-center`}>
                      <GraduationCap className={`w-5 h-5 ${accentText}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--tw-text-main)]">{editingSubject ? 'Fach bearbeiten' : 'Neues Schulfach'}</h3>
                      <p className="text-[11px] text-[var(--tw-text-muted)]">Notenpunkte (0-15 Pkt) & Prüfungsfach</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddModal(false)} className="text-[var(--tw-text-muted)]"><Plus className="w-6 h-6 rotate-45" /></button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-[var(--tw-bg-elevated)] px-1 text-[10px] font-bold text-[var(--tw-text-muted)]">Fachname</label>
                    <input 
                      type="text" 
                      defaultValue={editingSubject?.name || ''}
                      id="fachname"
                      className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none focus:border-blue-500" 
                    />
                  </div>

                  {!editingSubject && (
                    <div>
                      <label className="text-[10px] font-bold text-[var(--tw-text-muted)] block mb-2">Schnellauswahl:</label>
                      <div className="flex flex-wrap gap-2">
                        {['Mathematik', 'Deutsch', 'Englisch', 'Biologie'].map(f => (
                          <button key={f} onClick={() => (document.getElementById('fachname') as HTMLInputElement).value = f} className="bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] text-[var(--tw-text-muted)] text-[11px] px-3 py-1.5 rounded-lg">{f}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 mt-4">
                    <input type="checkbox" id="islk" defaultChecked={editingSubject?.isLk || false} className="w-5 h-5 rounded bg-[var(--tw-bg-elevated)] border-[var(--tw-border-color)] text-blue-600 focus:ring-0 focus:ring-offset-0" />
                    <span className="text-sm font-bold text-[var(--tw-text-main)]">Leistungskurs (LK - zählt doppelt)</span>
                  </label>

                  <div>
                    <label className="text-[11px] font-bold text-[var(--tw-text-muted)] block mb-2 mt-2">Abiturprüfung (Prüfungsfach):</label>
                    <div className="flex justify-between gap-1">
                      {['Keins', 'P1', 'P2', 'P3', 'P4', 'P5'].map(p => (
                         <button 
                           key={p} 
                           type="button"
                           onClick={(e) => {
                             document.querySelectorAll('.exam-btn').forEach(b => {
                               b.classList.remove('bg-slate-700', 'border-slate-500', 'text-[var(--tw-text-main)]');
                               b.classList.add('bg-[var(--tw-bg-elevated)]', 'border-[var(--tw-border-color)]', 'text-[var(--tw-text-muted)]');
                             });
                             const target = e.currentTarget;
                             target.classList.remove('bg-[var(--tw-bg-elevated)]', 'border-[var(--tw-border-color)]', 'text-[var(--tw-text-muted)]');
                             target.classList.add('bg-slate-700', 'border-slate-500', 'text-[var(--tw-text-main)]', 'exam-btn-selected');
                             target.dataset.val = p;
                           }}
                           data-val={p}
                           className={`exam-btn flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition ${editingSubject?.examType === p || (!editingSubject && p==='Keins') ? 'bg-slate-700 border-slate-500 text-white exam-btn-selected' : 'bg-[var(--tw-bg-elevated)] border-[var(--tw-border-color)] text-[var(--tw-text-muted)]'}`}
                         >
                           {p}
                         </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[var(--tw-text-muted)] block mb-2 mt-2">Halbjahresnoten (0 bis 15 Punkte):</label>
                    <div className="flex gap-2">
                      {['q1', 'q2', 'q3', 'q4'].map((q, i) => (
                        <div key={q} className="relative flex-1">
                          <label className="absolute -top-2 left-2 bg-[var(--tw-bg-elevated)] px-1 text-[9px] text-[var(--tw-text-muted)] uppercase">{q}</label>
                          <input type="number" id={q} defaultValue={(editingSubject as any)?.[q] ?? ''} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-2 py-2 text-center text-sm text-[var(--tw-text-main)] focus:outline-none" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <label className="absolute -top-2 left-3 bg-[var(--tw-bg-elevated)] px-1 text-[10px] text-[var(--tw-text-muted)]">Abiturprüfungs-Note (0 - 15 Pkt)</label>
                    <input type="number" id="exam" defaultValue={editingSubject?.exam ?? ''} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none" />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setIsAddModal(false)} className="flex-1 py-3 rounded-xl border border-[var(--tw-border-color)] text-[var(--tw-text-muted)] font-bold text-sm">Abbrechen</button>
                  <button onClick={() => {
                    const name = (document.getElementById('fachname') as HTMLInputElement).value;
                    const isLk = (document.getElementById('islk') as HTMLInputElement).checked;
                    const pType = document.querySelector('.exam-btn-selected') as HTMLElement;
                    const examType = (pType?.dataset.val || 'Keins') as any;
                    const q1 = parseInt((document.getElementById('q1') as HTMLInputElement).value);
                    const q2 = parseInt((document.getElementById('q2') as HTMLInputElement).value);
                    const q3 = parseInt((document.getElementById('q3') as HTMLInputElement).value);
                    const q4 = parseInt((document.getElementById('q4') as HTMLInputElement).value);
                    const exam = parseInt((document.getElementById('exam') as HTMLInputElement).value);
                    
                    if(!name) return;
                    
                    const newSub: SubjectGrade = {
                      id: editingSubject ? editingSubject.id : Date.now().toString(),
                      name, isLk, examType,
                      q1: isNaN(q1) ? '' : q1, q2: isNaN(q2) ? '' : q2, q3: isNaN(q3) ? '' : q3, q4: isNaN(q4) ? '' : q4, exam: isNaN(exam) ? '' : exam
                    };
                    
                    if (editingSubject) setSubjects(subjects.map(s => s.id === editingSubject.id ? newSub : s));
                    else setSubjects([...subjects, newSub]);
                    
                    setIsAddModal(false);
                    notify('Fach gespeichert!');
                  }} className={`flex-1 py-3 rounded-xl ${accentBg} text-[var(--tw-text-main)] font-bold text-sm`}>Speichern</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW: TERMINE & NEWS */}
        {/* ----------------------------------------------------------------- */}
        {currentView === 'events' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Segmented Control */}
            <div className={`${themeClasses.bgCardElevated} rounded-xl p-1 flex gap-1 border ${themeClasses.border}`}>
              <button 
                onClick={() => setEventsTab('calendar')} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${eventsTab === 'calendar' ? 'bg-[var(--tw-bg-elevated)] text-blue-500 shadow-sm' : 'text-[var(--tw-text-muted)]'}`}
              >
                Kalender & Termine (3)
              </button>
              <button 
                onClick={() => setEventsTab('news')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${eventsTab === 'news' ? 'bg-[var(--tw-bg-elevated)] text-blue-500 shadow-sm' : 'text-[var(--tw-text-muted)]'}`}
              >
                Nachrichten (2)
              </button>
            </div>

            {eventsTab === 'calendar' ? (
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Alle Termine', 'Prüfungen', 'Events & Ball', 'Fristen'].map(f => (
                    <button 
                      key={f} onClick={() => setEventFilter(f as any)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border whitespace-nowrap transition ${eventFilter === f ? 'bg-[var(--tw-bg-elevated)] text-[var(--tw-text-main)] border-slate-500' : 'bg-transparent text-[var(--tw-text-muted)] border-[var(--tw-border-color)]'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Event Cards */}
                <div className="space-y-3">
                  {events.map(ev => (
                    <div key={ev.id} className={`${themeClasses.bgCard} rounded-[20px] p-4 shadow-md border ${ev.category === 'Frist' ? 'border-orange-500/50' : 'border-slate-800'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-md">{ev.category}</span>
                          {ev.category === 'Frist' && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">In 4 Tagen</span>}
                        </div>
                        <Trash2 onClick={() => setEvents(events.filter(e => e.id !== ev.id))} className="w-4 h-4 text-slate-500" />
                      </div>
                      <h4 className="text-base font-bold text-[var(--tw-text-main)] mb-2">{ev.title}</h4>
                      <div className="space-y-1 text-xs text-[var(--tw-text-muted)]">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-blue-400" /> {new Date(ev.date).toLocaleDateString('de-DE', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[var(--tw-text-muted)]" /> {ev.location}</div>
                      </div>
                      {ev.notes && <p className="text-[11px] text-[var(--tw-text-muted)] mt-3">{ev.notes}</p>}
                    </div>
                  ))}
                </div>

                <div className="fixed bottom-24 right-4 z-30">
                  <button onClick={() => setShowEventModal(true)} className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl border border-blue-400/50">
                    <Plus className="w-5 h-5" /> Termin anlegen
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {news.map(n => (
                  <div key={n.id} className={`${themeClasses.bgCard} rounded-[20px] p-4 shadow-md border ${n.isImportant ? 'border-rose-500/50' : 'border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {n.isImportant && <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Wichtig</span>}
                        <h4 className="text-sm font-bold text-[var(--tw-text-main)] leading-tight pr-4">{n.title}</h4>
                      </div>
                      <Trash2 onClick={() => setNews(news.filter(x => x.id !== n.id))} className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-[var(--tw-text-muted)] leading-relaxed my-3">{n.content}</p>
                    <div className="text-[10px] text-blue-400 flex justify-between items-end">
                      <span>Verfasst von {n.author}</span>
                      <span className="text-slate-500 text-right w-24">{n.date}</span>
                    </div>
                  </div>
                ))}

                <div className="fixed bottom-24 right-4 z-30">
                  <button onClick={() => setShowNewsModal(true)} className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl border border-blue-400/50">
                    <Plus className="w-5 h-5" /> Nachricht verfassen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: Termin anlegen */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`${themeClasses.bgCardElevated} border ${themeClasses.border} rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl p-5`}>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-purple-400" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--tw-text-main)]">Neuer Termin</h3>
                    <p className="text-[11px] text-[var(--tw-text-muted)]">Klausur, Frist oder Event planen</p>
                  </div>
                </div>
                <button onClick={() => setShowEventModal(false)} className="text-[var(--tw-text-muted)]"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="Titel / Anlass" value={newEvent.title || ''} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none" />
                
                <div>
                  <label className="text-[11px] font-bold text-[var(--tw-text-muted)] block mb-1">Datum & Uhrzeit:</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-transparent border border-[var(--tw-border-color)] rounded-xl px-3 py-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <input type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent, date: e.target.value})} className="bg-transparent text-sm text-[var(--tw-text-main)] w-full focus:outline-none" />
                    </div>
                    <div className="w-24 relative">
                      <label className="absolute -top-2 left-2 bg-[var(--tw-bg-elevated)] px-1 text-[9px] text-[var(--tw-text-muted)]">Uhrzeit</label>
                      <input type="time" value={newEvent.time} onChange={e=>setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-3 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {['Heute', 'Morgen', '+1 Woche', '+2 Wochen'].map(d => (
                      <button key={d} className="flex-1 py-1.5 rounded-lg border border-[var(--tw-border-color)] bg-[var(--tw-bg-elevated)] text-[10px] font-bold text-[var(--tw-text-muted)]">{d}</button>
                    ))}
                  </div>
                </div>

                <input type="text" placeholder="Ort / Raum (optional)" value={newEvent.location || ''} onChange={e=>setNewEvent({...newEvent, location: e.target.value})} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none" />
                
                <div>
                  <label className="text-[11px] font-bold text-[var(--tw-text-muted)] block mb-1">Kategorie:</label>
                  <div className="flex gap-2">
                    {['Klausur', 'Frist', 'Event', 'Treffen'].map(c => (
                      <button key={c} onClick={()=>setNewEvent({...newEvent, category: c as any})} className={`flex-1 py-2 rounded-lg border text-[11px] font-bold ${newEvent.category===c ? 'bg-slate-700 border-slate-500 text-white' : 'bg-[var(--tw-bg-elevated)] border-[var(--tw-border-color)] text-[var(--tw-text-muted)]'}`}>{c}</button>
                    ))}
                  </div>
                </div>

                <textarea placeholder="Zusätzliche Notizen (optional)" value={newEvent.notes || ''} onChange={e=>setNewEvent({...newEvent, notes: e.target.value})} rows={2} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none resize-none" />
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowEventModal(false)} className="flex-1 py-3 rounded-xl border border-[var(--tw-border-color)] text-[var(--tw-text-muted)] font-bold text-sm">Abbrechen</button>
                <button onClick={() => {
                  setEvents([...events, { id: Date.now().toString(), title: newEvent.title || 'Neuer Termin', date: newEvent.date || '', location: newEvent.location || '', category: newEvent.category || 'Event', notes: newEvent.notes }]);
                  setShowEventModal(false);
                  notify('Termin gespeichert!');
                }} className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm">Speichern</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: News verfassen */}
        {showNewsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`${themeClasses.bgCardElevated} border ${themeClasses.border} rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl p-5`}>
               <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-purple-400" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--tw-text-main)]">Mitteilung verfassen</h3>
                    <p className="text-[11px] text-[var(--tw-text-muted)]">Nachricht an die gesamte Stufe</p>
                  </div>
                </div>
                <button onClick={() => setShowNewsModal(false)} className="text-[var(--tw-text-muted)]"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Titel der Mitteilung" onChange={e=>setNewNews({...newNews, title: e.target.value})} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none" />
                <textarea placeholder="Nachrichtentext" rows={4} onChange={e=>setNewNews({...newNews, content: e.target.value})} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none resize-none" />
                <label className="flex items-center gap-3 mt-4">
                  <input type="checkbox" onChange={e=>setNewNews({...newNews, isImportant: e.target.checked})} className="w-5 h-5 rounded bg-[var(--tw-bg-elevated)] border-[var(--tw-border-color)] text-rose-500" />
                  <span className="text-sm font-bold text-[var(--tw-text-main)]">Als Eilmeldung (Wichtig) markieren</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewsModal(false)} className="flex-1 py-3 rounded-xl border border-[var(--tw-border-color)] text-[var(--tw-text-muted)] font-bold text-sm">Abbrechen</button>
                <button onClick={() => {
                  setNews([{ id: Date.now().toString(), title: newNews.title||'', content: newNews.content||'', author: userName, date: 'Gerade eben', isImportant: newNews.isImportant||false }, ...news]);
                  setShowNewsModal(false);
                  notify('Nachricht gesendet!');
                }} className="flex-1 py-3 rounded-xl bg-slate-700 text-[var(--tw-text-muted)] font-bold text-sm">Veröffentlichen</button>
              </div>
            </div>
          </div>
        )}


        {/* ----------------------------------------------------------------- */}
        {/* VIEW: ABIZEITUNG (YEARBOOK) */}
        {/* ----------------------------------------------------------------- */}
        {currentView === 'yearbook' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Hero Card */}
            <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[20px] p-4 flex items-center gap-4 shadow-md`}>
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg"><BookOpen className="w-6 h-6 text-white" /></div>
              <div>
                <h3 className="text-base font-bold text-[var(--tw-text-main)]">Abizeitung & Momente</h3>
                <p className="text-[11px] text-[var(--tw-text-muted)]">Sammelt Texte, Erinnerungen & Fotos für das gedruckte Abibuch!</p>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['Alle Beiträge', '📸 Mit Fotos', '✍️ Nur Text'].map(f => (
                <button 
                  key={f} onClick={() => setYbFilter(f as any)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg border whitespace-nowrap transition ${ybFilter === f ? 'bg-slate-700 text-white border-slate-500' : 'bg-transparent text-[var(--tw-text-muted)] border-[var(--tw-border-color)]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] text-[var(--tw-text-muted)] font-bold">{posts.length} Einträge</span>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={ybOnlyPrint} onChange={(e) => setYbOnlyPrint(e.target.checked)} className="w-4 h-4 rounded bg-transparent border-[var(--tw-border-color)] text-amber-500 focus:ring-0" />
                <span className="text-[11px] text-[var(--tw-text-muted)] font-medium">Nur fürs Abibuch markierte</span>
              </label>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.filter(p => !ybOnlyPrint || p.isSelectedForPrint).map(post => {
                const hasVoted = post.votedUserIds.includes('user_me');
                return (
                  <div key={post.id} className={`${themeClasses.bgCard} border border-orange-500/40 rounded-[20px] p-4 shadow-lg relative`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-900/60 flex items-center justify-center text-sm font-bold text-purple-200">
                          {post.avatar}
                        </div>
                        <div className="text-sm font-bold text-[var(--tw-text-main)] flex items-center gap-2">
                          {post.author}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.isSelectedForPrint && (
                          <div className="bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                            <Bookmark className="w-3 h-3 fill-amber-950" /> Abibuch
                          </div>
                        )}
                        <Trash2 onClick={() => setPosts(posts.filter(p => p.id !== post.id))} className="w-4 h-4 text-slate-500 hover:text-red-400" />
                      </div>
                    </div>
                    
                    <p className="text-[15px] font-medium text-slate-200 leading-relaxed mb-4">
                      {post.content}
                    </p>

                    <div className="flex justify-between items-center">
                      <button onClick={() => {
                        setPosts(posts.map(p => {
                          if (p.id === post.id) {
                            const voted = p.votedUserIds.includes('user_me');
                            return {...p, votesCount: voted ? p.votesCount-1 : p.votesCount+1, votedUserIds: voted ? [] : ['user_me']};
                          } return p;
                        }));
                      }} className="bg-[var(--tw-bg-elevated)] hover:brightness-[0.95] border border-[var(--tw-border-color)]/50 text-[var(--tw-text-muted)] text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-slate-300' : ''}`} /> {post.votesCount} Stimmen
                      </button>

                      <button onClick={() => setPosts(posts.map(p => p.id === post.id ? {...p, isSelectedForPrint: !p.isSelectedForPrint} : p))} className="border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
                        <Bookmark className={`w-3.5 h-3.5 ${post.isSelectedForPrint ? 'fill-amber-500' : ''}`} /> Im Abibuch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="fixed bottom-24 right-4 z-30">
              <button onClick={() => setShowPostModal(true)} className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-5 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl border border-blue-400/50">
                <ImageIcon className="w-5 h-5" /> Beitrag verfassen
              </button>
            </div>
          </div>
        )}

        {/* MODAL: Beitrag verfassen */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className={`${themeClasses.bgCardElevated} border ${themeClasses.border} rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl p-5`}>
               <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Edit2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--tw-text-main)]">Neuer Beitrag</h3>
                    <p className="text-[11px] text-[var(--tw-text-muted)]">Text, Fotos & Erinnerungen</p>
                  </div>
                </div>
                <button onClick={() => setShowPostModal(false)} className="text-[var(--tw-text-muted)]"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>
              <div className="space-y-4">
                <textarea placeholder="Was möchtest du festhalten? (Zitat, Story, Panne, Erinnerung...)" rows={4} onChange={e=>setNewPost({...newPost, content: e.target.value})} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none resize-none" />
                
                <button className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 flex items-center justify-between text-[var(--tw-text-muted)]">
                  <div className="flex items-center gap-3"><ImageIcon className="w-5 h-5 text-blue-400"/> <div className="text-left"><div className="text-sm font-bold">Bild hinzufügen</div><div className="text-[10px]">Foto aus Galerie wählen</div></div></div>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--tw-text-muted)]"><Calendar className="w-4 h-4"/> Datum & Uhrzeit hinzufügen (optional)</div>
                  <div className={`w-10 h-6 rounded-full border border-[var(--tw-border-color)] ${newPost.withTime ? 'bg-blue-500' : 'bg-transparent'} relative transition-colors`} onClick={()=>setNewPost({...newPost, withTime: !newPost.withTime})}>
                    <div className={`w-4 h-4 rounded-full bg-slate-400 absolute top-0.5 transition-all ${newPost.withTime ? 'left-5 bg-white' : 'left-1'}`} />
                  </div>
                </div>

                <div className="relative mt-2">
                  <label className="absolute -top-2 left-3 bg-[var(--tw-bg-elevated)] px-1 text-[10px] text-[var(--tw-text-muted)]">Name / Verfasser (optional)</label>
                  <div className="flex items-center gap-2 bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3">
                    <User className="w-4 h-4 text-[var(--tw-text-muted)]" />
                    <input type="text" defaultValue={userName} onChange={e=>setNewPost({...newPost, author: e.target.value})} className="w-full bg-transparent text-sm text-[var(--tw-text-main)] focus:outline-none" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <span className="text-[11px] font-bold text-slate-500"><ThumbsUp className="w-3.5 h-3.5 inline mr-1" /> 0 Stimmen</span>
                <div className="flex gap-2">
                   <button onClick={() => setShowPostModal(false)} className="px-4 py-2 rounded-xl text-blue-400 font-bold text-sm">Abbrechen</button>
                   <button onClick={() => {
                     setPosts([{ id: Date.now(), author: newPost.author, authorRole: 'Schüler', avatar: 'L', content: newPost.content, category: 'Zitate', votesCount: 0, votedUserIds: [], isSelectedForPrint: false, date: 'Gerade eben' }, ...posts]);
                     setShowPostModal(false);
                     notify('Beitrag verfasst!');
                   }} className="bg-[var(--tw-bg-elevated)] text-[var(--tw-text-muted)] font-bold px-4 py-2 rounded-xl border border-[var(--tw-border-color)]/50 flex items-center gap-1.5"><ImageIcon className="w-4 h-4"/> Beitrag verfassen</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className={`${themeClasses.bgCardElevated} border ${themeClasses.border} rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl p-5`}>
               <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Edit2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--tw-text-main)]">Profil bearbeiten</h3>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="text-[var(--tw-text-muted)]"><Plus className="w-6 h-6 rotate-45" /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-[var(--tw-text-muted)] ml-1">Name</label>
                  <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--tw-text-muted)] ml-1">Zitat</label>
                  <input type="text" value={tempQuote} onChange={e => setTempQuote(e.target.value)} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--tw-text-muted)] ml-1">E-Mail</label>
                  <input type="email" value={tempEmail} onChange={e => setTempEmail(e.target.value)} className="w-full bg-transparent border border-[var(--tw-border-color)] rounded-xl px-4 py-3 text-sm text-[var(--tw-text-main)] focus:outline-none mt-1" />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                 <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 rounded-xl text-blue-400 font-bold text-sm">Abbrechen</button>
                 <button onClick={() => {
                   setUserName(tempName);
                   setUserQuote(tempQuote);
                   setUserEmail(tempEmail);
                   setShowProfileModal(false);
                 }} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl shadow-md">Speichern</button>
              </div>
             </div>
          </div>
        )}
        
        {/* ----------------------------------------------------------------- */}
        {/* VIEW: EINSTELLUNGEN */}
        {/* ----------------------------------------------------------------- */}
        {currentView === 'settings' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Profile Hero */}
            <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[24px] p-6 shadow-lg flex flex-col items-center relative overflow-hidden`}>
               {/* Background Glow */}
               <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 ${accentBg} rounded-full blur-[80px] opacity-20`} />
               
               <div className="relative">
                 <div className={`w-20 h-20 rounded-full ${accentBg} flex items-center justify-center text-4xl shadow-xl z-10 overflow-hidden`}>
                   {userAvatar.startsWith('data:') ? <img src={userAvatar} className="w-full h-full object-cover" /> : userAvatar}
                 </div>
                 <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-[var(--tw-bg-app)] flex items-center justify-center cursor-pointer hover:scale-110 transition">
                   <Camera className="w-3 h-3 text-white" />
                   <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleAvatarUpload} />
                 </label>
               </div>
               
               <div className="mt-4 flex flex-col items-center">
                 <div className="flex items-center gap-2">
                   <h2 className="text-xl font-bold text-[var(--tw-text-main)]">{userName}</h2>
                   <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">{userRole}</span>
                 </div>
                 <p className="text-xs text-[var(--tw-text-muted)] mt-1">{userEmail}</p>
               </div>

               <div className="mt-4 bg-[var(--tw-bg-elevated)] border border-slate-800 rounded-xl px-4 py-2 w-full text-center">
                 <p className="text-[11px] font-medium text-[var(--tw-text-muted)] italic">{userQuote}</p>
               </div>

               <div className="flex gap-3 w-full mt-5">
                 <button onClick={() => { setTempName(userName); setTempQuote(userQuote); setTempEmail(userEmail); setShowProfileModal(true); }} className="flex-1 bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] text-[var(--tw-text-muted)] text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-[1.2] transition"><Edit2 className="w-3.5 h-3.5"/> Profil</button>
                 <button className="flex-1 bg-[#2C2622] border border-orange-500/30 text-orange-400 text-[11px] font-mono font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"><Key className="w-3.5 h-3.5"/> {joinKey}</button>
               </div>
            </div>

            {/* Darstellung Personalisieren */}
            <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[24px] p-5 shadow-lg`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Palette className="w-4 h-4 text-indigo-400" /></div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--tw-text-main)]">Darstellung Personalisieren</h3>
                  <p className="text-[11px] text-[var(--tw-text-muted)]">App-Modus und Akzentfarbe anpassen</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-bold text-[var(--tw-text-main)] mb-2">App-Modus</p>
                <div className="flex gap-2">
                  {[
                    {id: 'dark', i: Moon, l: 'Dark'},
                    {id: 'light', i: Sun, l: 'Light'},
                    {id: 'system', i: Monitor, l: 'System'},
                    {id: 'sellerie', i: Leaf, l: 'Sellerie'}
                  ].map(m => {
                    const isActive = m.id === appMode;
                    const activeBgMap = {blue: 'bg-blue-600 border-blue-500', red: 'bg-red-600 border-red-500', purple: 'bg-purple-600 border-purple-500', orange: 'bg-orange-500 border-orange-400', green: 'bg-emerald-600 border-emerald-500', pink: 'bg-pink-600 border-pink-500'};
                    const activeBg = (activeBgMap as any)[accentColor] || 'bg-purple-600 border-purple-500';
                    return (
                    <button key={m.id} onClick={() => setAppMode(m.id as 'dark' | 'light' | 'system' | 'sellerie')} className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl border ${isActive ? activeBg + ' text-white' : 'bg-transparent border-[var(--tw-border-color)] text-[var(--tw-text-muted)]'}`}>
                      <m.i className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold">{m.l}</span>
                    </button>
                    )
                  })}
                </div>
              </div>

              {appMode !== 'sellerie' && (
              <div>
                 <p className="text-[11px] font-bold text-[var(--tw-text-main)] mb-2">Akzentfarbe</p>
                 <div className="flex gap-3">
                   {['blue', 'red', 'purple', 'orange', 'green', 'pink'].map(c => {
                     const bgMap = {blue: 'bg-blue-600', red: 'bg-red-600', purple: 'bg-purple-600', orange: 'bg-orange-500', green: 'bg-emerald-600', pink: 'bg-pink-600'};
                     return (
                       <button key={c} onClick={() => setAccentColor(c)} className={`w-8 h-8 rounded-full ${(bgMap as any)[c]} flex items-center justify-center ${accentColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--tw-bg-card)]' : ''}`}>
                         {accentColor === c && <Check className="w-4 h-4 text-white" />}
                       </button>
                     )
                   })}
                 </div>
              </div>
              )}
            </div>
            <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[24px] p-5 shadow-lg`}>
               <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Lock className="w-4 h-4 text-blue-400" /></div>
                <h3 className="text-sm font-bold text-[var(--tw-text-main)]">Konto & Sicherheit</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-sm font-bold text-[var(--tw-text-main)]">E-Mail-Adresse</div>
                      <div className="text-[11px] text-[var(--tw-text-muted)]">{userEmail}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[var(--tw-text-main)] transition" />
                </div>
                <div className="h-px bg-slate-800 w-full" />
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-sm font-bold text-[var(--tw-text-main)]">Passwort ändern</div>
                      <div className="text-[11px] text-[var(--tw-text-muted)]">Passwort sicher aktualisieren</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[var(--tw-text-main)] transition" />
                </div>
              </div>
            </div>

            {/* Abiturjahrgang & System */}
            <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[24px] p-5 shadow-lg`}>
               <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-purple-400" /></div>
                <h3 className="text-sm font-bold text-[var(--tw-text-main)]">Abiturjahrgang & System</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🍇</span>
                  <div>
                    <div className="text-sm font-bold text-[var(--tw-text-main)]">Rheinland-Pfalz (MSS (Mainzer Studienstufe))</div>
                    <div className="text-[11px] text-[var(--tw-text-muted)]">3 Leistungskurse • Abitur 2026</div>
                  </div>
                </div>
                <div className="h-px bg-slate-800 w-full" />
                <div onClick={() => setCurrentView('members')} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-[var(--tw-text-muted)]" />
                    <div>
                      <div className="text-sm font-bold text-[var(--tw-text-main)]">Stufenmitglieder & Freigaben</div>
                      <div className="text-[11px] font-bold text-orange-500">1 Beitrittsanfrage(n) ausstehend</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[var(--tw-text-main)] transition" />
                </div>
                <div className="h-px bg-slate-800 w-full" />
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-[var(--tw-text-muted)]" />
                    <div>
                      <div className="text-sm font-bold text-[var(--tw-text-main)]">Datensicherung & Export</div>
                      <div className="text-[11px] text-[var(--tw-text-muted)]">JSON Backup für Abizeitung-Redaktion</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[var(--tw-text-main)] transition" />
                </div>
              </div>
            </div>

            <button className="w-full bg-[#1A0A0A] border border-red-900/50 hover:bg-red-950/40 text-red-500 text-xs font-bold py-4 rounded-[20px] flex items-center justify-center gap-2 transition shadow-md">
              <LogOut className="w-4 h-4" /> Vom Konto abmelden
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* VIEW: MEMBERS (STUFENLISTE) */}
        {/* ----------------------------------------------------------------- */}
        {currentView === 'members' && (
          <div className="space-y-4 animate-fadeIn pb-10">
            {/* Header Info */}
            <div className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[24px] p-5 shadow-lg`}>
               <div className="flex justify-between items-start mb-5">
                 <div>
                   <h2 className="text-lg font-bold text-[var(--tw-text-main)] leading-tight">Gymnasium Abi 2026</h2>
                   <p className="text-[11px] text-[var(--tw-text-muted)] mt-1">Abiturjahrgang 2026 • 5 Mitschüler</p>
                 </div>
                 <span className="bg-purple-900/40 text-purple-300 border border-purple-700/50 text-[10px] font-bold px-3 py-1.5 rounded-lg">
                   Abitur 2026
                 </span>
               </div>
               
               <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                 <div>
                   <p className="text-[10px] text-[var(--tw-text-muted)]">Zugangsschlüssel für Mitschüler:</p>
                   <p className="text-sm font-bold text-orange-500 mt-0.5">{joinKey}</p>
                 </div>
                 <button onClick={() => { navigator.clipboard.writeText(joinKey); notify('Kopiert!'); }} className="bg-[var(--tw-bg-elevated)] border border-[var(--tw-border-color)] hover:brightness-[0.95] text-blue-400 text-[11px] font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition">
                   <Key className="w-3.5 h-3.5" /> Kopieren
                 </button>
               </div>
            </div>

            {/* Pending Requests */}
            {pendingMembers.length > 0 && (
              <div className="bg-[#141008] border border-orange-500/60 rounded-[24px] p-5 shadow-lg">
                <h3 className="text-sm font-bold text-[var(--tw-text-main)] flex items-center gap-2 mb-4">
                  <UserPlus className="w-4 h-4 text-orange-500" /> Offene Beitrittsanfragen ({pendingMembers.length})
                </h3>
                <div className="space-y-3">
                  {pendingMembers.map(m => (
                    <div key={m.id} className="bg-[var(--tw-bg-elevated)] border border-slate-800 rounded-[20px] p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg">{m.avatar}</div>
                           <div>
                             <div className="text-sm font-bold text-[var(--tw-text-main)]">{m.name}</div>
                             <div className="text-[10px] text-[var(--tw-text-muted)]">{m.email}</div>
                             <div className="text-[10px] text-blue-400 mt-0.5">LKs: {m.lks}</div>
                           </div>
                        </div>
                        <span className="bg-emerald-900/30 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-800">E-Mail bestätigt</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2.5 rounded-xl border border-[var(--tw-border-color)] text-rose-400 text-[11px] font-bold hover:bg-rose-950/20 transition">Ablehnen</button>
                        <button onClick={() => {
                          setMembers(members.map(x => x.id === m.id ? {...x, isPending: false} : x));
                          notify(`${m.name} wurde genehmigt!`);
                        }} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-500 transition"><Check className="w-3.5 h-3.5" /> Beitritt genehmigen</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Members */}
            <div>
              <h3 className="text-sm font-bold text-[var(--tw-text-main)] flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-400" /> Stufenliste ({activeMembers.length})
              </h3>
              <div className="space-y-2">
                {activeMembers.map(m => (
                  <div key={m.id} className={`${themeClasses.bgCard} border ${themeClasses.border} rounded-[20px] p-4 flex justify-between items-center shadow-sm`}>
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg">{m.avatar}</div>
                       <div>
                         <div className="text-sm font-bold text-[var(--tw-text-main)] flex items-center gap-1.5">{m.name} {m.id === '4' && <span className="text-blue-400 text-[10px]">(Du)</span>}</div>
                         <div className="text-[10px] text-[var(--tw-text-muted)]">{m.email}</div>
                         <div className="text-[10px] text-blue-400 mt-0.5">LKs: {m.lks}</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       {m.role === 'Ersteller' ? (
                         <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><Sparkles className="w-3 h-3"/> Ersteller</span>
                       ) : (
                         <span className="bg-[var(--tw-bg-elevated)] text-[var(--tw-text-muted)] text-[10px] font-bold px-2 py-1 rounded border border-[var(--tw-border-color)]/50">Schüler</span>
                       )}
                       <MoreVertical className="w-4 h-4 text-slate-500" />
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <BottomNavBar />
    </div>
  );
}
