import React, { useState } from 'react'
import authService        from '../../api/authService'
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const dispatch  = useAppDispatch()
  const user      = useAppSelector(selectUser)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await authService.logout()    // DELETE session from DB + clear localStorage
    } finally {
      dispatch(logout())            // clear Redux state
      navigate('/login', { replace: true })
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F6F3EE', fontFamily: '"Inter", system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 64 : 220,
        background: '#F8F4EE',
        borderRight: '1px solid #E4D8CB',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: '0 18px 45px rgba(61,38,21,0.06)',
      }}>

        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid #E4D8CB',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C6942' }}>
                Makeova
              </span>
              <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9C8878' }}>
                Admin Portal
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C6942', padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(({ label, path, icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : ''}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '12px 0' : '12px 20px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: active ? '#EFE2D5' : 'transparent',
                  border: 'none',
                  borderLeft: active ? '3px solid #B67F56' : '3px solid transparent',
                  cursor: 'pointer',
                  color: active ? '#9C6942' : '#756457',
                  fontSize: 13,
                  letterSpacing: '0.02em',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#F2E9DE'
                    e.currentTarget.style.color = '#9C6942'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#756457'
                  }
                }}
              >
                {icon}
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 0', borderTop: '1px solid #E4D8CB' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px 0' : '12px 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#9C8878',
              fontSize: 13,
              fontFamily: '"Inter", system-ui, sans-serif',
              transition: 'color 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#9C6942')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9C8878')}
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

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        marginLeft: collapsed ? 64 : 220,
        transition: 'margin-left 0.25s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top bar */}
        <header style={{
          height: 64,
          background: 'rgba(255,253,249,0.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E4D8CB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <span style={{
            fontSize: 12,
            color: '#9C6942',
            background: '#EFE2D5',
            padding: '7px 14px',
            borderRadius: 999,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Admin Portal
          </span>
          {/* Admin avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#E6D7C8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              color: '#9C6942',
              fontWeight: 700,
              fontFamily: '"Inter", system-ui, sans-serif',
            }}>{user?.name?.charAt(0) ?? 'A'}</div>
            <span style={{ fontSize: 13, color: '#756457', fontFamily: '"Inter", system-ui, sans-serif' }}>{user?.name ?? 'Admin'}</span>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
