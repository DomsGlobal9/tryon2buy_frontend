import React from 'react';
import CategoryLayout from '../CategoryLayout';

export default function AnarkaliTryOn() {
  return (
    <CategoryLayout 
      title={<>AI Anarkali Try-On <br/><span className="italic text-[#8c8278]">Floor-Length Flow and Fit.</span></>}
      subtitle="The beauty of an Anarkali lies in its seamless flow from the bodice to the floor."
      description="TryOn2Buy renders the majestic sweep and volume of Anarkali suits with unparalleled physical accuracy. Shoppers see the true majesty of the garment. Brands see return rates drop."
      heroImage="/ChatGPT%20Image%20Aug%204,%202026,%2002_42_31%20PM.png"
      problemTitle="The Anarkali Visualization Challenge"
      problemText="An Anarkali is defined by its fitted bodice (choli) that flares out into a long, umbrella-like skirt (kali). Flat photography makes this garment look like a shapeless triangle. To truly understand an Anarkali, a shopper must see how the fabric drapes across the chest, cinches at the waist, and billows out to the floor."
      solutionTitle="Why TryOn2Buy Is Different"
      features={[
        { title: "Precise Bodice Fit", desc: "Our AI understands that the upper half of an Anarkali must look sharply tailored, contrasting with the flow of the skirt." },
        { title: "Kali (Panel) Rendering", desc: "We accurately model the 'kalis' (vertical panels) that give the Anarkali its signature umbrella flare." },
        { title: "Floor-Length Physics", desc: "We render how heavy fabrics pool or sweep across the floor, giving a true sense of length and grandeur." },
        { title: "Dupatta Integration", desc: "Seamlessly models how the dupatta interacts with the voluminous skirt and fitted bodice." }
      ]}
      impact={[
        { metric: "-28%", desc: "Reduction in return rates for Anarkali suits" },
        { metric: "+22%", desc: "AOV lift on luxury ethnic wear" },
        { metric: "-35%", desc: "Drop in 'fit/length was wrong' complaints" }
      ]}
    />
  );
}
