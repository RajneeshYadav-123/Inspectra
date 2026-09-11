import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './features/auth/Login'
import Signup from './features/auth/Signup'
import CustomerDashboard from './features/customer/CustomerDashboard'
import CreateBooking from './features/customer/CreateBooking'
import InspectorDashboard from './features/inspector/InspectorDashboard'
import InspectionForm from './features/inspector/InspectionForm'
import AdminDashboard from './features/admin/AdminDashboard'
import InspectionReview from './features/admin/InspectionReview'
import './index.css'
import Home from './features/public/Home'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/create-booking" element={<CreateBooking />} />
        <Route path="/inspector" element={<InspectorDashboard />} />
        <Route path="/inspection/:id" element={<InspectionForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/review/:id" element={<InspectionReview />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
