import React from 'react'

// 🔁 Replace with your actual asset filenames
import insta1 from '@/assets/hair.jpg'
import insta2 from '@/assets/nail3.jpg'
import insta3 from '@/assets/makeup.jpg'
import insta4 from '@/assets/hair s.jpg'
import instaLarge from '@/assets/insta1.jpg'

// 🔁 Replace with your actual background image
import instaBg from '@/assets/salaon bg 2.jpg'

const InstagramSection: React.FC = () => {
  const gridPhotos = [insta1, insta2, insta3, insta4]

  return (
    <section style={{ position: 'relative', padding: '48px 32px 48px', overflow: 'hidden' }}>

      {/* Blurred background image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }}>
        <img
          src={instaBg}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(4px) brightness(0.55)',
            transform: 'scale(1.05)', // prevents blur edge white gaps
          }}
        />
        {/* Dark overlay on top of bg */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(40, 32, 32, 0.45)',
        }} />
      </div>

      {/* All content sits above bg */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Title */}
        <h2 style={{
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: '#C49A7A',
          marginBottom: 32,
          fontFamily: "'Georgia','Times New Roman',serif",
        }}>
          INSTAGRAM
        </h2>

        {/* Photo grid: 1 big left + 2×2 right — photos pop over blurred bg */}
        <div style={{
          maxWidth: 860,
          margin: '0 auto 28px auto',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 10,
        }}>

          {/* Large left photo */}
          <div style={{
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}>
            <img
              src={instaLarge}
              alt="Instagram featured"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>

          {/* Right 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {gridPhotos.map((src, i) => (
              <div key={i} style={{
                overflow: 'hidden',
                aspectRatio: '1',
                borderRadius: 3,
                boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
              }}>
                <img
                  src={src}
                  alt={`Instagram ${i + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.4s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Follow handle button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '9px 32px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontFamily: "'Georgia','Times New Roman',serif",
              background: 'rgba(255,255,255,0.06)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#C49A7A'
              e.currentTarget.style.color = '#C49A7A'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            FOLLOW US on Instagram @makeova
          </a>
        </div>
      </div>
    </section>
  )
}

export default InstagramSection