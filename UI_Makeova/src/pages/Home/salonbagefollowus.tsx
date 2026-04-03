import React from 'react'

const SalonBadgeFollowUs: React.FC = () => {
  return (
    <section style={{
      background: '#F7EDE8',
      position: 'relative',
      overflow: 'hidden',
      padding: '56px 0 64px',
    }}>

      {/* FACEBOOK vertical tab — right edge */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 48,
        width: 28,
        height: 108,
        background: '#E8897A',
        borderRadius: '4px 0 0 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}>
        <span style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 8.5,
          letterSpacing: '0.22em',
          color: 'white',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          fontFamily: 'sans-serif',
        }}>FACEBOOK</span>
      </div>

      {/* INSTAGRAM vertical tab — right edge, lower */}
      <div style={{
        position: 'absolute',
        right: 0,
        bottom: 48,
        width: 28,
        height: 108,
        background: '#E8897A',
        borderRadius: '4px 0 0 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}>
        <span style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 8.5,
          letterSpacing: '0.22em',
          color: 'white',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          fontFamily: 'sans-serif',
        }}>INSTAGRAM</span>
      </div>

      {/* Content row */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '0 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>

        {/* LEFT: Circular spinning badge */}
        <div style={{
          position: 'relative',
          width: 180,
          height: 180,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Spinning text ring */}
          <svg
            viewBox="0 0 180 180"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              animation: 'spinBadge 20s linear infinite',
            }}
          >
            <defs>
              <path id="badge-ring" d="M90,90 m -72,0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
            </defs>
            <text fill="#C49A7A" style={{ fontSize: 10, letterSpacing: '0.13em' }}>
              <textPath href="#badge-ring">
                We Don't Keep Our Beauty Secrets •&nbsp;
              </textPath>
            </text>
          </svg>

          {/* Inner white circle with border */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: 112,
            height: 112,
            borderRadius: '50%',
            background: 'white',
            border: '1.5px solid #C49A7A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 8,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#aaa',
              fontFamily: "'Georgia',serif",
              marginBottom: 2,
            }}>We Are Your</span>
            <span style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#2d2d2d',
              fontFamily: "'Georgia',serif",
            }}>MAKEOVA</span>
          </div>
        </div>

        {/* CENTER: Thin vertical salmon bar */}
        <div style={{
          width: 3,
          height: 140,
          background: '#E8897A',
          borderRadius: 4,
          opacity: 0.75,
          flexShrink: 0,
        }} />

        {/* RIGHT: Follow Us */}
        <div style={{ flex: 1, maxWidth: 220 }}>
          <h3 style={{
            fontFamily: "'Georgia',serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#2d2d2d',
            marginBottom: 10,
            marginTop: 0,
          }}>Follow Us</h3>
          <p style={{
            fontSize: 12,
            color: '#aaa',
            lineHeight: 1.7,
            marginBottom: 20,
            marginTop: 0,
          }}>
            Don't miss promotions, follow us<br />for the latest news
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <a href="#" aria-label="Facebook" style={{ color: '#999', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C49A7A')}
              onMouseLeave={e => (e.currentTarget.style.color = '#999')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" style={{ color: '#999', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C49A7A')}
              onMouseLeave={e => (e.currentTarget.style.color = '#999')}
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

      <style>{`
        @keyframes spinBadge {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}

export default SalonBadgeFollowUs