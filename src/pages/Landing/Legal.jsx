import React from 'react';
import PublicNavbar from '../../components/PublicNavbar';
import PublicFooter from '../../components/PublicFooter';

/**
 * Privacy Policy and Terms of Service.
 *
 * DRAFT, written on 10 Oct 2026 from what the code actually does (Google's Gemini models make
 * the images, Supabase stores them, the browser keeps a selfie for 20 minutes, no analytics).
 * It promises nothing the code does not already do. It has not been reviewed by a lawyer;
 * have it checked before relying on it, and update it whenever data handling changes.
 */

const UPDATED = '10 October 2026';
const CONTACT = 'info@tryon2buy.com';

function LegalPage({ title, children }) {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-['Montserrat',sans-serif] text-[#1a1410]">
      <PublicNavbar />
      <main className="pt-32 pb-24 md:pt-44 px-6 md:px-12 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-['EB_Garamond',serif] tracking-tight mb-3">{title}</h1>
        <p className="text-sm text-[#8c8278] mb-12">Last updated {UPDATED}</p>
        <div className="space-y-8 text-[15px] leading-relaxed text-[#3d342c] [&_h2]:text-xl [&_h2]:font-['EB_Garamond',serif] [&_h2]:text-[#1a1410] [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:underline">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        TryOn2Buy, run by Tryon2Buy Technology, lets shops show their garments on models and lets
        shoppers see a garment on themselves. This page explains what we collect, why, and who
        else handles it.
      </p>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Photos you upload</strong>: a photo of yourself to try a garment on, or garment photos uploaded by a shop.</li>
          <li><strong>Try-on results</strong>: the images we create from those photos.</li>
          <li><strong>Shop accounts</strong>: name, store name, email address and a password, which we store only in hashed (scrambled) form.</li>
          <li><strong>Usage counts</strong>: how many try-ons an account or device has made, so free limits and plans can be applied.</li>
        </ul>
        <p>We do not ask shoppers to create an account, and we do not use advertising or analytics trackers.</p>
      </section>

      <section>
        <h2>How your photo is used</h2>
        <p>
          Your photo is used only to create the try-on you asked for. To do that it is sent to
          Google's Gemini AI service, which generates the image. Photos and results are stored
          with our cloud storage provider, Supabase. Anyone you share a try-on link with can see
          the image behind that link.
        </p>
        <p>
          When you try on a garment from a tag scanned in a shop, the request goes through the
          shop's ScaleEzy account, so that shop's try-on allowance is used.
        </p>
      </section>

      <section>
        <h2>What stays on your device</h2>
        <ul>
          <li>Your photo is kept in your browser so you can try on several garments. It is removed after 20 minutes of not being used, or when you delete it.</li>
          <li>A random device code, so free try-ons can be counted per device without an account.</li>
          <li>Your login, if you run a shop account.</li>
        </ul>
        <p>Clearing your browser's site data removes all of these.</p>
      </section>

      <section>
        <h2>Sharing</h2>
        <p>
          We do not sell your photos or personal information. We share them only with the
          services that run TryOn2Buy (Google for image generation, Supabase for storage) and
          with the shop whose garment you tried on, or when the law requires it.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can delete try-ons from your history at any time. To have a photo, try-on or shop
          account removed from our storage, or to ask what we hold about you, email{' '}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If we change how we handle your information, we will update this page and the date above.</p>
      </section>
    </LegalPage>
  );
}

export function TermsOfService() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms apply when you use TryOn2Buy, run by Tryon2Buy Technology, whether as a shop
        or as a shopper. By using the service you agree to them.
      </p>

      <section>
        <h2>The service</h2>
        <p>
          TryOn2Buy uses AI to show garments on models or on your own photo. Results are
          illustrations: colour, fit, drape and detail can differ from the real garment, so
          please check the product itself before buying.
        </p>
      </section>

      <section>
        <h2>Your photos</h2>
        <ul>
          <li>Only upload photos you have the right to use, and photos of other people only with their permission.</li>
          <li>Do not upload anything unlawful, sexual, or meant to harass or impersonate someone.</li>
          <li>You keep ownership of what you upload. You allow us to process it to provide the service, as described in our <a href="/privacy">Privacy Policy</a>.</li>
        </ul>
      </section>

      <section>
        <h2>Shop accounts</h2>
        <ul>
          <li>Keep your login details private; you are responsible for what is done with your account.</li>
          <li>Shops are responsible for their own product photos and descriptions, and for the right to use them.</li>
          <li>Free try-ons and plan credits are limited. When they run out, generation stops until the allowance is renewed or upgraded.</li>
        </ul>
      </section>

      <section>
        <h2>Fair use</h2>
        <p>
          Do not try to break, overload or copy the service, get around usage limits, or use it
          to build a competing product. We may suspend access that does.
        </p>
      </section>

      <section>
        <h2>No guarantees</h2>
        <p>
          We work to keep TryOn2Buy available and accurate, but the service is provided as it is,
          without guarantees that it will always be available or that every result will be
          correct. To the extent the law allows, we are not liable for decisions made from a
          try-on result.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          We may update these terms; the date above shows the latest version. Questions:{' '}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
