"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDonate = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/preparation');
    }, 2000);
  };

  return (
    <div style={{ backgroundColor: '#000080', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: '"Times New Roman", Times, serif', textAlign: 'center' }}>
      <div style={{ border: '4px double white', padding: '20px', backgroundColor: '#c0c0c0', color: 'black' }}>
        <div className="marquee-container" style={{ fontSize: '24px', fontWeight: 'bold', color: 'red', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div className="marquee-content">!!! WARNING: SYSTEM SECURITY ALERT !!!</div>
        </div>
        
        <h1 style={{ fontSize: '48px', textDecoration: 'underline' }}>Official Donation Portal</h1>
        
        <p style={{ fontSize: '18px' }}>Your access to the next page has been restricted for security reasons.</p>
        <p style={{ fontSize: '20px', color: 'blue', fontWeight: 'bold' }}>To verify your identity and unlock the system, a small donation of $100 is required.</p>
        
        <div style={{ margin: '40px auto', width: '300px', padding: '20px', border: '2px solid black', backgroundColor: 'white' }}>
          <img src="/donate.png" alt="Donate Now" style={{ width: '100%' }} />
          <h2 style={{ color: 'green' }}>AMOUNT: $100.00</h2>
          
          {loading ? (
            <div style={{ fontWeight: 'bold' }}>TRANSACTION PROCESSING... PLEASE WAIT...</div>
          ) : (
            <button 
              onClick={handleDonate}
              style={{ 
                padding: '10px 20px', 
                fontSize: '20px', 
                backgroundColor: 'yellow', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                border: '4px outset gray'
              }}
            >
              DONATE $100 NOW
            </button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div style={{ border: '1px inset black', padding: '5px' }}>100% SECURE</div>
          <div style={{ border: '1px inset black', padding: '5px' }}>VERIFIED BY RIYO</div>
          <div style={{ border: '1px inset black', padding: '5px' }}>NO REFUNDS</div>
        </div>
        
        <p style={{ fontSize: '12px', marginTop: '50px' }}>© 1996-2026 Nanikore Security Systems Inc. All rights reserved.</p>
      </div>
      
      <style jsx>{`
        .marquee-container { width: 100%; position: relative; }
        .marquee-content { display: inline-block; animation: marquee-scroll 5s linear infinite; padding-left: 100%; }
        @keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-200%); } }
      `}</style>
    </div>
  );
}
