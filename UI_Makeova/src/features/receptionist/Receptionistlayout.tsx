import React, { useState } from 'react'
import authService from '../../api/authService'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { logout, selectUser } from '@/store/slices/authSlice'

interface ReceptionistLayoutProps {
  children: React.ReactNode
}

const navItems = [
  {
    label: 'Dashboard',
    path: '/receptionist',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Book Appointment',
    path: '/receptionist/book',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" />
      </svg>
    ),
  },
  {
    label: 'Customers',
    path: '/receptionist/customers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Today's Schedule",
    path: '/receptionist/schedule',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: 'My Profile',
    path: '/receptionist/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const shellStyles = {
  background: 'linear-gradient(180deg, #f7eff2 0%, #f1e5eb 56%, #eadbe3 100%)',
  accent: '#9b5c74',
  accentSoft: '#ead4dd',
  border: '#e3cfd8',
  text: '#2b1f26',
  muted: '#7f6670',
  sidebar: 'linear-gradient(180deg, #37222c 0%, #24151c 100%)',
}

const ReceptionistLayout: React.FC<ReceptionistLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const user = useAppSelector(selectUser)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      dispatch(logout())
      navigate('/login', { replace: true })
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: shellStyles.background,
        color: shellStyles.text,
        fontFamily: '"Georgia", "Times New Roman", serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at top left, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0) 38%), radial-gradient(circle at bottom right, rgba(132,88,111,0.06) 0%, rgba(132,88,111,0) 30%)',
        }}
      />

      <aside
        style={{
          width: collapsed ? 84 : 264,
          background: shellStyles.sidebar,
          borderRight: '1px solid rgba(236,216,204,0.14)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '0 24px 60px rgba(31,16,10,0.28)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent 30%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            minHeight: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0 10px' : '0 22px',
            borderBottom: '1px solid rgba(236,216,204,0.12)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#e9d2db', fontFamily: '"Inter", system-ui, sans-serif' }}>
                Makeova
              </span>
              <span style={{ fontSize: 20, lineHeight: 1, color: '#fff7f2', fontWeight: 700 }}>
                Reception Desk
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: 'rgba(255,248,241,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              color: '#e9d2db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px 0 18px', position: 'relative', zIndex: 1 }}>
          {navItems.map(({ label, path, icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : ''}
                style={{
                  width: 'calc(100% - 20px)',
                  margin: '0 10px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '14px 0' : '14px 18px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? 'linear-gradient(135deg, rgba(233,210,219,0.24), rgba(255,255,255,0.08))' : 'transparent',
                  border: active ? '1px solid rgba(233,210,219,0.14)' : '1px solid transparent',
                  borderRadius: 16,
                  cursor: 'pointer',
                  color: active ? '#fff7f8' : '#d8c0ca',
                  fontSize: 13,
                  letterSpacing: '0.02em',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  boxShadow: active ? '0 10px 24px rgba(0,0,0,0.16)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = '#fff0e7'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d8c0ca'
                  }
                }}
              >
                <span style={{ color: active ? '#efd7df' : '#c89faf' }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '18px 16px 20px', borderTop: '1px solid rgba(236,216,204,0.12)', position: 'relative', zIndex: 1 }}>
          {!collapsed && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 20,
                background: 'rgba(255,248,241,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#bc97a7', fontFamily: '"Inter", system-ui, sans-serif' }}>Desk Account</p>
              <p style={{ margin: '7px 0 0', fontSize: 15, color: '#fff7f2', fontWeight: 700 }}>{user?.name ?? 'Receptionist'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px 0' : '12px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'rgba(255,248,241,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              cursor: 'pointer',
              color: '#e9d2db',
              fontSize: 13,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          marginLeft: collapsed ? 84 : 264,
          transition: 'margin-left 0.25s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <header
          style={{
            height: 82,
            background: 'rgba(248,240,244,0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${shellStyles.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 34px',
            gap: 16,
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                color: shellStyles.accent,
                background: shellStyles.accentSoft,
                padding: '8px 14px',
                borderRadius: 999,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: shellStyles.accent }} />
              Receptionist Portal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: shellStyles.muted, fontFamily: '"Inter", system-ui, sans-serif' }}>Guest Care</p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: shellStyles.text, fontWeight: 700 }}>{user?.name ?? 'Receptionist'}</p>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #c894aa, #9b5c74)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: '#fff8f3',
                fontWeight: 700,
                boxShadow: '0 8px 18px rgba(155,92,116,0.22)',
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              {user?.name?.charAt(0) ?? 'R'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 999,
                border: `1px solid ${shellStyles.border}`,
                background: 'rgba(255,255,255,0.92)',
                color: shellStyles.text,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        <div style={{ flex: 1, padding: '34px 34px 40px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default ReceptionistLayout
