import React, { useState } from 'react'
import authService from '../../api/authService'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store'
import { logout, selectUser } from '../../store/slices/authSlice'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navItems = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Manage Services',
    path: '/admin/services',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    label: 'Manage Providers',
    path: '/admin/staff',
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
    label: 'Receptionists',
    path: '/admin/receptionists',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M12 11v4" /><path d="M10 13h4" />
      </svg>
    ),
  },
  {
    label: 'Appointments',
    path: '/admin/appointments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="8" cy="15" r="0.5" fill="currentColor" />
        <circle cx="12" cy="15" r="0.5" fill="currentColor" />
        <circle cx="16" cy="15" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Customers',
    path: '/admin/customers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    path: '/admin/reports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Roles & Permissions',
    path: '/admin/roles',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: 'My Profile',
    path: '/admin/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const shellStyles = {
  background: 'linear-gradient(180deg, #f5efe8 0%, #efe4d8 55%, #e8dacb 100%)',
  accent: '#9b6744',
  accentSoft: '#e8d2c0',
  border: '#e1cdbd',
  text: '#2b1e17',
  muted: '#705c51',
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
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
          background: 'radial-gradient(circle at top left, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 36%), radial-gradient(circle at bottom right, rgba(120,85,62,0.05) 0%, rgba(120,85,62,0) 30%)',
        }}
      />

      <aside
        style={{
          width: collapsed ? 84 : 280,
          background: 'linear-gradient(180deg, #3a271d 0%, #241813 100%)',
          borderRight: '1px solid rgba(232,216,203,0.16)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '0 24px 60px rgba(31,16,10,0.32)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent 28%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            minHeight: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0 10px' : '0 24px',
            borderBottom: '1px solid rgba(232,216,203,0.14)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#f2ddcb', fontFamily: '"Inter", system-ui, sans-serif' }}>
                Makeova
              </span>
              <span style={{ fontSize: 20, lineHeight: 1, color: '#fff7f0', fontWeight: 700 }}>
                Admin Portal
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: 'rgba(255,248,240,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              color: '#f2ddcb',
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
                  background: active ? 'linear-gradient(135deg, rgba(242,221,203,0.22), rgba(255,255,255,0.08))' : 'transparent',
                  border: active ? '1px solid rgba(242,221,203,0.12)' : '1px solid transparent',
                  borderRadius: 16,
                  cursor: 'pointer',
                  color: active ? '#fff7f0' : '#d6c0b0',
                  fontSize: 13,
                  letterSpacing: '0.02em',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  boxShadow: active ? '0 10px 24px rgba(0,0,0,0.18)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = '#fff0e4'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d6c0b0'
                  }
                }}
              >
                <span style={{ color: active ? '#f6d8c4' : '#cda991' }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '18px 16px 20px', borderTop: '1px solid rgba(232,216,203,0.14)', position: 'relative', zIndex: 1 }}>
          {!collapsed && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 20,
                background: 'rgba(255,248,240,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
                marginBottom: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b89884', fontFamily: '"Inter", system-ui, sans-serif' }}>Account</p>
              <p style={{ margin: '7px 0 0', fontSize: 15, color: '#fff7f0', fontWeight: 700 }}>{user?.name ?? 'Admin'}</p>
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
              background: 'rgba(255,248,240,0.08)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              cursor: 'pointer',
              color: '#f2ddcb',
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
          marginLeft: collapsed ? 84 : 280,
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
            background: 'rgba(247,240,233,0.9)',
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
              Admin Portal
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: shellStyles.muted, fontFamily: '"Inter", system-ui, sans-serif' }}>Signed In</p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: shellStyles.text, fontWeight: 700 }}>{user?.name ?? 'Admin'}</p>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d3b195, #a56c45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: '#fff8f3',
                fontWeight: 700,
                boxShadow: '0 8px 18px rgba(165,108,69,0.22)',
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              {user?.name?.charAt(0) ?? 'A'}
            </div>
           
          </div>
        </header>

        <div style={{ flex: 1, padding: '34px 34px 40px' }}>{children}</div>
      </main>
    </div>
  )
}

export default AdminLayout
