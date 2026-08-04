import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

export default function CategoryLayout({ 
  title, 
  subtitle, 
  description, 
  heroImage, 
  problemTitle, 
  problemText,
  solutionTitle,
  features,
  impact 
}) {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Montserrat',sans-serif] text-[#1a1410] selection:bg-[#7F5700] selection:text-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 border-b border-[#1A1410]/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-['EB_Garamond',serif] tracking-tight leading-[1.1] mb-6">
                {title}
              </h1>
              <p className="text-xl font-bold text-[#7F5700] mb-6">{subtitle}</p>
              <p className="text-[#5c544d] text-lg leading-relaxed mb-10 max-w-lg">
                {description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login"
                  className="px-8 py-4 bg-[#1A1410] text-white rounded-full font-bold hover:bg-[#7F5700] transition-colors flex items-center justify-center gap-2"
                >
                  Start Generating <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-[#1A1410]/5"
            >
              <img src={heroImage} alt={title} className="w-full h-full object-cover object-top" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-['EB_Garamond',serif] mb-6 text-[#1A1410]/60">The Problem</h2>
              <h3 className="text-2xl font-bold mb-4">{problemTitle}</h3>
              <p className="text-[#5c544d] leading-relaxed text-lg">{problemText}</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#faf7f2] p-8 md:p-10 rounded-3xl border border-[#1A1410]/5"
            >
              <h2 className="text-3xl font-['EB_Garamond',serif] mb-6 text-[#7F5700]">The Solution</h2>
              <h3 className="text-2xl font-bold mb-4">{solutionTitle}</h3>
              <div className="space-y-6 mt-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-[#7F5700]" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{feature.title}</h4>
                      <p className="text-[#5c544d]">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-[#1A1410] text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-['EB_Garamond',serif] mb-12">Real-World Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {impact.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                  <div className="text-4xl font-bold text-[#7F5700] mb-4">{item.metric}</div>
                  <div className="text-white/80">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
