import React, { useState } from 'react'
import { useNavigate }    from 'react-router-dom'


import loginIllustration from '@/assets/salaon bg.jpg'
import { useAppDispatch } from '@/store'
import authService from '@/api/authService'
import { IRole } from '@/types'
import { setCredentials } from '@/store/slices/authSlice'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await authService.login({ email: email.trim(), password })
      const { u, accessToken } = res.data

      // Detect portal from populated role name
      const firstRole = u.role?.[0]
      let portal: 'admin' | 'receptionist' | 'staff' = 'admin'
      if (firstRole && typeof firstRole !== 'string' && 'name' in (firstRole as object)) {
        const name = ((firstRole as IRole).name ?? '').toLowerCase()
        if (name.includes('receptionist')) portal = 'receptionist'
        else if (name.includes('staff'))   portal = 'staff'
        else                               portal = 'admin'
      }

      localStorage.setItem('makeova_portal', portal)
      dispatch(setCredentials({ user: u, accessToken, portal }))
      navigate(`/${portal}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #F5C8BC 0%, #FDF0EB 40%, #F0E8FF 100%)',
        fontFamily: "'Georgia','Times New Roman',serif",
      }}
    >

      <div className="fixed top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#C49A7A 0%,transparent 70%)' }} />
      <div className="fixed bottom-[-80px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#C49A7A 0%,transparent 70%)' }} />

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-[900px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(196,154,122,0.18)] overflow-hidden flex min-h-[520px]">

        {/* ── LEFT: Illustration panel ── */}
        <div
          className="hidden md:flex flex-col items-center justify-center w-[46%] flex-shrink-0 px-10 py-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#FDF0EB 0%,#F5C8BC 55%,#E8A898 100%)' }}
        >
          {/* Blob behind illustration */}
          <div className="absolute w-[280px] h-[280px] rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle,rgba(255,255,255,0.7) 0%,transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

          {/* Illustration */}
          <img
            src={loginIllustration}
            alt="Salon illustration"
            className="relative z-10 w-[260px] max-w-full object-contain drop-shadow-xl"
          />

          {/* Text below illustration */}
          <div className="relative z-10 text-center mt-6">
            <h2 className="text-[18px] font-bold text-[#7a3a2a] m-0 mb-2">
              Makeova Salon
            </h2>
            <p className="text-[12px] text-[#b07060] m-0 leading-relaxed max-w-[200px] mx-auto">
              Manage your salon, providers and clients beautifully
            </p>
          </div>
        </div>

        {/* ── RIGHT: Login form ── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">

          {/* Top right link */}
          <div className="text-right mb-8">
            <span className="text-[12px] text-[#aaa]">Need help? </span>
            <button
              onClick={() => navigate('/')}
              className="text-[12px] text-[#C49A7A] font-semibold bg-transparent border-none cursor-pointer p-0 hover:text-[#b3896a] transition-colors"
            >
              Back to website ↗
            </button>
          </div>

          {/* Title */}
          <div className="mb-7">
            <h1 className="text-[26px] font-bold text-[#2d2d2d] m-0 mb-1">Welcome back!</h1>
            <p className="text-[13px] text-[#aaa] m-0">Sign in to access your portal</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-[#FFEBEE] border border-[#EF9A9A] rounded-xl px-4 py-3 mb-5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-[12px] text-[#E53935]">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="text-[12px] text-[#888] block mb-[6px] tracking-[0.02em]">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setError(''); setEmail(e.target.value) }}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full px-4 py-[12px] border-2 border-[#F0DDD5] rounded-xl text-[13px] text-[#2d2d2d] outline-none transition-all bg-[#FDFAFA] focus:border-[#C49A7A] focus:bg-white"
                style={{ fontFamily: 'inherit' }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <label className="text-[12px] text-[#888] tracking-[0.02em]">Password</label>
                <button
                  type="button"
                  className="text-[11px] text-[#C49A7A] bg-transparent border-none cursor-pointer p-0 hover:text-[#b3896a] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setError(''); setPassword(e.target.value) }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-[12px] pr-11 border-2 border-[#F0DDD5] rounded-xl text-[13px] text-[#2d2d2d] outline-none transition-all bg-[#FDFAFA] focus:border-[#C49A7A] focus:bg-white"
                  style={{ fontFamily: 'inherit' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ccc] hover:text-[#C49A7A] bg-transparent border-none cursor-pointer p-1 transition-colors"
                >
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-[13px] rounded-xl text-white text-[14px] font-semibold border-none cursor-pointer transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(196,154,122,0.4)]"
              style={{ background: 'linear-gradient(135deg,#C49A7A,#E8B89A)', fontFamily: 'inherit' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Signing in...
                </>
              ) : 'Login'}
            </button>

          </form>

          {/* Footer note */}
          <p className="text-[11px] text-[#ccc] text-center mt-8 mb-0">
            © {new Date().getFullYear()} Makeova Salon · All rights reserved
          </p>

        </div>
      </div>
    </div>
  )
}

export default LoginPage
