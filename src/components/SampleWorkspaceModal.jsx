import React from 'react';
import { Check } from 'lucide-react';

// Real samples provided by user
const realSampleSaree1 = "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/garments/_DSC0149.jpg";
const realSampleSaree2 = "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/garments/91be8c6a-9213-4627-b78d-088db18a08f3.jpg";
const realSampleBlouse1 = "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/garments/blouse1.JPG";
const realSampleBlouse2 = "https://gsriztjnocjwgqkaxhhz.supabase.co/storage/v1/object/public/tryon-fits/garments/blouse2.JPG";

// Anarkali Samples
const anarkaliFull1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1784805925/content_3_oudsco.jpg";
const anarkaliTop1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1784805925/content_5_ljagq5.jpg";
const anarkaliBottom1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1784805925/content_4_neb0xd.jpg";

const anarkaliFull2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1784806111/content_xaru3w.jpg";
const anarkaliTop2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1784806100/content_1_faort2.jpg";
const anarkaliBottom2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1784806110/content_7_c3zqmk.jpg";

// Lehenga Samples
const lehangaFull1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320656/debb32ea-b3f7-45a3-ac54-bdd9994a4cc1_nvldkp.png";
const lehangaTop1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320702/c3e089f3-070d-4d78-a34d-f0de46218ec9_drdbdl.png";
const lehangaBottom1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320694/c782961e-3680-4040-a45a-64ea894d74aa_nmppvx.png";

const lehangaFull2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320827/a6d2f9bd-311f-48a0-a5f1-dcd17810f051_jfgvhk.png";
const lehangaTop2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320841/b2e11fea-e1a6-443b-b5d3-927fecb3d7a9_lamxsr.png";
const lehangaBottom2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320829/acb9c58c-dafc-4a2d-8256-e601916ca0ae_bg86yu.png";

// Kurthi Samples
const kurthiFull1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320942/e7f57e95-ebda-44d0-89fe-b707d44cc03b_ddvj8t.png";
const kurthiTop1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320961/1ce21892-55e1-4eb0-8722-16d0a103d83e_rgyedx.png";
const kurthiBottom1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785320951/b0990a70-4d69-4bb6-ac51-c88ed9f5dab3_yzzq1f.png";

const kurthiFull2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785321138/1d12a54e-ee96-4fff-9665-b61b964efff6_pgumoy.png";
const kurthiTop2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785321165/ce64fd21-a18f-488a-a1ec-00c6e1e4302f_fsznty.png";
const kurthiBottom2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785321148/92b1b0db-647a-406c-a105-bb02845e1a48_gokm1t.png";

// Sharara Samples
const shararaFull1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785411910/e0687f57-d87a-41ac-a419-e41f898dd693_xpjjrt.png";
const shararaTop1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785411923/58c545d2-641f-4b8e-8103-bcd2503ac445_zuoopf.png";
const shararaBottom1 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785411917/440841db-9cda-482f-a787-89775b245cd9_vm86hm.png";

const shararaFull2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785411930/13518b41-1197-49b3-9410-b76da5d129c0_eocv0e.png";
const shararaTop2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785412086/44346846-408e-4e72-a390-7b6adb550a78_nwjbsq.png";
const shararaBottom2 = "https://res.cloudinary.com/doiezptnn/image/upload/v1785411950/29ab400e-a62f-4b76-b23d-bfb055850b6c_jucwky.png";

