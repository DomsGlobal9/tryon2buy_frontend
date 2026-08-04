import React from 'react';
import CategoryLayout from '../CategoryLayout';

export default function LehengaTryOn() {
  return (
    <CategoryLayout 
      title={<>AI Lehenga Try-On <br/><span className="italic text-[#8c8278]">Flare, Volume, and Movement.</span></>}
      subtitle="A lehenga is not one garment; it's three — skirt, choli, dupatta."
      description="TryOn2Buy is trained on lehenga physics: skirt flare, fabric weight, how the choli sits, and exactly how the dupatta falls. With our proprietary Dupatta Drape Matrix, shoppers can visualize specific draping styles flawlessly. Brands see return rates drop."
      heroImage="/content%20(4).png"
      problemTitle="The Lehenga Visualization Challenge"
      problemText="A lehenga is a physics problem. A skirt with flare and volume depends on the wearer's body, movement, and how the fabric sits. A choli's fit depends on how it's tailored and how it pairs with the skirt. Furthermore, the dupatta isn't just an accessory—how it's draped completely changes the silhouette. Generic AI tools hallucinate bad anatomy when trying to guess how a heavy dupatta covers the arm or shoulder. They simply can't handle multi-piece layering."
      solutionTitle="Why TryOn2Buy Is Different"
      features={[
        { title: "Proprietary Dupatta Drape Matrix", desc: "We solved the dupatta hallucination problem. Shoppers can select specific draping styles (pleated shoulder, open fall, waist tuck) and our Matrix ensures the physical drape is anatomically perfect." },
        { title: "Multi-Piece Rendering", desc: "Lehenga is skirt + choli + dupatta. We render all three together, showing how they interact, layer, and drape on a body." },
        { title: "Fabric Weight & Volume", desc: "Heavy silks behave differently than georgettes. Our AI models fabric-specific behavior so the skirt flare looks authentic." },
        { title: "No Photoshoot Required", desc: "Start with a flat lay. We reconstruct the skirt volume, fit the choli, and apply the exact dupatta drape style automatically." }
      ]}
      impact={[
        { metric: "-35%", desc: "Reduction in return rates for try-on-enabled SKUs" },
        { metric: "+20%", desc: "AOV lift on bridal and festive categories" },
        { metric: "+50%", desc: "Increase in product page engagement" }
      ]}
    />
  );
}
