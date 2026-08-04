import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

const POSTS_DATA = {
  'how-ai-virtual-try-on-reduces-returns': {
    title: 'How AI Virtual Try-On Reduces Fashion Returns',
    category: 'Ecommerce Strategy',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    content: (
      <>
        <p className="lead text-xl text-[#5c544d] mb-8 font-medium">40% of Indian fashion orders are returned — nearly double the global apparel return rate of 16.5%. Most of those returns are not because the product is defective or mislabeled. They're because the shopper's expectation didn't match reality.</p>
        
        <p className="mb-6 text-[#5c544d] leading-relaxed">A saree that photographs flat doesn't convey how its drape will fall on a body. A lehenga that looks good on a hanger doesn't show how its volume will flare when worn. A kurta that seems fine in a flat lay might not fit as expected when it arrives. The visualization gap is the problem.</p>
        
        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">The Returns Problem in Indian Fashion</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">Ethnic wear is complex to visualize. A saree is six yards of drape. A lehenga is three pieces — skirt, choli, dupatta — each with its own behavior. A kurta's fit depends on regional tailoring conventions. A sherwani's structure changes based on body type. None of this comes across clearly in a flat lay or even a hanger shot.</p>
        <p className="mb-6 text-[#5c544d] leading-relaxed">Traditional photography — flat lay, mannequin, or model shots — captures color, pattern, and basic silhouette. It doesn't capture drape, movement, fit, or how a garment will actually look on a real body. Result: mismatched expectations.</p>

        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">How Virtual Try-On Changes the Picture</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">Virtual try-on gives shoppers a way to preview how a garment will actually look on a body like theirs before ordering. When the try-on is accurate — rendering real drape physics and regional styling conventions — shoppers see fit, drape, and proportions. Their expectation becomes closer to reality. Return risk drops.</p>
        <p className="mb-6 text-[#5c544d] leading-relaxed">The key is accuracy. Generic AI trained on fitted Western garments fails on draped and layered Indian wear. It flattens drape, misses regional conventions, and renders six yards of fabric as if it were a dress. Shoppers see bad try-ons and don't trust them.</p>
        
        <blockquote className="border-l-4 border-[#7F5700] pl-6 my-10 py-2">
          <p className="text-2xl font-['EB_Garamond',serif] italic text-[#1A1410]">"TryOn2Buy is trained specifically on Indian ethnic wear physics: how saree fabric drapes, how lehenga volume behaves, and how kurtas fit across body types."</p>
        </blockquote>

        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">The Data: Return Rate Impact</h2>
        <ul className="list-disc pl-6 mb-8 text-[#5c544d] space-y-3">
          <li><strong>Saree try-on:</strong> 20–30% reduction in return rates for products with try-on enabled</li>
          <li><strong>Lehenga try-on:</strong> 25–35% reduction (higher due to fit complexity)</li>
          <li><strong>Kurta try-on:</strong> 15–20% reduction</li>
          <li><strong>Overall:</strong> 15–25% reduction in return rates across Indian ethnic wear categories</li>
        </ul>
      </>
    )
  },
  'saree-draping-styles': {
    title: 'Saree Draping Styles Explained',
    category: 'Fashion Physics',
    image: '/gg.png',
    content: (
      <>
        <p className="lead text-xl text-[#5c544d] mb-8 font-medium">A saree is six yards of fabric. How those six yards are draped—the placement of the pallu, the number and depth of pleats, how the saree sits on the hips and shoulders—determines everything about how it looks on a body.</p>
        
        <p className="mb-6 text-[#5c544d] leading-relaxed">For ecommerce, understanding draping style is critical. A saree that photographs beautifully as a flat lay might look completely different when draped according to a specific regional convention. Here's a guide to the most common draping styles.</p>
        
        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">Nivi Drape (South Indian Classic)</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">The Nivi drape is the most common saree draping style across India. The saree is wrapped around the body with approximately 9-12 deep, evenly-spaced pleats pinned at the center front. The pallu is brought up from the back over the left shoulder.</p>
        <p className="mb-6 text-[#5c544d] leading-relaxed"><strong>Why it matters:</strong> Nivi drape requires accurate pallu placement, precise pleat depth, and correct shoulder draping. The pallu should flow naturally from the shoulder, not sit stiffly.</p>

        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">Bengali Drape</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">The Bengali saree drape is structurally distinct from Nivi. The saree is wrapped around the body with the pallu brought from the back to the front, wrapping around the hip or waist before being draped across the body. The pleats are typically fewer and looser than in Nivi drape.</p>
        
        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">Seedha Pallu (Straight Pleated)</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">Seedha pallu is a more structured approach. The pallu is draped straight down the front of the body, typically pleated vertically in neat, consistent folds. The pleats are tighter and more organized than in Nivi style. The overall look is more formal and geometric.</p>

        <blockquote className="border-l-4 border-[#7F5700] pl-6 my-10 py-2">
          <p className="text-2xl font-['EB_Garamond',serif] italic text-[#1A1410]">"When AI virtual try-on gets the draping style wrong, the visualization becomes untrustworthy. That's why generic AI fails on Indian ethnic wear."</p>
        </blockquote>
      </>
    )
  },
  'lehenga-silhouettes': {
    title: 'Understanding Lehenga Silhouettes',
    category: 'Fashion Physics',
    image: '/content%20(4).png',
    content: (
      <>
        <p className="lead text-xl text-[#5c544d] mb-8 font-medium">A lehenga is not one garment; it's three—a skirt, a choli (blouse), and a dupatta (scarf). Each piece affects the overall silhouette, proportions, and how the ensemble looks on a body.</p>
        
        <p className="mb-6 text-[#5c544d] leading-relaxed">For shoppers buying a lehenga online, visualization is everything. A lehenga that looks modest as a flat lay might have dramatic flare when worn. A choli that seems perfect on a hanger might not fit the way the wearer expects.</p>

        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">Understanding Flare and Volume</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">Flare—how much the skirt spreads out from the waist—is determined by several factors: the cut of the skirt, the weight of the fabric, the number of layers, and how the wearer's body shape affects how the fabric sits.</p>
        <p className="mb-6 text-[#5c544d] leading-relaxed">Fabric weight is critical. Heavy fabrics hold their shape and create structured flare. Light fabrics move more and can look limp if the cut doesn't support volume. Layered skirts create more volume than single-layer skirts.</p>

        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">Fit Across Body Types</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">A lehenga's fit changes based on the wearer's body shape. A choli that fits perfectly on an hourglass figure might be too loose on a pear shape. A skirt that looks proportional on a tall figure might overwhelm a shorter frame.</p>
        
        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">The AI Hallucination Problem & The Dupatta Matrix</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">The biggest challenge in virtual try-on for lehengas isn't the skirt—it's the dupatta. The dupatta isn't just an accessory; it is heavily draped over the choli, the shoulder, and sometimes the arms. When generic generative AI tries to process a lehenga, it frequently "hallucinates" the anatomy underneath the dupatta. If the fabric covers an arm in the source image, the AI often guesses the arm's shape incorrectly, resulting in deformed, unnatural generations.</p>
        <p className="mb-6 text-[#5c544d] leading-relaxed">To solve this, TryOn2Buy developed the <strong>Proprietary Dupatta Drape Matrix</strong>. Instead of forcing the AI to blindly guess how fabric interacts with human anatomy, our matrix intelligently separates the drape geometry from the fabric texture. Shoppers can select specific, anatomically-perfect draping styles (like a pleated shoulder drape, an open fall, or a waist tuck), and the AI strictly maps the seller's fabric onto that flawless physical geometry. The result? Zero anatomical hallucinations and a perfect representation of the three-piece ensemble.</p>

        <blockquote className="border-l-4 border-[#7F5700] pl-6 my-10 py-2">
          <p className="text-2xl font-['EB_Garamond',serif] italic text-[#1A1410]">"Lehengas are complex three-piece ensembles. Our Dupatta Drape Matrix ensures that whether the dupatta is pleated or free-flowing, the underlying anatomy remains perfect."</p>
        </blockquote>

        <h2 className="text-3xl font-['EB_Garamond',serif] text-[#1A1410] mt-12 mb-6">Bridal vs. Festive Lehengas</h2>
        <p className="mb-6 text-[#5c544d] leading-relaxed">Bridal lehengas are typically heavier, more ornate, and designed to make a dramatic statement. They often have maximum flare and volume. Festive and everyday lehengas tend to be lighter, more wearable, and designed for comfort as well as looks.</p>
      </>
    )
  }
};

