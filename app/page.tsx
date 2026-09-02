'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Settings,
  Plus,
  ThumbsUp,
  Bookmark,
  Trash2,
  AlertTriangle,
  Check,
  User,
  Shield,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Download,
  Upload,
  Globe,
  Users,
  LogOut
} from 'lucide-react';

// =========================================================================
// DATENMODELLE
// =========================================================================
interface SubjectGrade {
  id: string;
  name: string;
  isLk: boolean;
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

interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const AVATARS = ["🎓", "🦁", "🦊", "🚀", "⚡", "🍀", "🦉", "🎨", "👑", "🔥", "🎧", "🥬"];

const BUNDESLAENDER = [
  { id: 'RP', name: 'Rheinland-Pfalz', systemTitle: 'MSS (Mainzer Studienstufe)' },
  { id: 'NW', name: 'Nordrhein-Westfalen', systemTitle: 'APO-GOSt' },
  { id: 'BY', name: 'Bayern', systemTitle: 'G9 Oberstufe' },
  { id: 'BW', name: 'Baden-Württemberg', systemTitle: 'Gymnasiale Oberstufe (NGVO)' }
];

export default function AbiHubApp() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'grades' | 'yearbook' | 'events' | 'settings'>('dashboard');

  // Benutzer- & Stufen-Zustand
  const [userName, setUserName] = useState<string>('Leon Hillger');
  const [userRole, setUserRole] = useState<string>('CREATOR_ADMIN');
  const [userAvatar, setUserAvatar] = useState<string>('🎓');
  const [isSellerie, setIsSellerie] = useState<boolean>(true);
  
