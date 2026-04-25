"use client";

import React, { useState, useRef, useEffect } from 'react';

const INITIAL_COMMENTS = [
  { id: 1, user: "Pixel_Lover99", text: "I remember the moon subwoofers. My windows are still vibrating. Riyo for President 2028!", color: "#e91e63", time: "2h ago", isReply: false },
  { id: 2, user: "Elon_Stole_My_Heart", text: "Give him back the sock, Elon! Justice for Riyo!", color: "#2196f3", time: "1h ago", isReply: false },
  { id: 3, user: "TechGnome42", text: "Actually, it was the RIGHT sock. I have the metadata to prove it. Stop spreading misinformation.", color: "#4caf50", time: "45m ago", isReply: false },
  { id: 4, user: "AntiBeigeCrusader", text: "BEIGE IS A CRIME AGAINST HUMANITY. RIYO WAS RIGHT TO BAN IT.", color: "#ff9800", time: "30m ago", isReply: false },
  { id: 5, user: "Sandwich_Digitizer_Pro", text: "The ham sandwich incident was a setup. Antivirus programs don't just 'eat' bread. Wake up people!", color: "#9c27b0", time: "25m ago", isReply: false },
];

const INSULTS = [
  "Your CSS is as flat as your logic!",
  "Did a bot write this? Absolute trash.",
  "I've seen better code in a smart toaster.",
  "You are the physical embodiment of the color beige.",
  "Your existence is an unclosed tag. Fix yourself.",
  "Go back to the 404 page you came from!",
  "Delete this immediately. My eyes are bleeding.",
  "MODS!!! BAN THIS PERSON!!!",
  "Is this a joke? Because it's a 0/10.",
  "I'm reporting this to the Moon President.",
  "Your opinion is just a massive 404 error.",
  "Imagine thinking this was a good post. LOL.",
  "Ratio + L + No Socks.",
  "Your browser should have blocked this garbage.",
  "This is why the ham sandwich was deleted.",
  "You are clearly a beige spy. Get out.",
  "I've seen 1x1 pixels with more personality than you.",
  "Go download some common sense, if you can find it.",
  "Your brain is running on a 56k modem.",
  "This comment is lower resolution than a 1992 GIF.",
  "Who invited this guy? Unsubscribe.",
  "The Question Hole says your post is 100% wrong.",
  "Literal garbage code.",
  "Even a broken iframe has more integrity than you.",
  "Stop wasting our digital air.",
  "You probably enjoy long walks through beige hallways.",
  "Moonquakes are caused by posts this bad. Stop it.",
  "I'm cringing so hard my pixels are desaturating.",
  "Peak NPC energy right here.",
  "Begone, crawler bot! Nobody wants you here.",
  "This is why we can't have nice things in the Nanikore Dimension.",
  "Your parent tag must be so disappointed.",
  "I'd rather stare at a blue screen of death than read this again.",
];

const BOT_NAMES = ["john_doe_91", "toxic_mike_v2", "sara_k_1999", "pixel_punisher", "angry_bob_official", "glitch_queen_x", "dev_hater_zero", "random_guy_7", "meta_troll_42", "server_ghost", "bad_code_hater", "sock_investigator", "beige_terminator", "css_slayer_99", "troll_master_general", "void_walker", "null_pointer_fan"];
const BOT_COLORS = ["#f44336", "#333", "#ff5722", "#795548", "#000", "#673ab7"];
const EMOJI_FILES = [
  "1129-typing.png", "1197-baby-calmdown-calmdown.gif", "1435-aintnowway.gif",
  "29736-cathappi.gif", "3763_Go_AFyuk_Yourself_Goofy.gif", "4026-ayo.png",
  "4060-wtfbro.png", "4165-lethimcook.png", "4529-rich.png", "4939-goofy-ah-cat.png",
  "49398-cat.png", "5082-goofy-uncle-nerd.gif", "5441-simp.png", "60304-scary.png",
  "6627-agony.png", "6627-grr.png", "6710-woah-dies.gif", "6753-spongebob-cheesin.gif",
  "7227-pingugoofy.gif", "73302-facepalm-laugh.png", "7610-deadass.gif",
  "7762-aaaaaaaaa.png", "8488-tom-sus-stare.png", "9281_goofyStare.png",
  "9617-jerry-lightning.png", "9778-stonedgoofy.png"
];

