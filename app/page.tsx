'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarDays,
  MessageSquare,
  Settings,
  Plus,
  ThumbsUp,
  Bookmark,
  Trash2,
  Share2,
  Clock,
  AlertTriangle,
  Check,
  Award,
  Calendar,
  Send,
  Download,
  Upload,
  User,
  Shield,
  Sparkles,
  ChevronRight,
  MapPin,
  Image as ImageIcon,
  Key,
  CheckCircle2,
  Filter
} from 'lucide-react';

// =========================================================================
// DATENMODELLE & SCHNITTSTELLEN
// =========================================================================
interface SubjectGrade {
  id: string;
  name: string;
  isLk: boolean; // true = LK (in MSS RLP 3 LKs mit 2-facher Wertung)
  h1: number | '';
  h2: number | '';
  h3: number | '';
  h4: number | '';
}

interface Post {
  id: number;
  author: string;
  authorRole: 'CREATOR_ADMIN' | 'ADMIN' | 'STUDENT';
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
  location: string;
  isExam: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
}

const AVATARS = ["🎓", "🦁", "🦊", "🚀", "⚡", "🍀", "🦉", "🎨", "👑", "🔥", "🎧", "🥬"];

export default function AbiHubApp() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'grades' | 'yearbook' | 'events' | 'chat' | 'settings'>('dashboard');

  // Benutzer- & Stufen-Zustand
  const [userName, setUserName] = useState<string>('Leon Hillger');
  const [userRole, setUserRole] = useState<'CREATOR_ADMIN' | 'ADMIN' | 'STUDENT'>('CREATOR_ADMIN');
  const [userAvatar, setUserAvatar] = useState<string>('🎓');
  const [isSellerie, setIsSellerie] = useState<boolean>(true); // Sellerie-Modus Feature
  const [joinKey] = useState<string>('ABI-2026-MSS-RP');
  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  };

  // =========================================================================
  // PERSISTENZ (LOCALSTORAGE)
  // =========================================================================
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('abihub_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setUserName(u.name || 'Leon Hillger');
        setUserAvatar(u.avatar || '🎓');
        setIsSellerie(u.isSellerie ?? true);
      }
      const savedSubjects = localStorage.getItem('abihub_subjects');
      if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
      const savedExams = localStorage.getItem('abihub_exams');
      if (savedExams) setExamGrades(JSON.parse(savedExams));
      const savedPosts = localStorage.getItem('abihub_posts');
      if (savedPosts) setPosts(JSON.parse(savedPosts));
    } catch (e) {
      console.error('Laden fehlgeschlagen', e);
    }
    setIsLoaded(true);
  }, []);

  // Automatisches Speichern
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('abihub_user', JSON.stringify({ name: userName, avatar: userAvatar, isSellerie }));
  }, [userName, userAvatar, isSellerie, isLoaded]);

  // =========================================================================
  // NOTEN & MSS RHEINLAND-PFALZ RECHNER
  // =========================================================================
  const [subjects, setSubjects] = useState<SubjectGrade[]>([
    { id: '1', name: 'Mathematik', isLk: true, h1: 13, h2: 12, h3: 14, h4: 13 },
    { id: '2', name: 'Physik', isLk: true, h1: 14, h2: 14, h3: 15, h4: 14 },
    { id: '3', name: 'Englisch', isLk: true, h1: 11, h2: 12, h3: 12, h4: 11 },
    { id: '4', name: 'Deutsch', isLk: false, h1: 11, h2: 10, h3: 11, h4: 12 },
    { id: '5', name: 'Geschichte', isLk: false, h1: 12, h2: 13, h3: 12, h4: 12 },
    { id: '6', name: 'Biologie', isLk: false, h1: 10, h2: 11, h3: 11, h4: 10 },
    { id: '7', name: 'Sport', isLk: false, h1: 14, h2: 14, h3: 15, h4: 14 },
    { id: '8', name: 'Informatik', isLk: false, h1: 15, h2: 15, h3: 15, h4: 15 },
  ]);

  const [examGrades, setExamGrades] = useState({
    p1: 13, // 1. LK
    p2: 14, // 2. LK
    p3: 12, // 3. LK
    p4: 11, // 4. Fach
    p5: 12  // 5. mündlich
  });

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('abihub_subjects', JSON.stringify(subjects));
    localStorage.setItem('abihub_exams', JSON.stringify(examGrades));
  }, [subjects, examGrades, isLoaded]);

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIsLk, setNewSubIsLk] = useState(false);

  // MSS RLP Berechnungsauswertung
  const mss = useMemo(() => {
    let lkPoints = 0;
    let lkDeficits = 0;
    let gkPoints = 0;
    let gkDeficits = 0;

    subjects.forEach(sub => {
      [sub.h1, sub.h2, sub.h3, sub.h4].forEach(val => {
        if (typeof val === 'number') {
          if (sub.isLk) {
            lkPoints += val * 2; // RLP: 3 LKs doppelt gewertet
            if (val < 5) lkDeficits++;
          } else {
            gkPoints += val;
            if (val < 5) gkDeficits++;
          }
        }
      });
    });

    const block1 = Math.min(600, lkPoints + gkPoints);
    const block2 = Math.min(300, (examGrades.p1 + examGrades.p2 + examGrades.p3 + examGrades.p4 + examGrades.p5) * 4);
    const totalPoints = block1 + block2;

    // KMK-Berechnungsschlüssel
    let grade = "1.0";
    if (totalPoints >= 823) grade = "1.0";
    else if (totalPoints <= 300) grade = "4.0";
    else {
      const g = (17 / 3) - (totalPoints / 180);
      grade = Math.max(1.0, Math.min(4.0, g)).toFixed(1);
    }

    const totalDeficits = lkDeficits + gkDeficits;
    const isPassed = block1 >= 200 && block2 >= 100 && lkDeficits <= 3 && totalDeficits <= 7;

    return { block1, block2, totalPoints, grade, lkDeficits, gkDeficits, totalDeficits, isPassed };
  }, [subjects, examGrades]);

  // =========================================================================
  // PINNWAND & FEIERMOMENTE
  // =========================================================================
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Dr. Weber (Physik LK)',
      authorRole: 'ADMIN',
      avatar: '🦉',
      content: '„Wenn das Pendel heute nicht schwingt, verschieben wir die Gravitation auf nächste Woche!“',
      category: 'Zitate',
      votesCount: 19,
      votedUserIds: [],
      isSelectedForPrint: true,
      date: 'Gestern, 14:20'
    },
    {
      id: 2,
      author: 'Leon Hillger',
      authorRole: 'CREATOR_ADMIN',
      avatar: '🎓',
      content: 'Die Planung für den Abistreich 2026 steht! Treffen für alle Helfer am Freitag nach der 6. Stunde in der Aula.',
      category: 'Ankündigung',
      votesCount: 12,
      votedUserIds: ['user_me'],
      isSelectedForPrint: true,
      date: 'Heute, 10:15'
    }
  ]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('abihub_posts', JSON.stringify(posts));
  }, [posts, isLoaded]);

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Zitate');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [onlyPrintSelected, setOnlyPrintSelected] = useState<boolean>(false);

  // 1-Klick-Toggle Stimmabgabe pro Beitrag
  const toggleUpvote = (postId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasVoted = p.votedUserIds.includes('user_me');
        const newVotedList = hasVoted
          ? p.votedUserIds.filter(id => id !== 'user_me')
          : [...p.votedUserIds, 'user_me'];
        return {
          ...p,
          votesCount: newVotedList.length,
          votedUserIds: newVotedList
        };
      }
      return p;
    }));
  };

  const togglePrintStatus = (postId: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSelectedForPrint: !p.isSelectedForPrint } : p));
    notify('Druck-Markierung für das Abibuch aktualisiert!');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    const newEntry: Post = {
      id: Date.now(),
      author: userName,
      authorRole: userRole,
      avatar: userAvatar,
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      category: newPostCategory,
      votesCount: 0,
      votedUserIds: [],
      isSelectedForPrint: false,
      date: 'Gerade eben'
    };
    setPosts([newEntry, ...posts]);
    setNewPostContent('');
    setNewPostImage(null);
    notify('Beitrag erfolgreich veröffentlicht!');
  };

  // =========================================================================
  // TERMINE & FERIEN (RLP OHNE PFINGSTFERIEN)
  // =========================================================================
  const [events] = useState<CalendarEvent[]>([
    { id: '1', title: 'Abiturprüfung Mathematik (LK)', date: '2026-04-28', location: 'Turnhalle', isExam: true },
    { id: '2', title: 'Abiturprüfung Deutsch', date: '2026-05-04', location: 'Aula', isExam: true },
    { id: '3', title: 'Abistreich & Mottowoche', date: '2026-06-12', location: 'Schulhof', isExam: false },
    { id: '4', title: 'Abiball 2026', date: '2026-06-27', location: 'Rheingoldhalle Mainz', isExam: false }
  ]);

  const rlpSchoolHolidays = [
    { title: 'Herbstferien RLP', dates: '05.10.2026 – 16.10.2026', emoji: '🍂' },
    { title: 'Weihnachtsferien RLP', dates: '23.12.2026 – 08.01.2027', emoji: '🎄' },
    { title: 'Osterferien RLP', dates: '22.03.2027 – 02.04.2027', emoji: '🌸' },
    { title: 'Sommerferien RLP', dates: '28.06.2027 – 06.08.2027', emoji: '🏖️' }
  ];

  // =========================================================================
  // STUFENCHAT
  // =========================================================================
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Sophie Müller', avatar: '🎨', text: 'Hey alle! Wer hat die Zusammenfassung für Geschichte MSS 12?', time: '09:41', isMe: false },
    { id: '2', sender: 'Leon Hillger', avatar: '🎓', text: 'Hab sie eben im AbiHub hochgeladen!', time: '09:44', isMe: true }
  ]);
  const [chatInput, setChatInput] = useState('');

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: userName,
        avatar: userAvatar,
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }
    ]);
    setChatInput('');
  };

  const daysUntilAbi = useMemo(() => {
    const target = new Date('2026-04-28').getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-28">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-blue-400/30 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          {notification}
        </div>
      )}

      {/* Haupt-Container */}
      <main className="max-w-2xl mx-auto px-4 pt-6">

        {/* ========================================================================= */}
        {/* TAB 1: ÜBERSICHT (DASHBOARD) */}
        {/* ========================================================================= */}
        {currentTab === 'dashboard' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Überarbeitete Profil-Card */}
            <div className="bg-[#131E35] border border-slate-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => setCurrentTab('settings')}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl shadow-md hover:scale-105 transition"
                >
                  {userAvatar}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white leading-none">Hallo, {userName}!</h2>
                    {userRole === 'CREATOR_ADMIN' && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        👑 Ersteller
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <span>🍇</span> Gymnasium 2026 • Rheinland-Pfalz (MSS)
                  </p>
                </div>
              </div>

              {isSellerie && (
                <div className="bg-[#1B5E20] border border-[#4CAF50]/60 text-[#81C784] text-xs font-bold px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
                  🥬 Sellerie
                </div>
              )}
            </div>

            {/* Countdown Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-5 shadow-xl text-white relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
                    Abitur Countdown 2026
                  </span>
                  <div className="text-3xl font-black mt-0.5 tracking-tight flex items-baseline gap-2">
                    {daysUntilAbi} Tage
                    <span className="text-xs font-normal text-blue-100">bis zur 1. Prüfung</span>
                  </div>
                  <p className="text-xs text-blue-100/90 mt-1">Zielgerade: 28. April 2026 (Mathematik LK)</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                  ⏳
                </div>
              </div>
            </div>

            {/* Noten- & MSS-Schnitt Widget */}
            <div
              onClick={() => setCurrentTab('grades')}
              className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg cursor-pointer hover:border-blue-500/50 transition group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dein Abiturschnitt (MSS RLP)</span>
                  <div className="text-5xl font-black text-white mt-1 group-hover:text-blue-400 transition">
                    {mss.grade}
                  </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  {mss.totalPoints} / 900 Pkt
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
                <div className="bg-[#0D1527] p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Block I (Halbjahre)</div>
                  <div className="text-sm font-bold text-blue-400 mt-0.5">{mss.block1} / 600 Pkt</div>
                </div>
                <div className="bg-[#0D1527] p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Unterkurse (&lt; 05 Pkt)</div>
                  <div className={`text-sm font-bold mt-0.5 ${mss.totalDeficits <= 7 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mss.totalDeficits} / 7 erlaubt {mss.lkDeficits > 3 && '⚠️ Zu viele LK'}
                  </div>
                </div>
              </div>
            </div>

            {/* Schnellnavigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'MSS Noten', icon: GraduationCap, tab: 'grades', color: 'text-blue-400' },
                { label: isSellerie ? 'Sellerie-Momente' : 'Abizeitung', icon: BookOpen, tab: 'yearbook', color: 'text-amber-400' },
                { label: 'Termine & Ferien', icon: CalendarDays, tab: 'events', color: 'text-emerald-400' },
                { label: 'Stufenchat', icon: MessageSquare, tab: 'chat', color: 'text-purple-400' }
              ].map(item => (
                <button
                  key={item.tab}
                  onClick={() => setCurrentTab(item.tab as any)}
                  className="bg-[#131E35] border border-slate-800 hover:bg-[#1A2744] p-3.5 rounded-2xl flex flex-col items-center gap-2 transition shadow-md"
                >
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                  <span className="text-xs font-bold text-slate-200">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NOTEN & MSS RLP RECHNER */}
        {/* ========================================================================= */}
        {currentTab === 'grades' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-gradient-to-br from-blue-900/60 via-[#131E35] to-[#131E35] border border-blue-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Abiturschnitt (Rheinland-Pfalz)</span>
                  <div className="text-6xl font-black text-white mt-1 tracking-tight">
                    {mss.grade}
                  </div>
                </div>
                <div className="bg-slate-800/90 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
                  MSS (Mainzer Studienstufe)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Gesamtpunkte</span>
                  <div className="text-xl font-bold text-amber-400">{mss.totalPoints} / 900 Pkt</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Prüfungsstatus</span>
                  <div className={`text-sm font-bold flex items-center gap-1 mt-1 ${mss.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mss.isPassed ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {mss.isPassed ? 'Zulassung erreicht' : 'Unterkurse überschritten'}
                  </div>
                </div>
              </div>
            </div>

            {/* Fächer-Tabelle */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Halbjahresnoten (MSS 11 & 12)</h3>
                  <p className="text-xs text-slate-400">Punkte von 00 bis 15 (3 LKs doppelt gewertet)</p>
                </div>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Fach anlegen
                </button>
              </div>

              {showAddSubject && (
                <div className="bg-[#0D1527] border border-blue-500/40 p-4 rounded-2xl space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-blue-300 uppercase">Neues Fach</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="z. B. Spanisch"
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      className="flex-1 bg-[#131E35] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewSubIsLk(!newSubIsLk)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border transition ${newSubIsLk ? 'bg-amber-500 text-white border-amber-400' : 'bg-[#131E35] text-slate-300 border-slate-700'}`}
                    >
                      {newSubIsLk ? 'Leistungskurs (LK)' : 'Grundkurs (GK)'}
                    </button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddSubject(false)} className="text-xs text-slate-400 px-3 py-1.5">Abbrechen</button>
                    <button
                      onClick={() => {
                        if (!newSubName.trim()) return;
                        setSubjects([...subjects, { id: Date.now().toString(), name: newSubName, isLk: newSubIsLk, h1: 11, h2: 11, h3: 11, h4: 11 }]);
                        setNewSubName('');
                        setShowAddSubject(false);
                        notify('Fach angelegt!');
                      }}
                      className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-xl"
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {subjects.map(s => (
                  <div key={s.id} className="bg-[#0D1527] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <div className="w-1/3">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {s.name}
                        {s.isLk && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">LK</span>}
                      </div>
                      <span className="text-[10px] text-slate-400">{s.isLk ? '2-fache Wertung' : '1-fache Wertung'}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 flex-1 max-w-[200px]">
                      {(['h1', 'h2', 'h3', 'h4'] as const).map((h) => (
                        <input
                          key={h}
                          type="number"
                          min="0"
                          max="15"
                          value={s[h]}
                          onChange={e => {
                            const val = e.target.value === '' ? '' : Math.min(15, Math.max(0, parseInt(e.target.value) || 0));
                            setSubjects(subjects.map(item => item.id === s.id ? { ...item, [h]: val } : item));
                          }}
                          className={`w-full text-center bg-[#131E35] border text-xs font-bold py-1.5 rounded-lg focus:outline-none focus:border-blue-500 ${
                            Number(s[h]) < 5 ? 'border-rose-500/60 text-rose-400' : 'border-slate-700 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setSubjects(subjects.filter(item => item.id !== s.id))}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Block II Abiturprüfungen */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-base font-bold text-white">Block II (Abiturprüfungen)</h3>
              <p className="text-xs text-slate-400">5 Prüfungsfächer (je 4-fach gewertet)</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {[
                  { key: 'p1', label: '1. LK' },
                  { key: 'p2', label: '2. LK' },
                  { key: 'p3', label: '3. LK' },
                  { key: 'p4', label: '4. Fach' },
                  { key: 'p5', label: '5. Mündlich' },
                ].map(p => (
                  <div key={p.key} className="bg-[#0D1527] p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">{p.label}</span>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={(examGrades as any)[p.key]}
                      onChange={e => setExamGrades({ ...examGrades, [p.key]: parseInt(e.target.value) || 0 })}
                      className="w-full text-center bg-[#131E35] border border-slate-700 rounded-lg py-1 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PINNWAND (MIT SCROLLBAREM HEADER & 1-KLICK UPVOTES) */}
        {/* ========================================================================= */}
        {currentTab === 'yearbook' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header Banner (scrollt natürlich mit) */}
            <div className="bg-gradient-to-r from-blue-600/10 via-amber-500/10 to-indigo-600/10 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md ${
                isSellerie ? 'bg-[#1B5E20] border border-[#4CAF50]/60' : 'bg-blue-600'
              }`}>
                {isSellerie ? '🥬' : '📖'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {isSellerie ? 'Sellerie-Momente' : 'Abizeitung & Momente'}
                  </h2>
                  {isSellerie && (
                    <span className="bg-[#1B5E20] border border-[#4CAF50]/60 text-[#81C784] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      🥬 Sellerie
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Sammelt Texte, Erinnerungen & Fotos für das gedruckte Abibuch!</p>
              </div>
            </div>

            {/* Filter-Chips (scrollen mit) */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
              <div className="flex gap-2">
                {[
                  { id: 'ALL', label: 'Alle Beiträge' },
                  { id: 'Zitate', label: '🗣️ Zitate' },
                  { id: 'Lehrer', label: '👨‍🏫 Lehrer' },
                  { id: 'Kursfahrten', label: '🚌 Kursfahrten' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterCategory(f.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition border ${
                      filterCategory === f.id
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#131E35] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOnlyPrintSelected(!onlyPrintSelected)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition border flex items-center gap-1 ${
                  onlyPrintSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-[#131E35] text-slate-400 border-slate-800'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" /> Nur Abibuch
              </button>
            </div>

            {/* Beitrag verfassen */}
            <form onSubmit={handleCreatePost} className="bg-[#131E35] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder="Teile Erinnerungen, Sprüche oder Zitate..."
                rows={3}
                className="w-full bg-[#0D1527] border border-slate-700/60 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none transition"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <select
                    value={newPostCategory}
                    onChange={e => setNewPostCategory(e.target.value)}
                    className="bg-[#0D1527] border border-slate-700 text-xs font-semibold text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="Zitate">🗣️ Zitate</option>
                    <option value="Lehrer">👨‍🏫 Lehrer-Sprüche</option>
                    <option value="Kursfahrten">🚌 Kursfahrten</option>
                    <option value="Ankündigung">📢 Ankündigung</option>
                  </select>

                  <label className="cursor-pointer bg-[#0D1527] border border-slate-700 text-xs font-semibold text-slate-300 px-3 py-2 rounded-xl flex items-center gap-1.5 transition">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>{newPostImage ? 'Foto gewählt' : 'Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = () => setNewPostImage(r.result as string);
                          r.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-md"
                >
                  <Plus className="w-4 h-4" /> Veröffentlichen
                </button>
              </div>
            </form>

            {/* Beiträge Liste */}
            <div className="space-y-3.5">
              {posts
                .filter(p => filterCategory === 'ALL' || p.category === filterCategory)
                .filter(p => !onlyPrintSelected || p.isSelectedForPrint)
                .map(post => {
                  const hasVoted = post.votedUserIds.includes('user_me');
                  return (
                    <div key={post.id} className="bg-[#131E35] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3 relative">
                      {post.isSelectedForPrint && (
                        <div className="absolute top-4 right-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Bookmark className="w-3 h-3 fill-amber-400" /> Fürs Abibuch markiert
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0D1527] border border-slate-700 flex items-center justify-center text-lg">
                          {post.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {post.author}
                            <span className="text-[10px] text-slate-400 font-normal">• {post.date}</span>
                          </div>
                          <span className="text-[10px] text-blue-400 font-semibold">{post.category}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed">{post.content}</p>

                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="Foto" className="w-full max-h-72 object-cover rounded-xl border border-slate-800" />
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        {/* 1-Klick Toggle Stimmabgabe */}
                        <button
                          onClick={() => toggleUpvote(post.id)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                            hasVoted
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                              : 'bg-[#0D1527] text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white' : ''}`} />
                          <span>{post.votesCount === 1 ? '1 Stimme' : `${post.votesCount} Stimmen`}</span>
                        </button>

                        <button
                          onClick={() => togglePrintStatus(post.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                            post.isSelectedForPrint
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'text-slate-400 border-transparent hover:text-white'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${post.isSelectedForPrint ? 'fill-amber-400' : ''}`} />
                          <span className="hidden sm:inline">Abibuch-Druck</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TERMINE & SCHULFERIEN (RLP) */}
        {/* ========================================================================= */}
        {currentTab === 'events' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" /> Prüfungstermine & Events 2026
              </h3>
              <p className="text-xs text-slate-400 mb-4">Abiturprüfungen, Mottowoche und Abiball</p>

              <div className="space-y-2.5">
                {events.map(ev => (
                  <div key={ev.id} className="bg-[#0D1527] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        ev.isExam ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {ev.isExam ? 'ABI' : 'FEST'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{ev.title}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>📅 {ev.date}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {ev.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offizielle Ferien Rheinland-Pfalz (OHNE PFINGSTFERIEN) */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <span>🏖️</span> Schulferien 2026/2027 (Rheinland-Pfalz)
              </h3>
              <p className="text-xs text-slate-400 mb-3">Offizieller Kalender (RLP hat keine Pfingstferien)</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rlpSchoolHolidays.map(h => (
                  <div key={h.title} className="bg-[#0D1527] p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                    <span className="text-2xl">{h.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{h.title}</div>
                      <div className="text-[11px] text-blue-400 font-mono mt-0.5">{h.dates}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: STUFENCHAT */}
        {/* ========================================================================= */}
        {currentTab === 'chat' && (
          <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[70vh] animate-fadeIn">
            <div className="border-b border-slate-800 pb-3 mb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Stufenchat Abi 2026</h3>
                <p className="text-[11px] text-slate-400">Jahrgangsinterner Austausch & Absprachen</p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                Aktiv
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-2.5 ${m.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full bg-[#0D1527] border border-slate-700 flex items-center justify-center text-sm flex-shrink-0">
                    {m.avatar}
                  </div>
                  <div className={`max-w-[78%] p-3 rounded-2xl text-xs ${
                    m.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#0D1527] text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    {!m.isMe && <div className="font-bold text-[10px] text-blue-400 mb-1">{m.sender}</div>}
                    <p className="leading-relaxed">{m.text}</p>
                    <div className={`text-[9px] mt-1 text-right ${m.isMe ? 'text-blue-200' : 'text-slate-500'}`}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendChatMessage} className="pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Nachricht an die Stufe schreiben..."
                className="flex-1 bg-[#0D1527] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: EINSTELLUNGEN & PROFIL */}
        {/* ========================================================================= */}
        {currentTab === 'settings' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" /> Profil & Avatar
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Dein Anzeigename</label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full bg-[#0D1527] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-2">Avatar auswählen</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => setUserAvatar(av)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition border ${
                        userAvatar === av ? 'bg-blue-600 border-blue-400 scale-110' : 'bg-[#0D1527] border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">Sellerie-Modus</span>
                  <p className="text-[11px] text-slate-400">Aktiviert das grüne Sellerie-Badge und die Sellerie-Momente</p>
                </div>
                <button
                  onClick={() => setIsSellerie(!isSellerie)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                    isSellerie ? 'bg-[#1B5E20] text-[#81C784] border-[#4CAF50]/60' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isSellerie ? 'Aktiv 🥬' : 'Aus'}
                </button>
              </div>
            </div>

            {/* Zugangsschlüssel */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Stufen-Zugangsschlüssel
              </h3>
              <p className="text-xs text-slate-400">
                Teile diesen Schlüssel mit deinen Mitschülern, damit sie deinem Jahrgang beitreten können:
              </p>
              <div className="flex items-center justify-between bg-[#0D1527] p-3 rounded-xl border border-slate-800">
                <span className="font-mono text-sm font-bold text-amber-300">{joinKey}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(joinKey);
                    notify('Zugangsschlüssel kopiert!');
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Kopieren
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* UNTERE NAVIGATION BAR (FIXIERT) */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D1527]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {[
            { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
            { id: 'grades', label: 'MSS Noten', icon: GraduationCap },
            { id: 'yearbook', label: isSellerie ? 'Momente' : 'Abizeitung', icon: BookOpen },
            { id: 'events', label: 'Termine', icon: CalendarDays },
            { id: 'chat', label: 'Chat', icon: MessageSquare }
          ].map(item => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as any)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                  active ? 'text-blue-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
