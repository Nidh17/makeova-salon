import React from 'react'
import UserTable from './Usertable'
import AdminLayout from '../AdminLayout'


const ManageCustomers: React.FC = () => (
  <UserTable roleType="customer" Layout={AdminLayout} />
)

export default ManageCustomers