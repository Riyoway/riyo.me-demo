"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PreparationPage() {
  const [showLol, setShowLol] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLol(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showLol) {
    return (
      <div 
        onClick={() => router.push('/blog')}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'black', 
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        <img 
          src="/lol.png" 
          alt="LOL" 
          style={{ 
            width: '100vw', 
            height: '100vh', 
            objectFit: 'contain' 
          }} 
        />
      </div>
    );
  }

  return (
    <>
      準備中( ｀ー´)ノ
    </>
  );
}
