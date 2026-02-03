'use client';

import { useEffect, useRef } from 'react';

export default function TrustpilotWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Trustpilot script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).Trustpilot) {
      const script = document.createElement('script');
      script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).Trustpilot && ref.current) {
          (window as any).Trustpilot.loadFromElement(ref.current, true);
        }
      };
      document.head.appendChild(script);
    } else if ((window as any).Trustpilot && ref.current) {
      // Script already loaded, just initialize widget
      (window as any).Trustpilot.loadFromElement(ref.current, true);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale="nb-NO"
      data-template-id="53aa8807dec7e10d38f59f32"
      data-businessunit-id="66dafd02a666ab140e2c4dbc"
      data-style-height="150px"
      data-style-width="100%"
      data-theme="light"
      data-stars="4,5"
    >
      <a 
        href="https://www.trustpilot.com/review/kryptohjelpen.no" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#00b67a] text-white font-semibold rounded-lg hover:bg-[#009567] transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        Se våre anmeldelser på Trustpilot
      </a>
    </div>
  );
}
