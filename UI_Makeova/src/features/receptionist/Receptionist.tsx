import React from 'react'
import ReceptionistLayout from './Receptionistlayout'
import ProfileForm from '@/components/shared/profileForm'


const ReceptionistProfile: React.FC = () => {
  return (
    <ReceptionistLayout>

      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-[#2d2d2d] m-0 font-serif">My Profile</h1>
        <p className="text-[13px] text-[#aaa] mt-1 mb-0">
          Manage your receptionist account details
        </p>
      </div>

      {/* Reused ProfileForm — receptionist blue theme */}
      <ProfileForm
        accentColor="#7A9EC4"
        bgGradient="linear-gradient(135deg,#7A9EC4,#A8C4E0)"
      />

    </ReceptionistLayout>
  )
}

export default ReceptionistProfile