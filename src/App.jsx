import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TryonWorkspace from './pages/Tryon/TryonWorkspace';
import VendorGallery from './pages/Tryon/VendorGallery';
import CustomerTryon from './pages/Tryon/CustomerTryon';
import CustomerGallery from './pages/Tryon/CustomerGallery';
import VendorAuth from './pages/Tryon/VendorAuth';

// Authentication Guard for Vendor Interface
const VendorRoute = ({ children }) => {
  const token = localStorage.getItem('vendor_token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-[#ede8df]">
        <Routes>
          {/* Vendor Auth */}
          <Route path="/login" element={<VendorAuth />} />

          {/* Vendor Protected Interface */}
          <Route path="/" element={<VendorRoute><TryonWorkspace onExit={() => {}} /></VendorRoute>} />
          <Route path="/gallery" element={<VendorRoute><VendorGallery /></VendorRoute>} />

          {/* Customer Interface (Public) */}
          <Route path="/tryon/:id" element={<CustomerTryon />} />
          <Route path="/shop/:vendorId" element={<CustomerGallery />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
