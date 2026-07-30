import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { User, Building2, Briefcase, Phone, Save, Loader2, CheckCircle2, Mail, X, Info } from 'lucide-react';

export default function VendorProfileModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [profile, setProfile] = useState({
    companyName: '',
    businessType: '',
    mobileNumber: ''
  });

  const [vendorData, setVendorData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('vendor_token');
        if (!token) return;

        const res = await fetch(`${API_URL}/api/auth/vendor/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch profile');
        
        const data = await res.json();
        setVendorData(data);
        setProfile({
          companyName: data.companyName || '',
          businessType: data.businessType || '',
          mobileNumber: data.mobileNumber || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [isOpen]);

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('vendor_token');
      const res = await fetch(`${API_URL}/api/auth/vendor/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!res.ok) throw new Error('Failed to save profile');
      
      const data = await res.json();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update local storage if needed
      const currentVendorData = JSON.parse(localStorage.getItem('vendor_data') || '{}');
      localStorage.setItem('vendor_data', JSON.stringify({ ...currentVendorData, ...data.vendor }));
      
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a1410]/40 backdrop-blur-sm font-['Space_Grotesk',sans-serif]">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#1a1410] hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="p-6 sm:p-8">
            {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#7f5700] mb-4" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Loading Profile...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-[#faf7f2] rounded-full flex items-center justify-center mb-3 border border-[#e5e0d8] text-[#7f5700]">
                  <User className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h2 className="text-xl font-bold text-[#1a1410] mb-1">Business Profile</h2>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                
                {/* Email Address (Read-Only) */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address (Login)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={vendorData?.email || ''}
                      readOnly
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 ml-1 mt-1">
                    <Info className="w-3 h-3 text-[#7f5700]" />
                    <p className="text-[9px] font-medium text-gray-400">Read only. Contact administrator to edit.</p>
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#8c8278] ml-1">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-[#8c8278]" />
                    <input
                      type="text"
                      name="companyName"
                      value={profile.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Sirimalle Silks"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-[#1a1410] text-sm focus:outline-none focus:border-[#7f5700] focus:ring-1 focus:ring-[#7f5700] transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Business Type */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#8c8278] ml-1">Business Type</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-[#8c8278]" />
                    <input
                      type="text"
                      name="businessType"
                      value={profile.businessType}
                      onChange={handleChange}
                      placeholder="e.g. Retail Boutique"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-[#1a1410] text-sm focus:outline-none focus:border-[#7f5700] focus:ring-1 focus:ring-[#7f5700] transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#8c8278] ml-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#8c8278]" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={profile.mobileNumber}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e5e0d8] rounded-xl text-[#1a1410] text-sm focus:outline-none focus:border-[#7f5700] focus:ring-1 focus:ring-[#7f5700] transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  {message?.type === 'error' && (
                    <div className="mb-3 text-center text-[10px] font-bold text-red-600 uppercase tracking-widest">
                      {message.text}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={saving || message?.type === 'success'}
                    className={`w-full text-white py-3 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                      message?.type === 'success' ? 'bg-green-600' : 'bg-[#1a1410] hover:bg-black disabled:opacity-70'
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : message?.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : message?.type === 'success' ? 'Updated Successfully!' : 'Save Profile'}
                  </button>
                </div>

              </form>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
