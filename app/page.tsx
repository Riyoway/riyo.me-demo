"use client";

import dynamic from 'next/dynamic';

const NanikoreContent = dynamic(
  () => import('./nanikore/_components/NanikoreContent'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-screen bg-[#0a0a0a]" />
  }
);

export default function Home() {
  return <NanikoreContent />;
}