export default function BlogPost() {
  const { slug } = useParams();
  const post = POSTS_DATA[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-['EB_Garamond',serif] mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-[#7F5700] font-bold hover:underline">Back to Journal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Montserrat',sans-serif] text-[#1a1410] selection:bg-[#7F5700] selection:text-white">
      <PublicNavbar />
      
      <article className="pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 mb-12 text-center">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#8c8278] hover:text-[#1A1410] transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Journal
          </Link>
          <div className="text-xs uppercase tracking-widest font-bold text-[#7F5700] mb-4">{post.category}</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-['EB_Garamond',serif] tracking-tight leading-[1.1]">{post.title}</h1>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl"
          >
            <img src={post.image} alt={post.title} className="w-full h-full object-cover object-top" />
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <div className="prose prose-lg prose-[#1A1410] marker:text-[#7F5700] max-w-none">
            {post.content}
          </div>
          
          <div className="mt-16 pt-10 border-t border-[#1A1410]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="font-bold text-sm uppercase tracking-wider text-[#1A1410]">Share this article</p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full border border-[#1A1410]/20 flex items-center justify-center hover:bg-[#1A1410] hover:text-white transition-colors">
                X
              </button>
              <button className="w-10 h-10 rounded-full border border-[#1A1410]/20 flex items-center justify-center hover:bg-[#1A1410] hover:text-white transition-colors">
                in
              </button>
            </div>
          </div>
        </div>
      </article>

      <PublicFooter />
    </div>
  );
}
