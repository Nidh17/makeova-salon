import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '../store'
import { selectIsAuth, selectPortal } from '../store/slices/authSlice'
import PrivateRoute from './PrivateRoute'

// ── Login pages (public) ──────────────────────────────────


// ── Admin pages ───────────────────────────────────────────
import AdminDashboard      from '../features/admin/AdminDashboard'

import ManageReceptionists from '../features/admin/users/ManageReceptionists'
import ManageCustomers     from '../features/admin/users/MangeCustomer'
import Reports             from '../features/admin/Reports'
import AdminAppointmentCalendar from '../features/appointments/AdminAppointmentCalendar'


// ── Receptionist pages ────────────────────────────────────
import ReceptionistDashboard from '@/features/receptionist/Receptionstdashboard'
import ReceptionistBooking from '@/features/receptionist/Receptionistbooking'
import ReceptionistCustomers from '@/features/receptionist/Receptionistcustomers'
import ReceptionistSchedule from '@/features/receptionist/Receptionistschedule'



// ── Staff pages ───────────────────────────────────────────
import StaffProfile from '@/features/staff/StaffProfile'
import MySchedule from '@/features/staff/MySchedule'
import StaffDashboard from '@/features/staff/StaffDashboard'
import HomePage from '@/pages/Home/Home'
import ManageServices from '@/features/admin/services/MangeServices'
import ManageStaff from '@/features/admin/users/Managestaff'
import LoginPage from '@/components/shared/LoginForm'
import AdminProfile from '@/features/admin/AdminProfile'
// import ManageRoles from '@/features/admin/MangeRole'
import ReceptionistProfile from '@/features/receptionist/Receptionist'
import ManageRoles from '@/features/admin/MangeRole'




// Root: show HomePage when not logged in, redirect to portal when logged in
const Root: React.FC = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const portal = useAppSelector(selectPortal)
  if (isAuth && portal) return <Navigate to={`/${portal}`} replace />
  return <HomePage />
}

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root */}
        <Route path="/" element={<Root />} />

        {/* ─────────────────────────────────────────────
            PUBLIC: Portal login pages
            Each portal has its own login URL
        ───────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ─────────────────────────────────────────────
            ADMIN portal routes
            All require: logged in + portal === 'admin'
        ───────────────────────────────────────────── */}
        <Route path="/admin" element={
          <PrivateRoute requiredPortal="admin"><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/admin/services" element={
          <PrivateRoute requiredPortal="admin"><ManageServices /></PrivateRoute>
        } />
        <Route path="/admin/staff" element={
          <PrivateRoute requiredPortal="admin"><ManageStaff /></PrivateRoute>
        } />
        <Route path="/admin/receptionists" element={
          <PrivateRoute requiredPortal="admin"><ManageReceptionists /></PrivateRoute>
        } />
        <Route path="/admin/customers" element={
          <PrivateRoute requiredPortal="admin"><ManageCustomers /></PrivateRoute>
        } />
        <Route path="/admin/appointments" element={
          <PrivateRoute requiredPortal="admin"><AdminAppointmentCalendar /></PrivateRoute>
        } />
        <Route path="/admin/reports" element={
          <PrivateRoute requiredPortal="admin"><Reports /></PrivateRoute>
        } />
        <Route path="/admin/profile" element={
          <PrivateRoute requiredPortal="admin"><AdminProfile /></PrivateRoute>
        } />
        <Route path="/admin/roles" element={
          <PrivateRoute requiredPortal="admin"><ManageRoles /></PrivateRoute>
        } />

        {/* ─────────────────────────────────────────────
            RECEPTIONIST portal routes
        ───────────────────────────────────────────── */}
        <Route path="/receptionist" element={
          <PrivateRoute requiredPortal="receptionist"><ReceptionistDashboard /></PrivateRoute>
        } />
        <Route path="/receptionist/book" element={
          <PrivateRoute requiredPortal="receptionist"><ReceptionistBooking /></PrivateRoute>
        } />
        <Route path="/receptionist/customers" element={
          <PrivateRoute requiredPortal="receptionist"><ReceptionistCustomers /></PrivateRoute>
        } />
        <Route path="/receptionist/schedule" element={
          <PrivateRoute requiredPortal="receptionist"><ReceptionistSchedule /></PrivateRoute>
        } />
        <Route path="/receptionist/profile" element={
          <PrivateRoute requiredPortal="receptionist"><ReceptionistProfile /></PrivateRoute>
        } />

        {/* ─────────────────────────────────────────────
            STAFF portal routes
        ───────────────────────────────────────────── */}
        <Route path="/staff" element={
          <PrivateRoute requiredPortal="staff"><StaffDashboard /></PrivateRoute>
        } />
        <Route path="/staff/schedule" element={
          <PrivateRoute requiredPortal="staff"><MySchedule /></PrivateRoute>
        } />
        <Route path="/staff/profile" element={
          <PrivateRoute requiredPortal="staff"><StaffProfile /></PrivateRoute>
        } />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
