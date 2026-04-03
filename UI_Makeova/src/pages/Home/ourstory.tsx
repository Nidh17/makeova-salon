import React from 'react'
import storyimg from '@/assets/story.jpg'

const OurStoryAsSeenOn: React.FC = () => {
  return (
    <>
      {/* ══════════════════════════
          OUR STORY
      ══════════════════════════ */}
      <section style={{
        position: 'relative',
        background: '#FADADD',   // full salmon/peach bg matching screenshot
        overflow: 'hidden',
        padding: '60px 0 0 0',
      }}>

        {/* Small decorative dots — left side */}
        <div style={{ position: 'absolute', left: 32, top: 120, width: 14, height: 14, borderRadius: '50%', background: '#E07868', opacity: 0.7, zIndex: 2 }} />
        <div style={{ position: 'absolute', left: 58, top: 200, width: 9, height: 9, borderRadius: '50%', border: '2px solid #E07868', opacity: 0.55, zIndex: 2 }} />
        <div style={{ position: 'absolute', left: 140, top: 280, width: 11, height: 11, borderRadius: '50%', background: '#E07868', opacity: 0.35, zIndex: 2 }} />

        {/* Content row */}
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 56,
          position: 'relative',
          zIndex: 1,
        }}>

          {/* LEFT: Photo with offset square pink border */}
          <div style={{ position: 'relative', flexShrink: 0, width: 260, height: 310 }}>
            {/* Offset border — top-left behind photo */}
            <div style={{
              position: 'absolute',
              top: -12,
              left: -12,
              width: 255,
              height: 305,
              border: '2px solid #C9746A',
              zIndex: 0,
              borderRadius: 2,
            }} />
            {/* Photo */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 260, height: 310, overflow: 'hidden', zIndex: 1, borderRadius: 2 }}>
              <img
                src={storyimg}
                alt="Our Story"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
              />
            </div>
          </div>

          {/* RIGHT: Text block */}
          <div style={{ flex: 1, maxWidth: 400 }}>
            <h2 style={{
              fontFamily: "'Georgia','Times New Roman',serif",
              fontSize: 24,
              fontWeight: 700,
              color: '#2a2a2a',
              marginBottom: 16,
              marginTop: 0,
            }}>
              Our Story
            </h2>
            <p style={{
              fontSize: 13,
              color: '#555',
              lineHeight: 1.85,
              marginBottom: 24,
              marginTop: 0,
            }}>
              We started as a small beauty studio in Indore, India. Our main idea was to create the best beauty studio in the world. Can there be compromises in the best studio in the world? Our answer is always no, we care about the best quality, we hire the best specialists and provide the best customer service. This approach allowed us to grow and create awesome team that is passionate about everything we do.
            </p>
            <button style={{
              background: 'white',
              border: '1px solid #aaa',
              color: '#555',
              fontSize: 12,
              padding: '9px 28px',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              fontFamily: "'Georgia','Times New Roman',serif",
              borderRadius: 2,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Bottom wavy white shape — separates OurStory from AsSeenOn */}
        <div style={{ marginTop: 48, lineHeight: 0 }}>
          <svg viewBox="0 0 1000 80" xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
            <path d="M0,40 C150,80 300,0 500,40 C700,80 850,10 1000,40 L1000,80 L0,80 Z"
              fill="#F5C8BC" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════
          AS SEEN ON
      ══════════════════════════ */}
      <section style={{
        background: '#F5C8BC',
        textAlign: 'center',
        padding: '52px 24px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Top wave (continuation from OurStory) already handled above */}

        <p style={{
          fontSize: 13,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#3a2a2a',
          marginBottom: 24,
          marginTop: 0,
          fontFamily: "'Georgia','Times New Roman',serif",
          fontWeight: 600,
        }}>
          As seen On
        </p>

        <blockquote style={{
          fontFamily: "'Georgia','Times New Roman',serif",
          fontSize: 'clamp(18px, 2.5vw, 26px)',
          color: '#2a1a1a',
          lineHeight: 1.5,
          maxWidth: 500,
          margin: '0 auto 36px auto',
          fontWeight: 400,
          fontStyle: 'normal',
        }}>
          "The place with its constant excellence,<br />
          soul, and style"
        </blockquote>

        <button style={{
          background: 'transparent',
          border: '1px solid #a06050',
          color: '#5a3030',
          fontSize: 11,
          padding: '8px 28px',
          cursor: 'pointer',
          letterSpacing: '0.06em',
          fontFamily: "'Georgia','Times New Roman',serif",
          borderRadius: 2,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          Learn More
        </button>

        {/* Bottom wave into next section */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1000 70" xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
            <path d="M0,35 C200,70 400,0 600,40 C800,75 900,20 1000,45 L1000,70 L0,70 Z"
              fill="#F7EDE8" />
          </svg>
        </div>
      </section>
    </>
  )
}

export default OurStoryAsSeenOn