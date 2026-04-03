import React from 'react'
import UserTable from '../admin/users/Usertable'
import ReceptionistLayout from './Receptionistlayout'


// Receptionist can also manage customers — same UserTable, different Layout
const ReceptionistCustomers: React.FC = () => (
  <UserTable roleType="customer" Layout={ReceptionistLayout} />
)

export default ReceptionistCustomers