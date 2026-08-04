import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

const BLOG_POSTS = [
  {
    slug: 'how-ai-virtual-try-on-reduces-returns',
    title: 'How AI Virtual Try-On Reduces Fashion Returns',
    description: '40% of Indian fashion orders are returned. Most are because the shopper\'s expectation didn\'t match reality. Learn how accurate visualization fixes this.',
    category: 'Ecommerce Strategy',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
  },
  {
    slug: 'saree-draping-styles',
    title: 'Saree Draping Styles Explained',
    description: 'Nivi, Bengali, seedha pallu, and more. Understand how draping style affects silhouette, fit, and why generic AI gets it wrong.',
    category: 'Fashion Physics',
    image: '/gg.png'
  },
  {
    slug: 'lehenga-silhouettes',
    title: 'Understanding Lehenga Silhouettes',
    description: 'A lehenga is not one garment; it\'s three. A complete guide to flare, volume, fit, and how different body types change the final look.',
    category: 'Fashion Physics',
    image: '/content%20(4).png'
  }
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Montserrat',sans-serif] text-[#1a1410] selection:bg-[#7F5700] selection:text-white">
      <PublicNavbar />
      
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-['EB_Garamond',serif] tracking-tight mb-6">
            The TryOn2Buy Journal
          </h1>
          <p className="text-lg text-[#5c544d] leading-relaxed">
            Insights on fashion physics, ecommerce strategy, and the future of virtual try-on for Indian ethnic wear.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="group block h-full bg-white rounded-3xl overflow-hidden border border-[#1A1410]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#ede8df]">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] uppercase tracking-widest font-bold text-[#1A1410]">
                    {post.category}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-[#7F5700] transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-[#5c544d] text-sm leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
