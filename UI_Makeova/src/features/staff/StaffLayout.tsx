import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store'
import { logout, selectUser } from '../../store/slices/authSlice'
import authService from '../../api/authService'

const navItems = [
  {
    label: "Today's Appointments",
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

const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const dispatch  = useAppDispatch()
  const user      = useAppSelector(selectUser)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await authService.logout()
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="flex min-h-screen font-serif"
      style={{ background: '#F0FAF4' }}
    >
      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[100] flex flex-col bg-white border-r border-[#C8E6C9] shadow-[2px_0_12px_rgba(122,196,154,0.08)] transition-all duration-[250ms] ease-in-out flex-shrink-0 ${collapsed ? 'w-16' : 'w-[220px]'}`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-[#C8E6C9] ${collapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
          {!collapsed && (
            <div>
              <span className="block text-[13px] font-bold tracking-[0.2em] uppercase text-[#7AC49A]">
                Makeova
              </span>
              <span className="text-[9px] text-[#bbb] tracking-[0.1em] uppercase">
                Provider Portal
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-transparent border-none cursor-pointer text-[#7AC49A] p-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Staff avatar */}
        {!collapsed && (
          <div className="px-5 py-4 border-b border-[#C8E6C9]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C8E6C9] flex items-center justify-center text-[14px] font-bold text-[#7AC49A] flex-shrink-0">
                {user?.name?.charAt(0) ?? 'S'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-[#2d2d2d] m-0 truncate">{user?.name ?? 'Provider'}</p>
                <p className="text-[10px] text-[#aaa] m-0 truncate">{user?.email ?? ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4">
          {navItems.map(({ label, path, icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : ''}
                className={`w-full flex items-center gap-3 text-[13px] tracking-[0.02em] font-serif transition-all duration-[180ms] whitespace-nowrap overflow-hidden border-none cursor-pointer
                  ${collapsed ? 'justify-center px-0 py-3' : 'justify-start px-5 py-3'}
                  ${active
                    ? 'bg-[#E8F5E9] text-[#7AC49A] border-l-[3px] border-[#7AC49A]'
                    : 'bg-transparent text-[#888] border-l-[3px] border-transparent hover:bg-[#F0FAF4] hover:text-[#7AC49A]'
                  }`}
              >
                {icon}
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="py-4 border-t border-[#C8E6C9]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 bg-transparent border-none cursor-pointer text-[#bbb] text-[13px] font-serif transition-colors duration-[180ms] hover:text-[#7AC49A]
              ${collapsed ? 'justify-center px-0 py-3' : 'justify-start px-5 py-3'}`}
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

      {/* ── Main ── */}
      <main className={`flex flex-1 flex-col min-h-screen transition-all duration-[250ms] ease-in-out ${collapsed ? 'ml-16' : 'ml-[220px]'}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#C8E6C9] flex items-center justify-between px-8 sticky top-0 z-50">
          <span className="text-[12px] text-[#7AC49A] bg-[#E8F5E9] px-[14px] py-1 rounded-full tracking-[0.06em]">
            Provider Portal
          </span>
          <div className="flex items-center gap-2.5">
            {/* Availability indicator */}
            <span className="flex items-center gap-1.5 text-[11px] text-[#7AC49A] bg-[#E8F5E9] px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#7AC49A] inline-block animate-pulse" />
              Available
            </span>
            <div className="w-[34px] h-[34px] rounded-full bg-[#C8E6C9] flex items-center justify-center text-[13px] text-[#7AC49A] font-bold font-serif">
              {user?.name?.charAt(0) ?? 'S'}
            </div>
            <span className="text-[13px] text-[#888] font-serif">{user?.name ?? 'Provider'}</span>
          </div>
        </header>

        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default StaffLayout
