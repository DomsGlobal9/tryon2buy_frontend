import React, { lazy, Suspense } from 'react';
// Every page except the home page loads on demand: the whole app used to be one 1.1 MB file,
// downloaded in full before a phone could show anything.
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getVendorToken, isGuestMode, loginPath, isB2B } from './utils/auth';
const TryonWorkspace = lazy(() => import('./pages/Tryon/TryonWorkspace'));
const VendorGallery = lazy(() => import('./pages/Tryon/VendorGallery'));
const CustomerTryon = lazy(() => import('./pages/Tryon/CustomerTryon'));
const CustomerGallery = lazy(() => import('./pages/Tryon/CustomerGallery'));
const ClientTryon = lazy(() => import('./pages/Tryon/ClientTryon'));

const VendorAuth = lazy(() => import('./pages/Tryon/VendorAuth'));
const ClientAuth = lazy(() => import('./pages/Vendor/ClientAuth'));
const VendorCatalog = lazy(() => import('./pages/Vendor/VendorCatalog'));
const VendorUpload = lazy(() => import('./pages/Vendor/VendorUpload'));
const VendorTryon = lazy(() => import('./pages/Vendor/VendorTryon'));
import Landing from './pages/Landing/Landing';
const AboutUs = lazy(() => import('./pages/Landing/AboutUs'));
const SareeTryOn = lazy(() => import('./pages/Landing/Categories/SareeTryOn'));
const LehengaTryOn = lazy(() => import('./pages/Landing/Categories/LehengaTryOn'));
const AnarkaliTryOn = lazy(() => import('./pages/Landing/Categories/AnarkaliTryOn'));
const ShararaTryOn = lazy(() => import('./pages/Landing/Categories/ShararaTryOn'));
const KurtiTryOn = lazy(() => import('./pages/Landing/Categories/KurtiTryOn'));
const BlogIndex = lazy(() => import('./pages/Landing/BlogIndex'));
const BlogPost = lazy(() => import('./pages/Landing/BlogPost'));
const PrivacyPolicy = lazy(() => import('./pages/Landing/Legal').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/Landing/Legal').then(m => ({ default: m.TermsOfService })));
import ErrorScreen from './components/ErrorScreen';

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
const VendorRoute = ({ children, allowGuest = false, b2bOnly = false }) => {
  const location = useLocation();
  // The digitise/catalogue portal is for B2B logins; a merchant login belongs in the workspace.
  if (b2bOnly && getVendorToken() && !isB2B()) return <Navigate to="/workspace" replace />;
  if (getVendorToken() || (allowGuest && isGuestMode())) return children;
  return <Navigate to={loginPath()} replace state={{ returnTo: location.pathname + location.search }} />;
};

export default function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-[#ede8df]">
        <Suspense fallback={<div className="min-h-screen bg-[#faf7f2]" />}>
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

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Auth Routes */}
          <Route path="/login" element={<VendorAuth />} />
          <Route path="/client-login" element={<ClientAuth />} />

          {/* Vendor Protected Interface */}
          <Route path="/workspace" element={<VendorRoute allowGuest><TryonWorkspace onExit={() => window.location.href = '/'} /></VendorRoute>} />
          <Route path="/gallery" element={<VendorRoute><VendorGallery /></VendorRoute>} />
          <Route path="/vendor/catalog" element={<VendorRoute b2bOnly><VendorCatalog /></VendorRoute>} />
          <Route path="/vendor/upload" element={<VendorRoute b2bOnly><VendorUpload /></VendorRoute>} />
          <Route path="/vendor/preview/:id" element={<VendorRoute b2bOnly><VendorTryon /></VendorRoute>} />

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

          {/* Said, not silently redirected: a mistyped or dead link used to land on the home
              page as if it had worked. */}
          <Route path="*" element={<ErrorScreen message="We couldn't find that page. The link may be mistyped or no longer exist." />} />
        </Routes>
        </Suspense>
      </div>
    </Router>
  );
}
