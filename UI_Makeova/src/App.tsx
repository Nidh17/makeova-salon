import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from "./pages/Home/Home"

// Admin pages
import AdminDashboard      from "./features/admin/AdminDashboard"
import Reports             from "./features/admin/Reports"
import AppointmentCalendar from "./features/appointments/AppointmentCalendar"
import ReceptionistDashboard from "./features/receptionist/Receptionstdashboard"
import ReceptionistBooking from "./features/receptionist/Receptionistbooking"
import ReceptionistCustomers from "./features/receptionist/Receptionistcustomers"
import ReceptionistSchedule from "./features/receptionist/Receptionistschedule"
import LoginPage from "./components/shared/LoginForm"
import ManageServices from "./features/admin/services/MangeServices"
import ManageStaff from "./features/admin/users/Managestaff"
import ManageReceptionists from "./features/admin/users/ManageReceptionists"
import ManageCustomers from "./features/admin/users/MangeCustomer"


// Receptionist pages
// import ReceptionistDashboard from "./features/receptionist/ReceptionistDashboard"
// import ReceptionistBooking   from "./features/receptionist/ReceptionistBooking"
// import ReceptionistCustomers from "./features/receptionist/ReceptionistCustomers"
// import ReceptionistSchedule  from "./features/receptionist/ReceptionistSchedule"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<HomePage />} />

        {/* Admin */}
        <Route path="/admin"                 element={<AdminDashboard />} />
        <Route path="/admin/services"        element={<ManageServices />} />
        <Route path="/admin/staff"           element={<ManageStaff />} />
        <Route path="/admin/reports"         element={<Reports />} />
        <Route path="/admin/receptionists"   element={<ManageReceptionists />} />
        <Route path="/admin/appointments"    element={<AppointmentCalendar />} />
        <Route path="/admin/customers"       element={<ManageCustomers />} />

        {/* Receptionist */}
        <Route path="/receptionist"           element={<ReceptionistDashboard />} />
        <Route path="/receptionist/book"      element={<ReceptionistBooking />} />
        <Route path="/receptionist/customers" element={<ReceptionistCustomers />} />
        <Route path="/receptionist/schedule"  element={<ReceptionistSchedule />} />

        <Route path="/login"  element={<LoginPage />} />
       

      </Routes>
    </BrowserRouter>
  )
}

export default App