import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TryonWorkspace from './pages/Tryon/TryonWorkspace';
import VendorGallery from './pages/Tryon/VendorGallery';
import CustomerTryon from './pages/Tryon/CustomerTryon';
import CustomerGallery from './pages/Tryon/CustomerGallery';
import VendorAuth from './pages/Tryon/VendorAuth';
import Landing from './pages/Landing/Landing';

// Authentication Guard for Vendor Interface
const VendorRoute = ({ children }) => {
  const token = localStorage.getItem('vendor_token');
  const isGuest = sessionStorage.getItem('guest_mode') === 'true';
  return token || isGuest ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-[#ede8df]">
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<Landing />} />

          {/* Vendor Auth */}
          <Route path="/login" element={<VendorAuth />} />

          {/* Vendor Protected Interface */}
          <Route path="/workspace" element={<VendorRoute><TryonWorkspace onExit={() => window.location.href = '/'} /></VendorRoute>} />
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
