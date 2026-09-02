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
  Image as ImageIcon
} from 'lucide-react';

// ==========================================
// TYPEN & MODELLE
// ==========================================
interface SubjectGrade {
  id: string;
  name: string;
  isLk: boolean; // true = 3 LKs (Rheinland-Pfalz MSS)
  h1: number | '';
  h2: number | '';
  h3: number | '';
  h4: number | '';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'grades' | 'yearbook' | 'events' | 'chat' | 'settings'>('dashboard');

  // Benutzer-Zustand
  const [userName, setUserName] = useState<string>('Leon Hillger');
  const [userRole, setUserRole] = useState<string>('CREATOR_ADMIN');
  const [userAvatar, setUserAvatar] = useState<string>('🎓');
  const [joinKey] = useState<string>('ABI-2026-MSS-RP');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  // ==========================================
  // NOTEN & MSS RLP BERECHNUNG
  // ==========================================
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
    p1: 13, // LK 1 schriftlich
    p2: 14, // LK 2 schriftlich
    p3: 12, // LK 3 schriftlich
    p4: 11, // GK mündlich / schriftlich
    p5: 12  // GK mündlich
  });

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIsLk, setNewSubIsLk] = useState(false);

  // MSS RLP Auswertung
  const mssEvaluation = useMemo(() => {
    let lkSum = 0;
    let lkCount = 0;
    let lkDeficits = 0;

    let gkSum = 0;
    let gkCount = 0;
    let gkDeficits = 0;

    subjects.forEach(s => {
      [s.h1, s.h2, s.h3, s.h4].forEach(val => {
        if (typeof val === 'number') {
          if (s.isLk) {
            lkSum += val * 2; // In RLP MSS LKs doppelt gewertet
            lkCount++;
            if (val < 5) lkDeficits++;
          } else {
            gkSum += val;
            gkCount++;
            if (val < 5) gkDeficits++;
          }
        }
      });
    });

    const block1Total = lkSum + gkSum;
    const block2Total = (examGrades.p1 + examGrades.p2 + examGrades.p3 + examGrades.p4 + examGrades.p5) * 4;
    const totalPoints = block1Total + block2Total;

    // KMK Formel
    let grade = "1.0";
    if (totalPoints >= 823) grade = "1.0";
    else if (totalPoints <= 300) grade = "4.0";
    else {
      const val = (17 / 3) - (totalPoints / 180);
      grade = Math.max(1.0, Math.min(4.0, val)).toFixed(1);
    }

    return {
      block1: block1Total,
      block2: block2Total,
      totalPoints,
      grade,
      lkDeficits,
      gkDeficits,
      totalDeficits: lkDeficits + gkDeficits,
      isPassed: block1Total >= 200 && block2Total >= 100 && lkDeficits <= 3 && (lkDeficits + gkDeficits) <= 7
    };
  }, [subjects, examGrades]);

  // ==========================================
  // PINNWAND & FEIERMOMENTE
  // ==========================================
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Dr. Weber (Physik LK)',
      authorRole: 'Lehrer',
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
      authorRole: 'Ersteller',
      avatar: '🎓',
      content: 'Die Planung für den Abistreich 2026 steht! Treffen für alle Helfer am Freitag nach der 6. Stunde in der Aula.',
      category: 'Ankündigung',
      votesCount: 12,
      votedUserIds: ['me'],
      isSelectedForPrint: true,
      date: 'Heute, 10:15'
    }
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Zitate');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const toggleUpvote = (postId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasVoted = p.votedUserIds.includes('me');
        return {
          ...p,
          votesCount: hasVoted ? p.votesCount - 1 : p.votesCount + 1,
          votedUserIds: hasVoted ? p.votedUserIds.filter(id => id !== 'me') : [...p.votedUserIds, 'me']
        };
      }
      return p;
    }));
  };

  const togglePrintBookmark = (postId: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSelectedForPrint: !p.isSelectedForPrint } : p));
    notify('Druck-Markierung für das Abibuch aktualisiert!');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    const newEntry: Post = {
      id: Date.now(),
      author: userName,
      authorRole: userRole === 'CREATOR_ADMIN' ? 'Ersteller' : 'Schüler',
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
    notify('Beitrag erfolgreich auf der Pinnwand geteilt!');
  };

  // ==========================================
  // TERMINE & FERIEN (RLP)
  // ==========================================
  const [events, setEvents] = useState<CalendarEvent[]>([
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

  // ==========================================
  // STUFENCHAT
  // ==========================================
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

  // ==========================================
  // COUNTDOWN RECHNER
  // ==========================================
  const daysUntilAbi = useMemo(() => {
    const target = new Date('2026-04-28').getTime();
    const now = new Date().getTime();
    const diff = target - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-28">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-blue-400/30 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          {showNotification}
        </div>
      )}

      {/* Haupt-Container */}
      <main className="max-w-2xl mx-auto px-4 pt-6">

        {/* ==================================================== */}
        {/* TAB: DASHBOARD (ÜBERSICHT) */}
        {/* ==================================================== */}
        {currentTab === 'dashboard' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Profil Card */}
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
                    <h2 className="text-base font-bold text-white leading-none">{userName}</h2>
                    {userRole === 'CREATOR_ADMIN' && (
                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        👑 Ersteller
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <span>🍇</span> Gymnasium 2026 • Rheinland-Pfalz (MSS)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(joinKey);
                  notify(`Zugangsschlüssel kopiert: ${joinKey}`);
                }}
                className="bg-[#1A2744] hover:bg-[#203257] border border-slate-700/60 text-amber-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
              >
                🔑 {joinKey}
              </button>
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

            {/* Noten- & Schnitt Vorschau Widget */}
            <div
              onClick={() => setCurrentTab('grades')}
              className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg cursor-pointer hover:border-blue-500/50 transition group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dein Abiturschnitt (MSS RLP)</span>
                  <div className="text-5xl font-black text-white mt-1 group-hover:text-blue-400 transition">
                    {mssEvaluation.grade}
                  </div>
                </div>
                <div className="bg-blue-900/40 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1.5 rounded-xl">
                  {mssEvaluation.totalPoints} / 900 Pkt
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
                <div className="bg-[#0D1527] p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Block I (Halbjahre)</div>
                  <div className="text-sm font-bold text-blue-400 mt-0.5">{mssEvaluation.block1} / 600 Pkt</div>
                </div>
                <div className="bg-[#0D1527] p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Unterkurse (&lt; 05 Pkt)</div>
                  <div className={`text-sm font-bold mt-0.5 ${mssEvaluation.totalDeficits <= 7 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mssEvaluation.totalDeficits} / 7 erlaubt
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Noten', icon: GraduationCap, tab: 'grades', color: 'text-blue-400' },
                { label: 'Pinnwand', icon: BookOpen, tab: 'yearbook', color: 'text-amber-400' },
                { label: 'Termine', icon: CalendarDays, tab: 'events', color: 'text-emerald-400' },
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

            {/* Letzte Pinnwand-Beiträge Preview */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Neueste Abizeitung-Einträge
                </h3>
                <button onClick={() => setCurrentTab('yearbook')} className="text-xs text-blue-400 font-semibold hover:underline">
                  Alle ansehen
                </button>
              </div>
              <div className="space-y-2.5">
                {posts.slice(0, 2).map(p => (
                  <div key={p.id} className="bg-[#0D1527] p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="flex justify-between font-bold text-slate-300 mb-1">
                      <span>{p.avatar} {p.author}</span>
                      <span className="text-amber-400">👍 {p.votesCount}</span>
                    </div>
                    <p className="text-slate-400 line-clamp-2">{p.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: NOTENRECHNER (MSS RLP) */}
        {/* ==================================================== */}
        {currentTab === 'grades' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-gradient-to-br from-blue-900/60 via-[#131E35] to-[#131E35] border border-blue-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Abiturschnitt (Rheinland-Pfalz)</span>
                  <div className="text-6xl font-black text-white mt-1 tracking-tight">
                    {mssEvaluation.grade}
                  </div>
                </div>
                <div className="bg-blue-600/30 text-blue-300 border border-blue-400/40 text-xs font-bold px-3 py-1.5 rounded-xl">
                  MSS (3 LKs doppelt)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Gesamtpunkte</span>
                  <div className="text-xl font-bold text-amber-400">{mssEvaluation.totalPoints} / 900 Pkt</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Status</span>
                  <div className={`text-sm font-bold flex items-center gap-1 mt-1 ${mssEvaluation.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mssEvaluation.isPassed ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {mssEvaluation.isPassed ? 'Bestanden' : 'Gefährdet'}
                  </div>
                </div>
              </div>
            </div>

            {/* Fächer-Tabelle */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Halbjahresnoten (MSS 11 & 12)</h3>
                  <p className="text-xs text-slate-400">Punkte von 00 bis 15 pro Halbjahr eingeben</p>
                </div>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Fach hinzufügen
                </button>
              </div>

              {/* Fach hinzufügen Dialog */}
              {showAddSubject && (
                <div className="bg-[#0D1527] border border-blue-500/40 p-4 rounded-2xl space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-blue-300 uppercase">Neues Fach anlegen</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="z. B. Französisch"
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      className="flex-1 bg-[#131E35] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
                        notify('Fach hinzugefügt!');
                      }}
                      className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-xl"
                    >
                      Speichern
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
                      {(['h1', 'h2', 'h3', 'h4'] as const).map((h, i) => (
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

            {/* Prüfungsfächer Block II */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-base font-bold text-white">Block II (Abiturprüfungen)</h3>
              <p className="text-xs text-slate-400">Ergebnisse der 5 Abiturprüfungen (je 4-fach gewertet)</p>
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

        {/* ==================================================== */}
        {/* TAB: PINNWAND & FEIERMOMENTE (YEARBOOK) */}
        {/* ==================================================== */}
        {currentTab === 'yearbook' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 via-blue-600/20 to-indigo-600/20 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Abizeitung & Momente</h2>
                <p className="text-xs text-slate-400">Sammelt Zitate, Geschichten und Fotos für das gedruckte Abibuch!</p>
              </div>
            </div>

            {/* Beitrag verfassen */}
            <form onSubmit={handleCreatePost} className="bg-[#131E35] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder="Lustiges Zitat, Anekdote oder Moment aus dem Unterricht..."
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

                  {/* Foto-Upload */}
                  <label className="cursor-pointer bg-[#0D1527] border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 px-3 py-2 rounded-xl flex items-center gap-1.5 transition">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>{newPostImage ? 'Foto gewählt' : 'Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setNewPostImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-md"
                >
                  <Plus className="w-4 h-4" /> Posten
                </button>
              </div>
            </form>

            {/* Filter-Kategorien */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['ALL', 'Zitate', 'Lehrer', 'Kursfahrten', 'Ankündigung'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition border ${
                    filterCategory === cat
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-[#131E35] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'Alle Beiträge' : cat}
                </button>
              ))}
            </div>

            {/* Beiträge Liste */}
            <div className="space-y-4">
              {posts
                .filter(p => filterCategory === 'ALL' || p.category === filterCategory)
                .map(post => {
                  const hasVoted = post.votedUserIds.includes('me');
                  return (
                    <div key={post.id} className="bg-[#131E35] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3 relative">
                      {post.isSelectedForPrint && (
                        <div className="absolute top-4 right-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Bookmark className="w-3 h-3 fill-amber-400" /> Fürs Abibuch
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
                        <img src={post.imageUrl} alt="Upload" className="w-full max-h-72 object-cover rounded-xl border border-slate-800" />
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        {/* 1-Klick Upvote Toggle Button */}
                        <button
                          onClick={() => toggleUpvote(post.id)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                            hasVoted
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                              : 'bg-[#0D1527] text-slate-300 border-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white' : ''}`} />
                          <span>{post.votesCount} {post.votesCount === 1 ? 'Stimme' : 'Stimmen'}</span>
                        </button>

                        <button
                          onClick={() => togglePrintBookmark(post.id)}
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

        {/* ==================================================== */}
        {/* TAB: TERMINE & FERIEN (EVENTS) */}
        {/* ==================================================== */}
        {currentTab === 'events' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" /> Wichtige Prüfungstermine & Events
              </h3>
              <p className="text-xs text-slate-400 mb-4">Abiturprüfungen, Mottowoche, Abiball und Meilensteine</p>

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

            {/* Schulferien Rheinland-Pfalz */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <span>🏖️</span> Schulferien 2026/2027 (Rheinland-Pfalz)
              </h3>
              <p className="text-xs text-slate-400 mb-3">Offizielle Ferientermine (keine Pfingstferien in RLP)</p>

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

        {/* ==================================================== */}
        {/* TAB: STUFENCHAT */}
        {/* ==================================================== */}
        {currentTab === 'chat' && (
          <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[70vh] animate-fadeIn">
            <div className="border-b border-slate-800 pb-3 mb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Stufenchat Abi 2026</h3>
                <p className="text-[11px] text-slate-400">Gemeinsam organisieren, Fragen stellen & austauschen</p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>

            {/* Chat Nachrichten */}
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

            {/* Input Form */}
            <form onSubmit={sendChatMessage} className="pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Nachricht an den Jahrgang..."
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

        {/* ==================================================== */}
        {/* TAB: EINSTELLUNGEN & PROFIL */}
        {/* ==================================================== */}
        {currentTab === 'settings' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" /> Profil & Avatar anpassen
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
            </div>

            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Stufen-Zugangsschlüssel
              </h3>
              <p className="text-xs text-slate-400">
                Teile diesen Schlüssel mit deinen Mitschülern, damit sie der Stufe beitreten können:
              </p>
              <div className="flex items-center justify-between bg-[#0D1527] p-3 rounded-xl border border-slate-800">
                <span className="font-mono text-sm font-bold text-amber-300">{joinKey}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(joinKey);
                    notify('Schlüssel kopiert!');
                  }}
                  className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  Kopieren
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================================================== */}
      {/* UNTERE NAVIGATION BAR (FIXIERT) */}
      {/* ==================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D1527]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {[
            { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
            { id: 'grades', label: 'MSS Noten', icon: GraduationCap },
            { id: 'yearbook', label: 'Abizeitung', icon: BookOpen },
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
