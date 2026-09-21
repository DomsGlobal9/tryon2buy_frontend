import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getVendorToken, isGuestMode } from './utils/auth';
import TryonWorkspace from './pages/Tryon/TryonWorkspace';
import VendorGallery from './pages/Tryon/VendorGallery';
import CustomerTryon from './pages/Tryon/CustomerTryon';
import CustomerGallery from './pages/Tryon/CustomerGallery';
import ClientTryon from './pages/Tryon/ClientTryon';

import VendorAuth from './pages/Tryon/VendorAuth';
import ClientAuth from './pages/Vendor/ClientAuth';
import VendorCatalog from './pages/Vendor/VendorCatalog';
import VendorUpload from './pages/Vendor/VendorUpload';
import VendorTryon from './pages/Vendor/VendorTryon';
import Landing from './pages/Landing/Landing';
import AboutUs from './pages/Landing/AboutUs';
import SareeTryOn from './pages/Landing/Categories/SareeTryOn';
import LehengaTryOn from './pages/Landing/Categories/LehengaTryOn';
import AnarkaliTryOn from './pages/Landing/Categories/AnarkaliTryOn';
import ShararaTryOn from './pages/Landing/Categories/ShararaTryOn';
import KurtiTryOn from './pages/Landing/Categories/KurtiTryOn';
import BlogIndex from './pages/Landing/BlogIndex';
import BlogPost from './pages/Landing/BlogPost';

// Authentication Guard for Vendor Interface
// A login that has EXPIRED no longer counts -- it used to, because only the token's presence
// was checked, so an expired vendor walked into pages whose every request then failed.
// The address they were heading for rides along, so logging in brings them back to it.
//
// Guests are let in only where the page is built for them (allowGuest -- the workspace). The
// guard used to admit a guest to every vendor page, so typing /vendor/catalog, /vendor/upload
// or /vendor/preview/... opened a vendor screen whose every request the server then refused:
// an empty catalogue, an upload form that could not save. Nothing leaked, but it was a dead
// end. A guest is sent to log in instead, with guest mode left as it was.
const VendorRoute = ({ children, allowGuest = false }) => {
  const location = useLocation();
  if (getVendorToken() || (allowGuest && isGuestMode())) return children;
  return <Navigate to="/login" replace state={{ returnTo: location.pathname + location.search }} />;
};

export default function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-[#ede8df]">
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<AboutUs />} />
          
          {/* Solutions / Categories */}
          <Route path="/saree" element={<SareeTryOn />} />
          <Route path="/lehenga" element={<LehengaTryOn />} />
          <Route path="/anarkali" element={<AnarkaliTryOn />} />
          <Route path="/sharara" element={<ShararaTryOn />} />
          <Route path="/kurti" element={<KurtiTryOn />} />

          {/* Blog / Resources */}
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Auth Routes */}
          <Route path="/login" element={<VendorAuth />} />
          <Route path="/client-login" element={<ClientAuth />} />

          {/* Vendor Protected Interface */}
          <Route path="/workspace" element={<VendorRoute allowGuest><TryonWorkspace onExit={() => window.location.href = '/'} /></VendorRoute>} />
          <Route path="/gallery" element={<VendorRoute><VendorGallery /></VendorRoute>} />
          <Route path="/vendor/catalog" element={<VendorRoute><VendorCatalog /></VendorRoute>} />
          <Route path="/vendor/upload" element={<VendorRoute><VendorUpload /></VendorRoute>} />
          <Route path="/vendor/preview/:id" element={<VendorRoute><VendorTryon /></VendorRoute>} />

          {/* Customer Interface (Public) */}
          <Route path="/tryon/:id" element={<CustomerTryon />} />
          <Route path="/shop/:vendorId" element={<CustomerGallery />} />

          {/* Scanned from the QR code on a garment tag in a shop.
              Addressed by the SHOP and the PRODUCT CODE printed on the tag, not by an id in
              this app's database -- the garment lives in Scaleezy Inventory, and this page
              asks Inventory what was scanned. Without this route the catch-all below silently
              redirected every scan to the landing page, which is what "the QR is not working"
              was: a 200, then a redirect. */}
          <Route path="/try/:clientId/:productCode" element={<ClientTryon />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
