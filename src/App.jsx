import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TryonWorkspace from './pages/Tryon/TryonWorkspace';
import VendorGallery from './pages/Tryon/VendorGallery';
import CustomerTryon from './pages/Tryon/CustomerTryon';
import CustomerGallery from './pages/Tryon/CustomerGallery';
import VendorAuth from './pages/Tryon/VendorAuth';
import ClientAuth from './pages/Vendor/ClientAuth';
import VendorCatalog from './pages/Vendor/VendorCatalog';
import VendorUpload from './pages/Vendor/VendorUpload';
import VendorTryon from './pages/Vendor/VendorTryon';
import Landing from './pages/Landing/Landing';
import AboutUs from './pages/Landing/AboutUs';

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
          <Route path="/about" element={<AboutUs />} />

          {/* Auth Routes */}
          <Route path="/login" element={<VendorAuth />} />
          <Route path="/client-login" element={<ClientAuth />} />

          {/* Vendor Protected Interface */}
          <Route path="/workspace" element={<VendorRoute><TryonWorkspace onExit={() => window.location.href = '/'} /></VendorRoute>} />
          <Route path="/gallery" element={<VendorRoute><VendorGallery /></VendorRoute>} />
          <Route path="/vendor/catalog" element={<VendorRoute><VendorCatalog /></VendorRoute>} />
          <Route path="/vendor/upload" element={<VendorRoute><VendorUpload /></VendorRoute>} />
          <Route path="/vendor/preview/:id" element={<VendorRoute><VendorTryon /></VendorRoute>} />

          {/* Customer Interface (Public) */}
          <Route path="/tryon/:id" element={<CustomerTryon />} />
          <Route path="/shop/:vendorId" element={<CustomerGallery />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
