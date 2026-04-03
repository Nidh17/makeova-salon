import React, { useState } from 'react'
import authService        from '../../api/authService'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '@/store'
import { logout } from '@/store/slices/authSlice'

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

const ReceptionistLayout: React.FC<ReceptionistLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch  = useAppDispatch()
  const location = useLocation()
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
    <div className="flex min-h-screen bg-[#FDF6F2] font-serif">

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[100] flex flex-col bg-white border-r border-[#F0DDD5] shadow-[2px_0_12px_rgba(196,154,122,0.07)] transition-all duration-[250ms] ease-in-out flex-shrink-0 ${collapsed ? 'w-16' : 'w-[220px]'}`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-[#F0DDD5] ${collapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
          {!collapsed && (
            <div>
              <span className="block text-[13px] font-bold tracking-[0.2em] uppercase text-[#C49A7A]">
                Makeova
              </span>
              <span className="text-[9px] text-[#bbb] tracking-[0.1em] uppercase">
                Receptionist
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-transparent border-none cursor-pointer text-[#C49A7A] p-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

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
                    ? 'bg-[#FDF0EB] text-[#C49A7A] border-l-[3px] border-[#C49A7A]'
                    : 'bg-transparent text-[#888] border-l-[3px] border-transparent hover:bg-[#FDF6F2] hover:text-[#C49A7A]'
                  }`}
              >
                {icon}
                {!collapsed && <span>{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="py-4 border-t border-[#F0DDD5]">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 bg-transparent border-none cursor-pointer text-[#bbb] text-[13px] font-serif transition-colors duration-[180ms] hover:text-[#C49A7A]
              ${collapsed ? 'justify-center px-0 py-3' : 'justify-start px-5 py-3'}`}
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

      {/* ── Main ── */}
      <main
        className={`flex flex-1 flex-col min-h-screen transition-all duration-[250ms] ease-in-out ${collapsed ? 'ml-16' : 'ml-[220px]'}`}
      >
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#F0DDD5] flex items-center justify-between px-8 sticky top-0 z-50">
          <span className="text-[12px] text-[#C49A7A] bg-[#FDF0EB] px-[14px] py-1 rounded-full tracking-[0.06em]">
            Receptionist Portal
          </span>
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-full bg-[#F5C8BC] flex items-center justify-center text-[13px] text-[#C49A7A] font-bold font-serif">
              R
            </div>
            <span className="text-[13px] text-[#888] font-serif">Receptionist</span>
          </div>
        </header>

        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default ReceptionistLayout