export default function SampleWorkspaceModal({ isOpen, onClose, category, garmentUploads, setGarmentUploads }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF7F2] border border-[#1a1410] max-w-4xl w-full p-5 md:p-6 relative shadow-2xl rounded-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#1A1410] hover:text-[#7f5700] transition-colors bg-white rounded-full p-1 shadow-sm z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div className="flex-shrink-0">
          <h2 className="font-['Playfair_Display',serif] text-xl md:text-2xl text-[#1A1410] mb-1">
            Sample Materials
          </h2>
          <p className="text-[10px] md:text-[11px] text-[#8c8278] font-sans leading-relaxed mb-4">
            {category === 'SAREE' 
              ? 'Select a saree and blouse to automatically load them into your workspace. You can close this window at any time.'
              : `Select ${category.toLowerCase()} views to automatically load them into your workspace. You can close this window at any time.`
            }
          </p>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
          
          {category !== 'SAREE' && category !== 'ANARKALI' && category !== 'LEHANGA' && category !== 'KURTHI' && category !== 'SHARARA' && (
            <div className="text-center py-12 text-[#8c8278] text-[11px] font-bold tracking-[1.5px] uppercase border-2 border-dashed border-[#dcd6cc] rounded-xl bg-white">
              No sample materials available for {category} yet.
            </div>
          )}

          {/* Saree Section */}
          {category === 'SAREE' && (
          <div className="bg-white p-4 border border-[rgba(26,20,16,0.08)] rounded-xl">
            <h3 className="font-['Playfair_Display',serif] text-base text-[#1A1410] mb-3">Saree & Blouse Samples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Saree Grid */}
              <div className="space-y-4">
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 flex items-center justify-between">
                  <span>Pick Saree</span>
                  {garmentUploads.saree && <Check className="w-3.5 h-3.5 text-green-600" />}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setGarmentUploads(prev => ({ ...prev, saree: { url: realSampleSaree1, file: null } }));
                    }}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.saree?.url === realSampleSaree1 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}
                  >
                    <img src={realSampleSaree1} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {garmentUploads.saree?.url === realSampleSaree1 && (
                      <div className="absolute top-2 right-2 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[9px] font-bold tracking-[1px] uppercase border border-white px-3 py-1.5 rounded-full backdrop-blur-sm">Select</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      setGarmentUploads(prev => ({ ...prev, saree: { url: realSampleSaree2, file: null } }));
                    }}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.saree?.url === realSampleSaree2 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}
                  >
                    <img src={realSampleSaree2} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {garmentUploads.saree?.url === realSampleSaree2 && (
                      <div className="absolute top-2 right-2 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[9px] font-bold tracking-[1px] uppercase border border-white px-3 py-1.5 rounded-full backdrop-blur-sm">Select</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Blouse Grid */}
              <div className="space-y-4">
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 flex items-center justify-between">
                  <span>Pick Blouse</span>
                  {garmentUploads.blouse && <Check className="w-3.5 h-3.5 text-green-600" />}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      setGarmentUploads(prev => ({ ...prev, blouse: { url: realSampleBlouse1, file: null } }));
                    }}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.blouse?.url === realSampleBlouse1 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}
                  >
                    <img src={realSampleBlouse1} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {garmentUploads.blouse?.url === realSampleBlouse1 && (
                      <div className="absolute top-2 right-2 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[9px] font-bold tracking-[1px] uppercase border border-white px-3 py-1.5 rounded-full backdrop-blur-sm">Select</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      setGarmentUploads(prev => ({ ...prev, blouse: { url: realSampleBlouse2, file: null } }));
                    }}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.blouse?.url === realSampleBlouse2 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}
                  >
                    <img src={realSampleBlouse2} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {garmentUploads.blouse?.url === realSampleBlouse2 && (
                      <div className="absolute top-2 right-2 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[9px] font-bold tracking-[1px] uppercase border border-white px-3 py-1.5 rounded-full backdrop-blur-sm">Select</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Anarkali Section */}
          {category === 'ANARKALI' && (
          <div className="bg-white p-4 border border-[rgba(26,20,16,0.08)] rounded-xl">
            <h3 className="font-['Playfair_Display',serif] text-base text-[#1A1410] mb-3">Anarkali Samples</h3>
            <div className="space-y-4">
              
              {/* Dress 1 */}
              <div>
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 mb-3">
                  Pink Anarkali Suit
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'full', url: anarkaliFull1, label: 'Full' },
                    { id: 'top', url: anarkaliTop1, label: 'Top' },
                    { id: 'bottom', url: anarkaliBottom1, label: 'Bottom' }
                  ].map((slot) => (
                    <button key={slot.id} onClick={() => setGarmentUploads({
                      full: { url: anarkaliFull1, file: null },
                      top: { url: anarkaliTop1, file: null },
                      bottom: { url: anarkaliBottom1, file: null }
                    })}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.full?.url === anarkaliFull1 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}>
                      <img src={slot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 text-[7px] uppercase tracking-wider rounded-sm font-bold backdrop-blur-sm">{slot.label}</div>
                      {garmentUploads.full?.url === anarkaliFull1 && <div className="absolute top-1 left-1 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dress 2 */}
              <div>
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 mb-3">
                  Green Anarkali Suit
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'full', url: anarkaliFull2, label: 'Full' },
                    { id: 'top', url: anarkaliTop2, label: 'Top' },
                    { id: 'bottom', url: anarkaliBottom2, label: 'Bottom' }
                  ].map((slot) => (
                    <button key={slot.id} onClick={() => setGarmentUploads({
                      full: { url: anarkaliFull2, file: null },
                      top: { url: anarkaliTop2, file: null },
                      bottom: { url: anarkaliBottom2, file: null }
                    })}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.full?.url === anarkaliFull2 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}>
                      <img src={slot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 text-[7px] uppercase tracking-wider rounded-sm font-bold backdrop-blur-sm">{slot.label}</div>
                      {garmentUploads.full?.url === anarkaliFull2 && <div className="absolute top-1 left-1 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
          )}

          {/* Lehanga Section */}
          {category === 'LEHANGA' && (
          <div className="bg-white p-4 border border-[rgba(26,20,16,0.08)] rounded-xl">
            <h3 className="font-['Playfair_Display',serif] text-base text-[#1A1410] mb-3">Lehenga Samples</h3>
            <div className="space-y-4">
              
              {/* Dress 1 */}
              <div>
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 mb-3">
                  Pink Lehenga Set
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'full', url: lehangaFull1, label: 'Full' },
                    { id: 'top', url: lehangaTop1, label: 'Top' },
                    { id: 'bottom', url: lehangaBottom1, label: 'Bottom' }
                  ].map((slot) => (
                    <button key={slot.id} onClick={() => setGarmentUploads({
                      full: { url: lehangaFull1, file: null },
                      top: { url: lehangaTop1, file: null },
                      bottom: { url: lehangaBottom1, file: null }
                    })}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.full?.url === lehangaFull1 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}>
                      <img src={slot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 text-[7px] uppercase tracking-wider rounded-sm font-bold backdrop-blur-sm">{slot.label}</div>
                      {garmentUploads.full?.url === lehangaFull1 && <div className="absolute top-1 left-1 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dress 2 */}
              <div>
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 mb-3">
                  Blue Lehenga Set
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'full', url: lehangaFull2, label: 'Full' },
                    { id: 'top', url: lehangaTop2, label: 'Top' },
                    { id: 'bottom', url: lehangaBottom2, label: 'Bottom' }
                  ].map((slot) => (
                    <button key={slot.id} onClick={() => setGarmentUploads({
                      full: { url: lehangaFull2, file: null },
                      top: { url: lehangaTop2, file: null },
                      bottom: { url: lehangaBottom2, file: null }
                    })}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.full?.url === lehangaFull2 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}>
                      <img src={slot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 text-[7px] uppercase tracking-wider rounded-sm font-bold backdrop-blur-sm">{slot.label}</div>
                      {garmentUploads.full?.url === lehangaFull2 && <div className="absolute top-1 left-1 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
          )}

          {/* Kurthi Section */}
          {category === 'KURTHI' && (
          <div className="bg-white p-4 border border-[rgba(26,20,16,0.08)] rounded-xl">
            <h3 className="font-['Playfair_Display',serif] text-base text-[#1A1410] mb-3">Kurta Samples</h3>
            <div className="space-y-4">
              
              {/* Dress 1 */}
              <div>
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 mb-3">
                  Navy Blue Kurta Set
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'full', url: kurthiFull1, label: 'Full' },
                    { id: 'top', url: kurthiTop1, label: 'Top' },
                    { id: 'bottom', url: kurthiBottom1, label: 'Bottom' }
                  ].map((slot) => (
                    <button key={slot.id} onClick={() => setGarmentUploads({
                      full: { url: kurthiFull1, file: null },
                      top: { url: kurthiTop1, file: null },
                      bottom: { url: kurthiBottom1, file: null }
                    })}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.full?.url === kurthiFull1 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}>
                      <img src={slot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 text-[7px] uppercase tracking-wider rounded-sm font-bold backdrop-blur-sm">{slot.label}</div>
                      {garmentUploads.full?.url === kurthiFull1 && <div className="absolute top-1 left-1 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dress 2 */}
              <div>
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 mb-3">
                  Olive Green Kurta Set
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'full', url: kurthiFull2, label: 'Full' },
                    { id: 'top', url: kurthiTop2, label: 'Top' },
                    { id: 'bottom', url: kurthiBottom2, label: 'Bottom' }
                  ].map((slot) => (
                    <button key={slot.id} onClick={() => setGarmentUploads({
                      full: { url: kurthiFull2, file: null },
                      top: { url: kurthiTop2, file: null },
                      bottom: { url: kurthiBottom2, file: null }
                    })}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.full?.url === kurthiFull2 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}>
                      <img src={slot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 text-[7px] uppercase tracking-wider rounded-sm font-bold backdrop-blur-sm">{slot.label}</div>
                      {garmentUploads.full?.url === kurthiFull2 && <div className="absolute top-1 left-1 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
          )}

          {/* Sharara Section */}
          {category === 'SHARARA' && (
          <div className="bg-white p-4 border border-[rgba(26,20,16,0.08)] rounded-xl">
            <h3 className="font-['Playfair_Display',serif] text-base text-[#1A1410] mb-3">Sharara Samples</h3>
            <div className="space-y-4">
              
              {/* Dress 1 */}
              <div>
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 mb-3">
                  Peach Sharara Suit
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'full', url: shararaFull1, label: 'Full' },
                    { id: 'top', url: shararaTop1, label: 'Top' },
                    { id: 'bottom', url: shararaBottom1, label: 'Bottom' }
                  ].map((slot) => (
                    <button key={slot.id} onClick={() => setGarmentUploads({
                      full: { url: shararaFull1, file: null },
                      top: { url: shararaTop1, file: null },
                      bottom: { url: shararaBottom1, file: null }
                    })}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.full?.url === shararaFull1 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}>
                      <img src={slot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 text-[7px] uppercase tracking-wider rounded-sm font-bold backdrop-blur-sm">{slot.label}</div>
                      {garmentUploads.full?.url === shararaFull1 && <div className="absolute top-1 left-1 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dress 2 */}
              <div>
                <h4 className="text-[10px] tracking-[1.5px] uppercase font-bold text-[#1A1410] border-b border-[rgba(26,20,16,0.1)] pb-2 mb-3">
                  Maroon & Taupe Embroidered Sharara
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'full', url: shararaFull2, label: 'Full' },
                    { id: 'top', url: shararaTop2, label: 'Top' },
                    { id: 'bottom', url: shararaBottom2, label: 'Bottom' }
                  ].map((slot) => (
                    <button key={slot.id} onClick={() => setGarmentUploads({
                      full: { url: shararaFull2, file: null },
                      top: { url: shararaTop2, file: null },
                      bottom: { url: shararaBottom2, file: null }
                    })}
                    className={`border-2 rounded-xl overflow-hidden transition-all group aspect-[3/4] relative ${garmentUploads.full?.url === shararaFull2 ? 'border-[#7f5700] shadow-md scale-[1.02]' : 'border-[rgba(0,0,0,0.05)] hover:border-[#dcd6cc]'}`}>
                      <img src={slot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1.5 py-0.5 text-[7px] uppercase tracking-wider rounded-sm font-bold backdrop-blur-sm">{slot.label}</div>
                      {garmentUploads.full?.url === shararaFull2 && <div className="absolute top-1 left-1 bg-[#7f5700] text-white rounded-full p-1 shadow-sm"><Check className="w-3 h-3" /></div>}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
          )}

        </div>

      </div>
    </div>
  );
}
