import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import {
  selectIsAuth,
  selectIsVerified,
  selectPortal,
  selectToken,
  sessionVerified,
  invalidateSession,
} from '../store/slices/authSlice'
import api from '../api/axiosInstance'
import type { PortalType } from '../types'

interface Props {
  children:       React.ReactNode
  requiredPortal: PortalType
}

const PrivateRoute: React.FC<Props> = ({ children, requiredPortal }) => {
  const dispatch   = useAppDispatch()
  const isAuth     = useAppSelector(selectIsAuth)
  const isVerified = useAppSelector(selectIsVerified)
  const portal     = useAppSelector(selectPortal)
  const token      = useAppSelector(selectToken)
  const location   = useLocation()

  useEffect(() => {
    // Already verified this session — skip
    if (isVerified) return

    // No token at all — nothing to verify
    if (!token) {
      dispatch(invalidateSession())
      return
    }

    // ── Call backend to confirm token is real ─────────────
    // This is the ONLY real security check.
    // Your backend's authMiddleware.Vaildatetoken will:
    //   1. Decode the JWT
    //   2. Check it's signed with the correct secret
    //   3. Check it exists in the session table
    // A fake token cannot pass this check.
    const verify = async () => {
      try {
        await api.get('/user/getalluser')
        // Backend accepted the token → session is real
        dispatch(sessionVerified())
      } catch {
        // Backend rejected it → fake/expired/logged-out token
        dispatch(invalidateSession())
      }
    }

    verify()
  }, [isVerified, token, dispatch])

  // ── Still verifying → show spinner ───────────────────
  if (!isVerified) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#FDF6F2]"
        style={{ fontFamily: "'Georgia',serif" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-[3px] border-[#F0DDD5] border-t-[#C49A7A] animate-spin" />
          <p className="text-[13px] text-[#bbb]">Verifying session...</p>
        </div>
      </div>
    )
  }

  // ── Verification done but not authenticated ───────────
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ── Authenticated but wrong portal ────────────────────
  if (portal && portal !== requiredPortal) {
    return <Navigate to={`/${portal}`} replace />
  }

  // ── All good → render protected page ─────────────────
  return <>{children}</>
}

export default PrivateRoute