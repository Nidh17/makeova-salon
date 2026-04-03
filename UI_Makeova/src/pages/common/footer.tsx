import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer style={{ fontFamily: "'Georgia','Times New Roman',serif" }}>

      {/* ── TOP: Contact / Hours / Location ── */}
      <div style={{
        background: 'white',
        padding: '48px 32px 44px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          maxWidth: 860,
          margin: '0 auto',
          gap: 24,
          textAlign: 'center',
        }}>

          {/* CONTACT */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 50, height: 62,
              background: '#F5C8BC',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
                <rect x="2" y="1" width="18" height="26" rx="3" stroke="#C49A7A" strokeWidth="1.5" fill="none" />
                <line x1="8" y1="22" x2="14" y2="22" stroke="#C49A7A" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="7" y="4" width="8" height="1.5" rx="0.75" fill="#C49A7A" />
              </svg>
            </div>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d2d2d', fontWeight: 600, margin: 0 }}>CONTACT</p>
            <div>
              <p style={{ fontSize: 12, color: '#999', margin: '0 0 3px', lineHeight: 1.75 }}>7610866846</p>
              <p style={{ fontSize: 12, color: '#999', margin: 0, lineHeight: 1.75 }}>info@makeovasalon.com</p>
            </div>
          </div>

          {/* HOURS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56,
              background: '#F5C8BC',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="10" stroke="#C49A7A" strokeWidth="1.5" fill="none" />
                <path d="M13 8 L13 13 L17 16" stroke="#C49A7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d2d2d', fontWeight: 600, margin: 0 }}>HOURS</p>
            <div>
              <p style={{ fontSize: 12, color: '#999', margin: '0 0 3px', lineHeight: 1.75 }}>Mon to Fri: 7:30 am — 1:00 am</p>
              <p style={{ fontSize: 12, color: '#999', margin: '0 0 3px', lineHeight: 1.75 }}>Sat: 9:00 am — 1:00 am</p>
              <p style={{ fontSize: 12, color: '#999', margin: 0, lineHeight: 1.75 }}>Sun: 9:00 am — 11:30 pm</p>
            </div>
          </div>

          {/* LOCATION */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56,
              background: '#F5C8BC',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
                <path d="M11 1C6.58 1 3 4.58 3 9c0 5.25 8 15 8 15s8-9.75 8-15c0-4.42-3.58-8-8-8z" stroke="#C49A7A" strokeWidth="1.5" fill="#F5C8BC" />
                <circle cx="11" cy="9" r="2.5" stroke="#C49A7A" strokeWidth="1.3" fill="white" />
              </svg>
            </div>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d2d2d', fontWeight: 600, margin: 0 }}>LOCATION</p>
            <div>
              <p style={{ fontSize: 12, color: '#999', margin: '0 0 3px', lineHeight: 1.75 }}>101/A, Manglam Elite,</p>
              <p style={{ fontSize: 12, color: '#999', margin: '0 0 3px', lineHeight: 1.75 }}>Saket, Old Palasia</p>
              <p style={{ fontSize: 12, color: '#999', margin: 0, lineHeight: 1.75 }}>Indore, India</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM: salmon bg ── */}
      <div style={{ background: '#F5C8BC', padding: '44px 48px 0' }}>
        <div style={{
          maxWidth: 860,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'center',
          gap: 24,
          paddingBottom: 40,
        }}>

          {/* LEFT: Spinning badge */}
          <div style={{
            position: 'relative', width: 170, height: 170,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 170 170"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', animation: 'footerSpin 20s linear infinite' }}>
              <defs>
                <path id="footer-ring" d="M85,85 m -68,0 a 68,68 0 1,1 136,0 a 68,68 0 1,1 -136,0" />
              </defs>
              <text fill="#C49A7A" style={{ fontSize: 9.5, letterSpacing: '0.13em' }}>
                <textPath href="#footer-ring">We Don't Keep Our Beauty Secrets •&nbsp;</textPath>
              </text>
            </svg>
            <div style={{
              position: 'relative', zIndex: 2,
              width: 108, height: 108, borderRadius: '50%',
              background: 'white', border: '1.5px solid #C49A7A',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', marginBottom: 2 }}>We Are Your</span>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2d2d2d' }}>MAKEOVA</span>
            </div>
          </div>

          {/* CENTER: Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            {['Home', 'About Us', 'Service Menu', 'Our story'].map(link => (
              <a key={link} href="#" style={{
                fontSize: 13, color: '#3a2020', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C49A7A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3a2020')}
              >{link}</a>
            ))}
          </div>

          {/* RIGHT: Contact Us */}
          <div style={{ paddingLeft: 16 }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#2d2d2d', margin: '0 0 10px' }}>Contact Us</h4>
            <p style={{ fontSize: 12, color: '#7a5a52', lineHeight: 1.75, margin: '0 0 16px' }}>
              Don't miss promotions, follow us<br />for the latest news
            </p>
            <div style={{ display: 'flex', gap: 14 }}>
              <a href="#" aria-label="Facebook" style={{ color: '#a07060', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C49A7A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a07060')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" style={{ color: '#a07060', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C49A7A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a07060')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid rgba(160,100,80,0.2)', padding: '14px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#a07060', margin: 0, letterSpacing: '0.04em' }}>
            2023 Salon All rights reserved
          </p>
        </div>
      </div>

      <style>{`
        @keyframes footerSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </footer>
  )
}

export default Footer