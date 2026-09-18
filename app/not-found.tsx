import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-2xl mb-4">
        404
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Seite nicht gefunden</h2>
      <p className="text-slate-400 text-sm max-w-sm mb-6">
        Die gesuchte Seite existiert leider nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition"
      >
        Zurück zur Startseite
      </Link>
    </div>
  );
}
