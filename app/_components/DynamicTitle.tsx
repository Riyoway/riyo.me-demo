'use client';

import { useEffect } from 'react';

const TITLES = [
  "Riyo.me",
  "Riyo.me .",
  "Riyo.me ..",
  "Riyo.me ...",
  "WELCOME HOME",
  "HELLO?",
  "WATCHING YOU",
  "Riyo.me",
  "NANIKORE",
  "ERROR 404",
  "Riyo.me"
];

export default function DynamicTitle() {
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      document.title = TITLES[i % TITLES.length];
      i++;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
