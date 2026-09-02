'use client';

import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle2, ThumbsUp, Sparkles, School, Plus } from 'lucide-react';

export default function HomePage() {
  const [tab, setTab] = useState<'calculator' | 'yearbook'>('calculator');

  // MSS RLP Notenrechner State
  const [gks, setGks] = useState<number>(11); // Durchschnitt Grundkurse
  const [lks, setLks] = useState<number>(12); // Durchschnitt Leistungskurse
  const [exams, setExams] = useState<number>(11); // Prüfungen

  // Block I: 24 GKs einfach + 12 LKs doppelt = max 600
  const block1 = Math.min(600, Math.round((24 * gks) + (12 * lks * 2)));
  // Block II: 5 Prüfungen 4-fach = max 300
  const block2 = Math.min(300, Math.round(5 * exams * 4));
  const totalPoints = block1 + block2;

  // KMK Abiturschnitt Formel
  const calculateGrade = (pts: number) => {
    if (pts >= 823) return "1.0";
    if (pts <= 300) return "4.0";
    const val = (17 / 3) - (pts / 180);
    return Math.max(1.0, Math.min(4.0, val)).toFixed(1);
  };

  // Pinnwand State
  const [posts, setPosts] = useState([
    { id: 1, author: "Herr Dr. Weber (Physik LK)", text: "Erinnert ihr euch an das Pendel-Experiment in der 11?", votes: 14, voted: false, print: true },
    { id: 2, author: "Leon Hillger", text: "Abistreich-Planungstreffen nächste Woche Donnerstag in Raum 204!", votes: 8, voted: false, print: false }
  ]);
  const [newPostText, setNewPostText] = useState("");

  const handleVote = (id: number) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          votes: p.voted ? p.votes - 1 : p.votes + 1,
          voted: !p.voted
        };
      }
      return p;
    }));
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setPosts([
      { id: Date.now(), author: "Ich", text: newPostText, votes: 0, voted: false, print: false },
      ...posts
    ]);
    setNewPostText("");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Header Card */}
      <header className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 mb-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-600/30">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Hallo, Abiturient!</h1>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded font-semibold">
                👑 Ersteller
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              🍇 Gymnasium Abi 2026 • Rheinland-Pfalz (MSS)
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50 text-xs font-mono font-bold text-amber-300">
          🔑 ABI-2026-PREMIUM
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
        <button
          onClick={() => setTab('calculator')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
            tab === 'calculator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" /> Abiturschnitt & MSS
        </button>
        <button
          onClick={() => setTab('yearbook')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
            tab === 'yearbook' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Abizeitung & Pinnwand
        </button>
      </div>

      {/* Tab 1: MSS Rechner */}
      {tab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900 border border-blue-800/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Abiturschnitt (Rheinland-Pfalz)</span>
                <div className="text-6xl font-black text-white mt-1 tracking-tight">
                  {calculateGrade(totalPoints)}
                </div>
              </div>
              <div className="bg-blue-950/80 border border-blue-700/50 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300">
                MSS (Mainzer Studienstufe)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-5">
              <div>
                <div className="text-xs text-slate-400">Block I (Halbjahre)</div>
                <div className="text-xl font-bold text-blue-400">{block1} / 600 Pkt</div>
                <div className="text-[11px] text-slate-500">Min. 200 erforderlich</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Block II (Prüfungen)</div>
                <div className="text-xl font-bold text-amber-400">{block2} / 300 Pkt</div>
                <div className="text-[11px] text-slate-500">Min. 100 erforderlich</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">MSS-Noten anpassen</h3>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Ø Leistungskurse (3 LKs)</span>
                <span className="font-bold text-white">{lks} Punkte</span>
              </div>
              <input
                type="range" min="0" max="15" value={lks}
                onChange={e => setLks(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Ø Grundkurse (GKs)</span>
                <span className="font-bold text-white">{gks} Punkte</span>
              </div>
              <input
                type="range" min="0" max="15" value={gks}
                onChange={e => setGks(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Ø Abiturprüfungen</span>
                <span className="font-bold text-white">{exams} Punkte</span>
              </div>
              <input
                type="range" min="0" max="15" value={exams}
                onChange={e => setExams(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pinnwand & Abizeitung */}
      {tab === 'yearbook' && (
        <div className="space-y-5">
          <form onSubmit={handleAddPost} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <textarea
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
              placeholder="Teile Erinnerungen, Sprüche oder Zitate für das gedruckte Abibuch..."
              rows={3}
              className="w-full bg-slate-800/70 border border-slate-700/60 rounded-xl p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Veröffentlichen
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {posts.map(p => (
              <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 relative">
                {p.print && (
                  <span className="absolute top-4 right-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⭐ Fürs Abibuch gewählt
                  </span>
                )}
                <div className="font-bold text-sm text-slate-200 mb-1">{p.author}</div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{p.text}</p>
                <button
                  onClick={() => handleVote(p.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                    p.voted
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {p.votes} {p.votes === 1 ? 'Stimme' : 'Stimmen'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
