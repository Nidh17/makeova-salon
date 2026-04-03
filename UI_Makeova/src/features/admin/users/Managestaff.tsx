import React from 'react'
import UserTable from './Usertable'
import AdminLayout from '../AdminLayout'


const ManageStaff: React.FC = () => (
  <UserTable roleType="staff" Layout={AdminLayout} />
)

export default ManageStaff