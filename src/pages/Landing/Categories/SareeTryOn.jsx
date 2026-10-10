import React from 'react';
import CategoryLayout from '../CategoryLayout';

export default function SareeTryOn() {
  return (
    <CategoryLayout 
      title={<>AI Saree Try-On <br/><span className="italic text-muted">Accurate Drape Rendering.</span></>}
      subtitle="Sarees are six yards of drape, not a dress."
      description="TryOn2Buy is built for how a saree really drapes: the pleats, the pallu over the shoulder and the border along the hem. Shoppers see how the saree will actually look before they buy."
      heroImage="/gg.png"
      problemTitle="The Saree Visualization Problem"
      problemText="A saree photograph doesn't tell you how it drapes. Flat lay shows color and pattern. Hanger shot shows fabric weight. Neither shows how six yards of silk will move, fold, and fall on an actual body. Generic AI tools trained on fitted Western garments fail—they flatten drape, miss regional conventions, and render six yards of fabric as if it were a dress."
      solutionTitle="Why TryOn2Buy Is Different"
      features={[
        { title: "Trained on Real Physics", desc: "Our AI is trained on how saree fabric actually behaves — weight, movement, fold patterns, how the pallu falls across the shoulder." },
        { title: "Saree and Blouse Together", desc: "Upload the saree on its own, or add the blouse as a separate photo so the try-on uses the exact blouse you sell." },
        { title: "No Photoshoot Required", desc: "Start with flat lay, hanger, or mannequin shots. We generate try-ons across body types and skin tones automatically." },
        { title: "Catalog Scale Automation", desc: "Upload your entire catalog and get back rendered try-ons for multiple body types and draping styles." }
      ]}
    />
  );
}
