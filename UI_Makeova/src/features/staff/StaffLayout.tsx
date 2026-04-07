import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store'
import { logout, selectUser } from '../../store/slices/authSlice'
import authService from '../../api/authService'

const navItems = [
  {
    label: 'Dashboard',
    path: '/staff',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'My Schedule',
    path: '/staff/schedule',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="14" x2="8" y2="14"/>
        <line x1="12" y1="14" x2="12" y2="14"/>
        <line x1="16" y1="14" x2="16" y2="14"/>
      </svg>
    ),
  },
  {
    label: 'My Profile',
    path: '/staff/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

interface StaffLayoutProps {
  children: React.ReactNode
}

const shellStyles = {
  background: 'linear-gradient(180deg, #eef5ef 0%, #e6efe7 56%, #dde8df 100%)',
  accent: '#5b8e72',
  accentSoft: '#d8e8dc',
  border: '#d1dfd4',
  text: '#1d2b22',
  muted: '#63776a',
  sidebar: 'linear-gradient(180deg, #233329 0%, #17211b 100%)',
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await authService.logout()
    dispatch(logout())
    navigate('/login', { replace: true })
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
          background: 'radial-gradient(circle at top left, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 38%), radial-gradient(circle at bottom right, rgba(83,115,92,0.05) 0%, rgba(83,115,92,0) 30%)',
        }}
      />

      <aside
        style={{
          width: collapsed ? 84 : 264,
          background: shellStyles.sidebar,
          borderRight: '1px solid rgba(214,230,219,0.12)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '0 24px 60px rgba(17,28,20,0.28)',
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
            borderBottom: '1px solid rgba(214,230,219,0.1)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#cfe2d4', fontFamily: '"Inter", system-ui, sans-serif' }}>
                Makeova
              </span>
              <span style={{ fontSize: 20, lineHeight: 1, color: '#f4faf5', fontWeight: 700 }}>
                Provider Studio
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: 'rgba(245,252,246,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              color: '#cfe2d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
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
                  background: active ? 'linear-gradient(135deg, rgba(207,226,212,0.22), rgba(255,255,255,0.06))' : 'transparent',
                  border: active ? '1px solid rgba(207,226,212,0.14)' : '1px solid transparent',
                  borderRadius: 16,
                  cursor: 'pointer',
                  color: active ? '#f4faf5' : '#bed0c4',
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
                    e.currentTarget.style.color = '#eef8f0'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#bed0c4'
                  }
                }}
              >
                <span style={{ color: active ? '#d8ecde' : '#9eb9a8' }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '18px 16px 20px', borderTop: '1px solid rgba(214,230,219,0.1)', position: 'relative', zIndex: 1 }}>
          {!collapsed && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 20,
                background: 'rgba(245,252,246,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#95ad9d', fontFamily: '"Inter", system-ui, sans-serif' }}>Provider</p>
              <p style={{ margin: '7px 0 0', fontSize: 15, color: '#f4faf5', fontWeight: 700 }}>{user?.name ?? 'Provider'}</p>
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
              background: 'rgba(245,252,246,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              cursor: 'pointer',
              color: '#cfe2d4',
              fontSize: 13,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
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
            background: 'rgba(241,247,242,0.9)',
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
              Provider Portal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 11,
                color: '#476f59',
                background: '#dfeee2',
                padding: '8px 12px',
                borderRadius: 999,
                fontFamily: '"Inter", system-ui, sans-serif',
                fontWeight: 600,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5b8e72', boxShadow: '0 0 0 4px rgba(91,142,114,0.12)' }} />
              Available
            </span>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #95b6a0, #5b8e72)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: '#f9fffa',
                fontWeight: 700,
                boxShadow: '0 8px 18px rgba(91,142,114,0.18)',
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              {user?.name?.charAt(0) ?? 'S'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: shellStyles.muted, fontFamily: '"Inter", system-ui, sans-serif' }}>Provider</p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: shellStyles.text, fontWeight: 700 }}>{user?.name ?? 'Provider'}</p>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: '34px 34px 40px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default StaffLayout
