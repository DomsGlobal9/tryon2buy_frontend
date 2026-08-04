import React from 'react';
import CategoryLayout from '../CategoryLayout';

export default function ShararaTryOn() {
  return (
    <CategoryLayout 
      title={<>AI Sharara Try-On <br/><span className="italic text-[#8c8278]">Trouser Volume and Layering.</span></>}
      subtitle="A sharara's signature is its dramatic flare from the knee down."
      description="TryOn2Buy renders sharara sets with accurate fit and volume. Shoppers see how the multi-layered trouser will actually move and drape. Brands see return rates drop."
      heroImage="/ChatGPT%20Image%20Aug%204,%202026,%2002_51_46%20PM.png"
      problemTitle="The Sharara Visualization Challenge"
      problemText="A sharara is defined by its silhouette—fitted at the thighs and dramatically flared below the knee. A flat lay cannot capture this volume, and a generic hanger shot fails to show how the layers of fabric fall around the legs. Shoppers need to see the fit of the short kurti combined with the volume of the trousers."
      solutionTitle="Why TryOn2Buy Is Different"
      features={[
        { title: "Accurate Trouser Volume", desc: "Our AI specifically models the 'gota' (knee joint) gather and the subsequent flare of the sharara bottom." },
        { title: "Multi-Piece Ensemble Rendering", desc: "We accurately layer the short kurti over the flared trousers, maintaining the correct proportions." },
        { title: "Fabric-Specific Drape", desc: "Whether it's heavy brocade or light georgette, the AI renders the flare according to the fabric's actual physical properties." },
        { title: "No Photoshoot Required", desc: "Generate full-ensemble try-ons from simple flat lays of the individual pieces." }
      ]}
      impact={[
        { metric: "-25%", desc: "Reduction in return rates for Sharara sets" },
        { metric: "+15%", desc: "AOV lift on festive and bridal wear" },
        { metric: "+45%", desc: "Increase in product page engagement" }
      ]}
    />
  );
}
