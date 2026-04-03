import React from 'react'
import AdminLayout  from './AdminLayout'
import { useAppSelector } from '../../store'
import { selectUser } from '../../store/slices/authSlice'
import ProfileForm from '@/components/shared/profileForm'

const AdminProfile: React.FC = () => {
  const user = useAppSelector(selectUser)
  

  return (
    <AdminLayout>

      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">My Profile</h1>
        <p className="text-[13px] text-[#aaa] mt-1 mb-0">
          Manage your admin account details
        </p>
      </div>

      {/* Reused ProfileForm — admin salmon theme */}
      <ProfileForm
        accentColor="#C49A7A"
        bgGradient="linear-gradient(135deg,#C49A7A,#E8B89A)"
      />

    </AdminLayout>
  )
}

export default AdminProfile