  const [joinKey] = useState<string>('ABI-2026-MSS-RP');
  const [selectedState, setSelectedState] = useState<string>('RP');

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
        setSelectedState(u.state || 'RP');
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

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('abihub_user', JSON.stringify({ name: userName, avatar: userAvatar, isSellerie, state: selectedState }));
  }, [userName, userAvatar, isSellerie, selectedState, isLoaded]);

  // =========================================================================
  // NOTEN & RECHNER
  // =========================================================================
  const [subjects, setSubjects] = useState<SubjectGrade[]>([
    { id: '1', name: 'Mathematik', isLk: true, h1: 13, h2: 12, h3: 14, h4: 13 },
    { id: '2', name: 'Physik', isLk: true, h1: 14, h2: 14, h3: 15, h4: 14 },
    { id: '3', name: 'Englisch', isLk: true, h1: 11, h2: 12, h3: 12, h4: 11 },
    { id: '4', name: 'Deutsch', isLk: false, h1: 11, h2: 10, h3: 11, h4: 12 },
    { id: '5', name: 'Geschichte', isLk: false, h1: 12, h2: 13, h3: 12, h4: 12 }
  ]);

  const [examGrades, setExamGrades] = useState({ p1: 13, p2: 14, p3: 12, p4: 11, p5: 12 });

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('abihub_subjects', JSON.stringify(subjects));
    localStorage.setItem('abihub_exams', JSON.stringify(examGrades));
  }, [subjects, examGrades, isLoaded]);

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIsLk, setNewSubIsLk] = useState(false);

  const stateInfo = BUNDESLAENDER.find(b => b.id === selectedState) || BUNDESLAENDER[0];

  const mss = useMemo(() => {
    let lkPoints = 0, lkDeficits = 0;
    let gkPoints = 0, gkDeficits = 0;

    subjects.forEach(sub => {
      [sub.h1, sub.h2, sub.h3, sub.h4].forEach(val => {
        if (typeof val === 'number') {
          if (sub.isLk) {
            lkPoints += val * 2; // RLP LK-Doppelwertung
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
  // PINNWAND
  // =========================================================================
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Dr. Weber',
      authorRole: 'ADMIN',
      avatar: '🦉',
      content: '„Wenn das Pendel heute nicht schwingt, verschieben wir die Gravitation auf nächste Woche!“',
      category: 'Zitate',
      votesCount: 19,
      votedUserIds: [],
      isSelectedForPrint: true,
      date: 'Gestern, 14:20'
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

  const toggleUpvote = (postId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasVoted = p.votedUserIds.includes('user_me');
        const newVotedList = hasVoted ? p.votedUserIds.filter(id => id !== 'user_me') : [...p.votedUserIds, 'user_me'];
        return { ...p, votesCount: newVotedList.length, votedUserIds: newVotedList };
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
  // TERMINE
  // =========================================================================
  const [events] = useState<CalendarEvent[]>([
    { id: '1', title: 'Abiturprüfung Mathematik (LK)', date: '2026-04-28', location: 'Turnhalle', isExam: true },
    { id: '2', title: 'Abiturprüfung Deutsch', date: '2026-05-04', location: 'Aula', isExam: true },
    { id: '3', title: 'Abiball 2026', date: '2026-06-27', location: 'Rheingoldhalle Mainz', isExam: false }
  ]);

  const rlpSchoolHolidays = [
    { title: 'Herbstferien', dates: '05.10. – 16.10.2026', emoji: '🍂' },
    { title: 'Weihnachtsferien', dates: '23.12. – 08.01.2027', emoji: '🎄' },
    { title: 'Osterferien', dates: '22.03. – 02.04.2027', emoji: '🌸' },
    { title: 'Sommerferien', dates: '28.06. – 06.08.2027', emoji: '🏖️' }
  ];

  const daysUntilAbi = useMemo(() => {
    const target = new Date('2026-04-28').getTime();
    return Math.max(0, Math.ceil((target - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  }, []);

  // =========================================================================
  // SETTINGS LOGIC (BACKUP & RESTORE)
  // =========================================================================
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const data = {
      user: { name: userName, avatar: userAvatar, isSellerie, state: selectedState },
      subjects,
      examGrades,
      posts
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AbiHub_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Backup erfolgreich heruntergeladen!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.user) {
          setUserName(data.user.name);
          setUserAvatar(data.user.avatar);
          setIsSellerie(data.user.isSellerie);
          setSelectedState(data.user.state || 'RP');
        }
        if (data.subjects) setSubjects(data.subjects);
        if (data.examGrades) setExamGrades(data.examGrades);
        if (data.posts) setPosts(data.posts);
        notify('Backup erfolgreich wiederhergestellt!');
      } catch (error) {
        notify('Fehler: Ungültige Backup-Datei.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // =========================================================================
  // UI RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-28">
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-blue-400/30 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          {notification}
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 pt-6">
        
        {/* TAB: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header */}
            <div className="bg-[#131E35] border border-slate-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => setCurrentTab('settings')}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl shadow-md"
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
                    <span>🍇</span> Gymnasium 2026 • {stateInfo.name}
                  </p>
                </div>
              </div>
              {isSellerie && (
                <div className="bg-[#1B5E20] border border-[#4CAF50]/60 text-[#81C784] text-xs font-bold px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
                  🥬 Sellerie
                </div>
              )}
            </div>

            {/* Countdown */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-5 shadow-xl text-white relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">Abitur Countdown 2026</span>
                  <div className="text-3xl font-black mt-0.5 tracking-tight flex items-baseline gap-2">
                    {daysUntilAbi} Tage
                  </div>
                  <p className="text-xs text-blue-100/90 mt-1">Zielgerade: 28. April 2026 (Mathe LK)</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl">
                  ⏳
                </div>
              </div>
            </div>

            {/* Noten Widget */}
            <div onClick={() => setCurrentTab('grades')} className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg cursor-pointer hover:border-blue-500/50 transition group">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abiturschnitt ({stateInfo.id})</span>
                  <div className="text-5xl font-black text-white mt-1 group-hover:text-blue-400 transition">{mss.grade}</div>
                </div>
                <div className="bg-slate-800 border border-slate-700 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  {mss.totalPoints} / 900 Pkt
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'MSS Noten', icon: GraduationCap, tab: 'grades', color: 'text-blue-400' },
                { label: isSellerie ? 'Sellerie-Momente' : 'Abizeitung', icon: BookOpen, tab: 'yearbook', color: 'text-amber-400' },
                { label: 'Termine', icon: CalendarDays, tab: 'events', color: 'text-emerald-400' },
                { label: 'Einstellungen', icon: Settings, tab: 'settings', color: 'text-slate-400' }
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

        {/* TAB: NOTENRECHNER */}
        {currentTab === 'grades' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-gradient-to-br from-blue-900/60 via-[#131E35] to-[#131E35] border border-blue-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Abiturschnitt ({stateInfo.name})</span>
                  <div className="text-6xl font-black text-white mt-1 tracking-tight">{mss.grade}</div>
                </div>
                <div className="bg-slate-800/90 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
                  {stateInfo.systemTitle}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400">Gesamtpunkte</span>
                  <div className="text-xl font-bold text-amber-400">{mss.totalPoints} / 900</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Status</span>
                  <div className={`text-sm font-bold flex items-center gap-1 mt-1 ${mss.isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mss.isPassed ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {mss.isPassed ? 'Zulassung erreicht' : 'Unterkurse'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Halbjahresnoten (11 & 12)</h3>
                  <p className="text-xs text-slate-400">Punkte von 00 bis 15 eingeben</p>
                </div>
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Neues Fach
                </button>
              </div>

              {showAddSubject && (
                <div className="bg-[#0D1527] border border-blue-500/40 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-blue-300">Neues Fach</h4>
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
                      className={`text-xs font-bold px-3 py-2 rounded-xl border ${newSubIsLk ? 'bg-amber-500 text-white border-amber-400' : 'bg-[#131E35] text-slate-300 border-slate-700'}`}
                    >
                      {newSubIsLk ? 'LK' : 'GK'}
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
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 flex-1 max-w-[200px]">
                      {(['h1', 'h2', 'h3', 'h4'] as const).map((h) => (
                        <input
                          key={h}
                          type="number"
                          min="0" max="15"
                          value={s[h]}
                          onChange={e => {
                            const val = e.target.value === '' ? '' : Math.min(15, Math.max(0, parseInt(e.target.value) || 0));
                            setSubjects(subjects.map(item => item.id === s.id ? { ...item, [h]: val } : item));
                          }}
                          className={`w-full text-center bg-[#131E35] border text-xs font-bold py-1.5 rounded-lg focus:outline-none focus:border-blue-500 ${Number(s[h]) < 5 ? 'border-rose-500/60 text-rose-400' : 'border-slate-700 text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <button onClick={() => setSubjects(subjects.filter(item => item.id !== s.id))} className="text-slate-500 hover:text-rose-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-base font-bold text-white">Block II (Abiturprüfungen)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {[{ key: 'p1', label: '1. LK' }, { key: 'p2', label: '2. LK' }, { key: 'p3', label: '3. LK' }, { key: 'p4', label: '4. Fach' }, { key: 'p5', label: '5. Mündlich' }].map(p => (
                  <div key={p.key} className="bg-[#0D1527] p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">{p.label}</span>
                    <input
                      type="number" min="0" max="15"
                      value={(examGrades as any)[p.key]}
                      onChange={e => setExamGrades({ ...examGrades, [p.key]: parseInt(e.target.value) || 0 })}
                      className="w-full text-center bg-[#131E35] border border-slate-700 rounded-lg py-1 text-sm font-bold text-amber-300 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PINNWAND */}
        {currentTab === 'yearbook' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-600/10 via-amber-500/10 to-indigo-600/10 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md ${isSellerie ? 'bg-[#1B5E20] border border-[#4CAF50]/60' : 'bg-blue-600'}`}>
                {isSellerie ? '🥬' : '📖'}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{isSellerie ? 'Sellerie-Momente' : 'Abizeitung & Momente'}</h2>
                <p className="text-xs text-slate-400">Sammelt Zitate und Fotos für das gedruckte Abibuch!</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
              <div className="flex gap-2">
                {['ALL', 'Zitate', 'Lehrer', 'Kursfahrten'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterCategory(f)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap border ${filterCategory === f ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#131E35] text-slate-400 border-slate-800'}`}
                  >
                    {f === 'ALL' ? 'Alle Beiträge' : f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOnlyPrintSelected(!onlyPrintSelected)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1 ${onlyPrintSelected ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-[#131E35] text-slate-400 border-slate-800'}`}
              >
                <Bookmark className="w-3.5 h-3.5" /> Nur Abibuch
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="bg-[#131E35] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder="Teile Erinnerungen, Sprüche oder Zitate..."
                rows={3}
                className="w-full bg-[#0D1527] border border-slate-700/60 rounded-xl p-3 text-sm text-white focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <select
                  value={newPostCategory}
                  onChange={e => setNewPostCategory(e.target.value)}
                  className="bg-[#0D1527] border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2"
                >
                  <option value="Zitate">🗣️ Zitate</option>
                  <option value="Lehrer">👨‍🏫 Lehrer</option>
                  <option value="Kursfahrten">🚌 Kursfahrten</option>
                </select>
                <button type="submit" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Posten
                </button>
              </div>
            </form>

            <div className="space-y-3.5">
              {posts.filter(p => filterCategory === 'ALL' || p.category === filterCategory).filter(p => !onlyPrintSelected || p.isSelectedForPrint).map(post => {
                const hasVoted = post.votedUserIds.includes('user_me');
                return (
                  <div key={post.id} className="bg-[#131E35] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3 relative">
                    {post.isSelectedForPrint && (
                      <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Bookmark className="w-3 h-3 fill-amber-400" /> Fürs Abibuch
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0D1527] flex items-center justify-center text-lg">{post.avatar}</div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">{post.author}</div>
                        <span className="text-[10px] text-blue-400 font-semibold">{post.category}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200">{post.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button onClick={() => toggleUpvote(post.id)} className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 ${hasVoted ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#0D1527] text-slate-300 border-slate-700'}`}>
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white' : ''}`} />
                        <span>{post.votesCount} Stimmen</span>
                      </button>
                      <button onClick={() => togglePrintStatus(post.id)} className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${post.isSelectedForPrint ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'border-transparent text-slate-400'}`}>
                        <Bookmark className={`w-3.5 h-3.5 ${post.isSelectedForPrint ? 'fill-amber-400' : ''}`} />
                        <span>Druck</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: TERMINE */}
        {currentTab === 'events' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" /> Wichtige Termine 2026
              </h3>
              <div className="space-y-2.5">
                {events.map(ev => (
                  <div key={ev.id} className="bg-[#0D1527] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${ev.isExam ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {ev.isExam ? 'ABI' : 'FEST'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{ev.title}</div>
                        <div className="text-xs text-slate-400">📅 {ev.date} • {ev.location}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: EINSTELLUNGEN (VOLLSTÄNDIG) */}
        {currentTab === 'settings' && (
          <div className="space-y-5 animate-fadeIn pb-10">
            
            {/* 1. Profil & Avatar */}
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
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition border ${userAvatar === av ? 'bg-blue-600 border-blue-400 scale-110' : 'bg-[#0D1527] border-slate-800'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200">Sellerie-Modus</span>
                  <p className="text-[11px] text-slate-400">Aktiviert das grüne Badge & Sellerie-Momente</p>
                </div>
                <button
                  onClick={() => setIsSellerie(!isSellerie)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${isSellerie ? 'bg-[#1B5E20] text-[#81C784] border-[#4CAF50]/60' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                >
                  {isSellerie ? 'Aktiv 🥬' : 'Aus'}
                </button>
              </div>
            </div>

            {/* 2. Stufen-Konfiguration & Zugang */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Jahrgangs-Einstellungen
              </h3>
              
              <div>
                <label className="text-xs text-slate-400 block mb-1">Schulsystem / Bundesland</label>
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="w-full bg-[#0D1527] border border-slate-700 text-sm font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                >
                  {BUNDESLAENDER.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.systemTitle})</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Ändert die Formeln für den Notenrechner (z.B. LK-Wertung).</p>
              </div>

              <div className="pt-3">
                <label className="text-xs text-slate-400 block mb-1">Zugangsschlüssel für Mitschüler</label>
                <div className="flex items-center justify-between bg-[#0D1527] p-3 rounded-xl border border-slate-800">
                  <span className="font-mono text-sm font-bold text-amber-300">{joinKey}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(joinKey); notify('Schlüssel kopiert!'); }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Kopieren
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Mitglieder */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Stufenmitglieder
              </h3>
              <p className="text-xs text-slate-400 mb-4">Du und andere Teilnehmer des Jahrgangs.</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-[#0D1527] p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{userAvatar}</span>
                    <span className="text-sm font-bold text-white">{userName} (Du)</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">Ersteller</span>
                </div>
                <div className="flex items-center justify-between bg-[#0D1527] p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🦉</span>
                    <span className="text-sm font-bold text-white">Dr. Weber</span>
                  </div>
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">Admin</span>
                </div>
              </div>
            </div>

            {/* 4. Backup & Restore */}
            <div className="bg-[#131E35] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Backup & Datenrettung
              </h3>
              <p className="text-xs text-slate-400 mb-2">Lade deine Noten & Beiträge als Datei herunter oder stelle sie wieder her.</p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleExportBackup}
                  className="flex-1 bg-[#0D1527] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Exportieren
                </button>
                
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-[#0D1527] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Upload className="w-4 h-4" /> Importieren
                </button>
              </div>
            </div>

            {/* 5. Danger Zone */}
            <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-base font-bold text-rose-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Gefahrenzone
              </h3>
              <p className="text-xs text-slate-400">Diese Aktionen können nicht rückgängig gemacht werden.</p>
              <button className="w-full bg-rose-900/40 hover:bg-rose-600 border border-rose-700 text-rose-100 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition">
                <LogOut className="w-4 h-4" /> Stufe verlassen / Abmelden
              </button>
            </div>
            
          </div>
        )}

      </main>

      {/* UNTERE NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D1527]/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {[
            { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
            { id: 'grades', label: 'Noten', icon: GraduationCap },
            { id: 'yearbook', label: isSellerie ? 'Momente' : 'Abizeitung', icon: BookOpen },
            { id: 'events', label: 'Termine', icon: CalendarDays },
            { id: 'settings', label: 'Optionen', icon: Settings }
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
