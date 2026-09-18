'use client';

import dynamic from 'next/dynamic';

const ClientPage = dynamic(() => import('./ClientPage'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#060913] text-white">
      <div className="text-xs text-slate-400 font-medium">AbiHub 2026 wird geladen...</div>
    </div>
  )
});

export default function Page() {
  return <ClientPage />;
}