export default function BlogPage() {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [input, setInput] = useState("");
  const [isFlaming, setIsFlaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const readingAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);

  const toggleReading = () => {
    if (isPlaying && readingAudioRef.current) {
      readingAudioRef.current.pause();
      readingAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      const audio = new Audio('/vo.mp3');
      readingAudioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const postComment = () => {
    if (!input.trim()) return;
    
    const userId = Date.now();
    const userComment = {
      id: userId,
      user: "You (Guest)",
      text: input,
      color: "#1a73e8",
      time: "Just now",
      isReply: false
    };

    setComments(prev => [userComment, ...prev]);
    setInput("");
    setIsFlaming(true);

    // Trigger Flame War
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 100) {
        clearInterval(interval);
        setIsFlaming(false);
        return;
      }

      const isEmojiOnly = Math.random() > 0.7;
      const botComment = {
        id: Date.now() + Math.random(),
        user: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
        text: isEmojiOnly ? "" : INSULTS[Math.floor(Math.random() * INSULTS.length)],
        color: BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)],
        time: "Just now",
        isReply: true,
        replyTo: userId,
        emoji: EMOJI_FILES[Math.floor(Math.random() * EMOJI_FILES.length)]
      };

      setComments(prev => {
        const userIdx = prev.findIndex(c => c.id === userId);
        if (userIdx === -1) return [botComment, ...prev];
        const newComments = [...prev];
        newComments.splice(userIdx + 1, 0, botComment);
        return newComments;
      });

      // Play notification sound
      new Audio('/tone.mp3').play().catch(() => {});

      count++;
    }, 100);
  };

  return (
    <div style={{ 
      backgroundColor: '#f0f2f5', 
      color: '#333', 
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', 
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd', padding: '20px 0', textAlign: 'center' }}>
        <h1 style={{ margin: '0', fontSize: '32px', color: '#1a73e8' }}>Riyo's Daily Tech & Life Blog</h1>
        <p style={{ margin: '5px 0 0', color: '#777' }}>"Exploring the unknown, one pixel at a time"</p>
        <nav style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <span 
            onClick={() => setOverlayImage('/home.png')}
            style={{ margin: '0 15px', color: '#1a73e8', cursor: 'pointer' }}
          >
            Home
          </span>
          <span style={{ margin: '0 15px', color: '#1a73e8', cursor: 'pointer' }}>About</span>
          <span style={{ margin: '0 15px', color: '#1a73e8', cursor: 'pointer' }}>History</span>
          <span 
            onClick={() => setOverlayImage('/contact.png')}
            style={{ margin: '0 15px', color: '#1a73e8', cursor: 'pointer' }}
          >
            Contact
          </span>
        </nav>
      </header>

      <div style={{ maxWidth: '1100px', margin: '40px auto', display: 'flex', gap: '30px', padding: '0 20px' }}>
        {/* Main Content */}
        <main style={{ flex: '2.5' }}>
          <article style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <header>
              <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#111' }}>The Untold History of Riyo: From Pixels to Power</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <img src="/admin.png" alt="Admin" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Admin (Riyo Enthusiast)</div>
                  <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Published in <strong>Digital Archaeology</strong> • 5 min read</span>
                    <button 
                      onClick={toggleReading}
                      style={{ 
                        padding: '2px 10px', 
                        backgroundColor: isPlaying ? '#f44336' : '#1a73e8', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontSize: '11px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{isPlaying ? '■' : '▶'}</span> 
                      {isPlaying ? 'Stop' : 'Read Aloud'}
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <div style={{ lineHeight: '1.8', fontSize: '17px' }}>
              <p>For years, the origins of the legendary figure known only as <strong>Riyo</strong> have been shrouded in mystery and digital fog. Today, we peel back the layers of the mainframe to reveal the shocking truth.</p>
              
              <h3 style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '5px', marginTop: '30px' }}>2024: The First Digital President of the Moon</h3>
              <p>In a landslide victory (literally, there was a moonquake), Riyo was elected President of the Moon. His first executive order was to ban the color "beige" and replace the craters with massive subwoofers. Unfortunately, he was impeached after 3 days for trying to "download the sun."</p>

              {/* In-Article AD */}
              <div style={{ margin: '40px 0', padding: '20px', border: '1px solid #eee', backgroundColor: '#fafafa', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', marginBottom: '5px' }}>Advertisement</div>
                <img src="/ad.png" alt="Sponsored Content" style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>"This one simple trick will change your pixel density forever!"</p>
              </div>

              <h3 style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '5px', marginTop: '30px' }}>2025 (9:00 AM): Appointed CEO of Google</h3>
              <p>For exactly 42 minutes, Riyo served as the CEO of Google. In this brief tenure, he successfully renamed the search bar to "The Question Hole" and updated the algorithm to prioritize GIF quality over factual accuracy. He resigned at 9:42 AM to "pursue a career in professional static listening."</p>

              <h3 style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '5px', marginTop: '30px' }}>2025 (2:30 PM): The Elon Musk Sock Incident</h3>
              <p>Riyo was arrested by Intergalactic SWAT teams after a high-speed chase through the Metaverse. The charge? Stealing Elon Musk's favorite left sock (the one with the rocket pattern). Riyo's defense was that the sock was actually a "soft-tissue hardware wallet" containing the private keys to the moon's subwoofers.</p>

              <h3 style={{ borderBottom: '2px solid #1a73e8', paddingBottom: '5px', marginTop: '30px' }}>2026: The Great Escape via CSS Transition</h3>
              <p>While awaiting trial in a high-security digital prison, Riyo managed to escape by setting his `opacity` to `0` and using a 10-second `transition-duration`. He is currently at large, reportedly hiding inside a broken <code>&lt;iframe&gt;</code> on an abandoned Geocities site.</p>

              <blockquote style={{ borderLeft: '5px solid #1a73e8', paddingLeft: '20px', fontStyle: 'italic', color: '#444', margin: '40px 0', fontSize: '1.2em', backgroundColor: '#f9f9f9', padding: '20px' }}>
                "You can't arrest a man for hardware extraction if the hardware is comfortable." — Riyo, during his bail hearing
              </blockquote>
            </div>

            <footer style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Share this story:</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ padding: '8px 15px', backgroundColor: '#3b5998', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Facebook</div>
                <div style={{ padding: '8px 15px', backgroundColor: '#1da1f2', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Twitter</div>
                <div style={{ padding: '8px 15px', backgroundColor: '#ff4500', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Reddit</div>
              </div>
            </footer>
          </article>

          {/* Comments Section */}
          <section style={{ marginTop: '30px', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px' }}>Comments ({comments.length})</h3>

            {/* Input at TOP */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '30px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee' }}></div>
              <div style={{ flex: '1' }}>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write a comment..." 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                ></textarea>
                <button 
                  onClick={postComment}
                  disabled={isFlaming}
                  style={{ 
                    marginTop: '10px', 
                    padding: '8px 20px', 
                    backgroundColor: isFlaming ? '#ccc' : '#1a73e8', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: isFlaming ? 'not-allowed' : 'pointer' 
                  }}
                >
                  Post Comment
                </button>
              </div>
            </div>
            
            <div style={{ maxHeight: '800px', overflowY: 'auto', paddingRight: '10px' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  marginBottom: '20px', 
                  borderBottom: '1px solid #eee', 
                  paddingBottom: '15px',
                  marginLeft: comment.isReply ? '50px' : '0',
                  opacity: 1,
                  animation: comment.isReply ? 'fade-in 0.3s ease-out' : 'none'
                }}>
                  {comment.user === "You (Guest)" ? (
                    <img src="/shit.png" alt="You" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: comment.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                      {comment.user[0]}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{comment.user} <span style={{ fontWeight: 'normal', color: '#888', marginLeft: '10px' }}>{comment.time}</span></div>
                    <div style={{ fontSize: '15px', marginTop: '5px', lineHeight: '1.5', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      {comment.text}
                      {(comment as any).emoji && (
                        <img 
                          src={`/emojis/${(comment as any).emoji}`} 
                          alt="emoji" 
                          style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
                        />
                      )}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#1a73e8', cursor: 'pointer' }}>Reply • Like • Report</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside style={{ flex: '1' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ marginTop: '0', fontSize: '18px' }}>About This Blog</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>Riyo's Daily Blog is dedicated to tracking the most confusing moments in digital history. We are funded entirely by static noise and moon dust.</p>
          </div>

          {/* Sidebar AD */}
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase', marginBottom: '8px' }}>Sponsored</div>
            <img src="/ad.png" alt="Ad" style={{ width: '100%', borderRadius: '4px', cursor: 'pointer' }} />
            <p style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '10px', color: '#1a73e8' }}>"Is your CSS broken? Click here to make it weirder!"</p>
          </div>
        </aside>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {overlayImage && (
        <div 
          onClick={() => setOverlayImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '20px'
          }}
        >
          <img 
            src={overlayImage} 
            alt="Overlay" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain',
              boxShadow: '0 0 50px rgba(255,255,255,0.2)' 
            }} 
          />
          <div style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', fontSize: '24px' }}>✕</div>
        </div>
      )}
    </div>
  );
}
