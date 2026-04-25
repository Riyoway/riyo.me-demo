"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ASCIIText from './ASCIIText';

const MazeGame = dynamic(() => import('./MazeGame'), { ssr: false });

interface RiyoEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  scale: number;
  hue: number;
  texture: string;
}

export default function NanikoreContent() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [shake, setShake] = useState(0);
  const [invert, setInvert] = useState(false);
  const [riyos, setRiyos] = useState<RiyoEntity[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [phase, setPhase] = useState<'particles' | 'loading' | 'maze'>('particles');
  const requestRef = useRef<number>(0);
  
  const chaserFiles = ['1.gif', '2.gif', '3.gif', '4.png', '5.png', '6.gif', '7.gif', 'hello.png', 'riyo.png'];

  useEffect(() => {
    const audio = new Audio('/bg.mp3');
    audio.loop = true;
    audio.volume = 0.3; // Lower BG music
    audioRef.current = audio;

    const initialRiyos: RiyoEntity[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * 360, vr: (Math.random() - 0.5) * 1.5,
      scale: 0.5 + Math.random() * 2, hue: Math.random() * 360,
      texture: chaserFiles[Math.floor(Math.random() * chaserFiles.length)]
    }));
    setRiyos(initialRiyos);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const animateParticles = () => {
    if (phase !== 'particles') return;
    
    // Random invert for chaos
    if (Math.random() > 0.995) setInvert(true);
    else if (invert) setInvert(false);

    setRiyos((prev: RiyoEntity[]) => prev.map((r: RiyoEntity) => {
      let nx = r.x + r.vx;
      let ny = r.y + r.vy;
      let nvx = r.vx;
      let nvy = r.vy;
      if (nx < -10 || nx > 110) nvx *= -1;
      if (ny < -10 || ny > 110) nvy *= -1;
      return { ...r, x: nx, y: ny, vx: nvx, vy: nvy, rotation: r.rotation + r.vr };
    }));

    if (shake > 0) setShake(s => Math.max(0, s - 0.5));
    requestRef.current = requestAnimationFrame(animateParticles);
  };

  useEffect(() => {
    if (phase === 'particles') requestRef.current = requestAnimationFrame(animateParticles);
  }, [phase, shake, invert]);

  const handleClick = () => {
    if (clickCount === 0 && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (phase !== 'particles') return;
    setShake(10);
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    // Add more chaos on each click
    const newRiyos = Array.from({ length: 3 }).map((_, i) => ({
      id: Date.now() + i, 
      x: Math.random() * 100, y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      rotation: 0, vr: (Math.random() - 0.5) * 1.5, 
      scale: 0.2 + Math.random() * 4, hue: Math.random() * 360,
      texture: chaserFiles[Math.floor(Math.random() * chaserFiles.length)]
    }));

    setRiyos(prev => [...prev, ...newRiyos]);

    if (nextCount === 20) {
      setPhase('loading');
      setTimeout(() => setPhase('maze'), 3000);
    }
  };

  return (
    <div 
      onMouseMove={(e) => { if(phase === 'particles') setMouse({ x: e.clientX, y: e.clientY }); }}
      onClick={handleClick}
      className={`relative w-full h-screen overflow-hidden bg-black flex items-center justify-center transition-all duration-75 ${invert ? 'invert brightness-150' : ''}`}
      style={{ transform: `translate(${(Math.random()-0.5)*shake}px, ${(Math.random()-0.5)*shake}px)` }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&display=swap');
        .glitch-text { position: relative; display: inline-block; font-family: 'Noto Sans JP', sans-serif; }
        .glitch-text::before, .glitch-text::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .glitch-text::before { left: 4px; text-shadow: -4px 0 #ff00c1; clip: rect(44px, 9999px, 56px, 0); animation: glitch-anim 2s infinite linear alternate-reverse; }
        .glitch-text::after { left: -4px; text-shadow: -4px 0 #00fff9, 4px 4px #ff00c1; animation: glitch-anim2 0.5s infinite linear alternate-reverse; }
        @keyframes glitch-anim { 0% { clip: rect(31px, 9999px, 94px, 0); transform: skew(1deg); } 100% { clip: rect(61px, 9999px, 94px, 0); transform: skew(0deg); } }
        
        .tv-static {
          position: absolute; inset: 0; opacity: 0.05; pointer-events: none;
          background-image: url('https://media.giphy.com/media/oEI9uWUic9VKM/giphy.gif');
          background-size: cover;
          mix-blend-mode: screen;
        }

        body { margin: 0; background: #000; color: white; overflow: hidden; font-family: 'Noto Sans JP', sans-serif; }
      `}</style>

      {phase === 'particles' && (
        <>
          <div className="tv-static z-10" />
          <div className="absolute inset-0 z-0 pointer-events-none flex flex-wrap items-center justify-center opacity-10 gap-10 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="text-[5vw] font-black text-white animate-pulse" style={{ transform: `rotate(${(Math.random()-0.5)*40}deg)` }}>
                Welcome to my home
              </div>
            ))}
          </div>

          {riyos.map((r) => (
            <div key={r.id} className="absolute pointer-events-none z-20" style={{ 
              left: `${r.x}%`, top: `${r.y}%`, 
              transform: `translate(-50%, -50%) rotate(${r.rotation}deg) scale(${r.scale})`, 
              filter: `hue-rotate(${r.hue}deg) ${shake > 5 ? 'blur(2px)' : ''}`, 
              opacity: 0.7 
            }}>
              <Image src={`/${r.texture}`} alt="entity" width={100} height={100} unoptimized />
            </div>
          ))}

          <div className="relative z-30 select-none w-full h-full pointer-events-none">
            <div className="absolute inset-0">
              <ASCIIText 
                text="Welcome to my home" 
                asciiFontSize={5} 
                textFontSize={100}
                planeBaseHeight={6} 
                enableWaves={true} 
              />
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-white/60 text-xl font-bold animate-pulse">Keep clicking to reach the next page!</p>
              <p className="text-red-500/80 text-sm font-mono tracking-tighter opacity-50">STAY STAY STAY STAY STAY STAY STAY STAY STAY STAY</p>
            </div>
            <div className="mt-8 text-white/20 font-mono text-xs">
              PROGRESS: {Math.floor((clickCount/20)*100)}%
            </div>
          </div>
        </>
      )}

      {phase === 'loading' && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
          <div className="text-[15vw] font-black text-white animate-pulse glitch-text" data-text="LOADING">LOADING</div>
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-red-600 via-transparent to-transparent animate-ping" />
          <div className="mt-10 w-64 h-2 bg-white/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-white animate-[loading-bar_3s_ease-in-out]" />
          </div>
        </div>
      )}

      {phase === 'maze' && <MazeGame />}
      
      {phase !== 'maze' && (
        <div className="fixed w-16 h-16 pointer-events-none z-100 mix-blend-difference" style={{ left: mouse.x, top: mouse.y, transform: `translate(-50%, -50%) rotate(${clickCount * 20}deg)` }}>
          <Image src="/riyo.png" width={60} height={60} alt="cursor" />
        </div>
      )}

      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
