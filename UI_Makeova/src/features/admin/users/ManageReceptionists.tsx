import React from 'react'
import UserTable from './Usertable'
import AdminLayout from '../AdminLayout'


const ManageReceptionists: React.FC = () => (
  <UserTable roleType="receptionist" Layout={AdminLayout} />
)

export default ManageReceptionists