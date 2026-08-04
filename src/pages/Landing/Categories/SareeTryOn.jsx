import React from 'react';
import CategoryLayout from '../CategoryLayout';

export default function SareeTryOn() {
  return (
    <CategoryLayout 
      title={<>AI Saree Try-On <br/><span className="italic text-[#8c8278]">Accurate Drape Rendering.</span></>}
      subtitle="Sarees are six yards of drape, not a dress."
      description="TryOn2Buy is the only virtual try-on platform trained on real saree draping physics — Nivi, Bengali, seedha pallu, and regional variants. Shoppers see how the saree will actually look. Brands see return rates drop."
      heroImage="/gg.png"
      problemTitle="The Saree Visualization Problem"
      problemText="A saree photograph doesn't tell you how it drapes. Flat lay shows color and pattern. Hanger shot shows fabric weight. Neither shows how six yards of silk will move, fold, and fall on an actual body. Generic AI tools trained on fitted Western garments fail—they flatten drape, miss regional conventions, and render six yards of fabric as if it were a dress."
      solutionTitle="Why TryOn2Buy Is Different"
      features={[
        { title: "Trained on Real Physics", desc: "Our AI is trained on how saree fabric actually behaves — weight, movement, fold patterns, how the pallu falls across the shoulder." },
        { title: "Regional Draping Styles", desc: "Nivi drape, Bengali drape, Seedha pallu, Coorgi drape. We render each with regional authenticity." },
        { title: "No Photoshoot Required", desc: "Start with flat lay, hanger, or mannequin shots. We generate try-ons across body types and skin tones automatically." },
        { title: "Catalog Scale Automation", desc: "Upload your entire catalog and get back rendered try-ons for multiple body types and draping styles." }
      ]}
      impact={[
        { metric: "-30%", desc: "Reduction in return rates for try-on-enabled SKUs" },
        { metric: "+18%", desc: "AOV lift on saree categories" },
        { metric: "+40%", desc: "Increase in product page time-on-page" }
      ]}
    />
  );
}
