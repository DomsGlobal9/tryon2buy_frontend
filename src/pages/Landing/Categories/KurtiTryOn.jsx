import React from 'react';
import CategoryLayout from '../CategoryLayout';

export default function KurtiTryOn() {
  return (
    <CategoryLayout 
      title={<>AI Kurti Try-On <br/><span className="italic text-[#8c8278]">Fit, Structure, and Regional Tailoring.</span></>}
      subtitle="A kurti's fit is everything."
      description="TryOn2Buy is trained on how kurtis sit on different body types and how regional tailoring conventions affect the final look. Shoppers see fit, not just style. Brands see return rates drop."
      heroImage="/ChatGPT%20Image%20Aug%204,%202026,%2002_47_43%20PM.png"
      problemTitle="The Kurti Fit Problem"
      problemText="A kurti's fit depends on shoulder width, torso length, chest fullness, and how the hemline hits the body. A flat lay shows the pattern and color. A hanger shot shows the silhouette. Neither shows how it will actually fit on a real body. Generic try-on tools don't understand regional kurti cuts. A Rajasthani kurti is not a Bengal kurti."
      solutionTitle="Why TryOn2Buy Is Different"
      features={[
        { title: "Trained on Regional Tailoring", desc: "Our AI understands how regional kurti cuts affect fit. Rajasthani, Bengali, Punjabi, Lucknowi — each has distinct proportions." },
        { title: "Fit Across Body Types", desc: "How a kurti sits on different shoulder widths, how length works on different heights — our AI models real-world variation." },
        { title: "For Sets and Layering", desc: "Kurti sets (kurti + pajama or palazzo) are handled as ensembles. We show how pieces layer and interact." },
        { title: "No Photoshoot Required", desc: "Start with hanger, flat lay, or model shots. We generate fit-accurate try-ons across body types automatically." }
      ]}
      impact={[
        { metric: "-20%", desc: "Reduction in return rates for fit-related issues" },
        { metric: "+15%", desc: "AOV lift on kurti categories" },
        { metric: "-40%", desc: "Drop in 'sleeves too long' complaints" }
      ]}
    />
  );
}
