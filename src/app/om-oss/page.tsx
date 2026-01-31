export const metadata = {
  title: 'Om oss - Kryptohjelpen.no',
  description: 'Lær mer om Kryptohjelpen - din norske guide til krypto, Web3 og blokkjedeteknologi. Vi tilbyr teknisk veiledning, ikke investeringsråd.',
};

// SVG Icons
const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const ChatIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const PhoneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const GradCapIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default function OmOss() {
  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <h1>Om Kryptohjelpen</h1>
        <p>Din norske guide til krypto, Web3 og blokkjedeteknologi</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TargetIcon /> Vår misjon
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Kryptohjelpen ble startet med én klar visjon: å gjøre krypto og blokkjedeteknologi 
            tilgjengelig for alle nordmenn. Vi tilbyr <strong>teknisk veiledning</strong> – ikke 
            investeringsråd. Vår rolle er å hjelpe deg forstå teknologien, ikke å anbefale hva 
            du skal investere i.
          </p>
        </section>

        {/* What we do */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BriefcaseIcon /> Hva vi tilbyr
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="block mb-4"><ChatIcon /></span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI Chatbot</h3>
              <p className="text-gray-600">
                Vår intelligente chatbot er tilgjengelig 24/7 for å svare på spørsmål om krypto, 
                wallets, og blokkjedeteknologi.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="block mb-4"><PhoneIcon /></span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">1-til-1 Konsultasjon</h3>
              <p className="text-gray-600">
                Book en personlig samtale med en av våre eksperter for dypere veiledning 
                tilpasset dine behov.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="block mb-4"><GradCapIcon /></span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bedriftskurs</h3>
              <p className="text-gray-600">
                Skreddersydde kurs for bedrifter som ønsker å forstå Web3, krypto og 
                blokkjedeteknologi.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="block mb-4"><LockIcon /></span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sikkerhetsveiledning</h3>
              <p className="text-gray-600">
                Lær hvordan du sikrer dine digitale eiendeler med hardware wallets og 
                beste praksis.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <StarIcon /> Våre verdier
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="text-[var(--primary)]"><ShieldIcon /></span>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Sikkerhet først</h3>
                <p className="text-gray-600">
                  Vi setter alltid sikkerhet i fokus. Dine eiendeler og personvern er vår 
                  høyeste prioritet.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-[var(--primary)]"><BookIcon /></span>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Uavhengig rådgivning</h3>
                <p className="text-gray-600">
                  Vi gir deg objektiv veiledning uten skjulte agendaer. Vi tjener ikke på 
                  dine investeringsbeslutninger.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-[var(--primary)]"><GlobeIcon /></span>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Norsk støtte</h3>
                <p className="text-gray-600">
                  All veiledning på norsk, tilpasset norske lover og reguleringer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-amber-800 mb-2 flex items-center gap-2">
            <span className="text-amber-600"><AlertIcon /></span> Viktig informasjon
          </h2>
          <p className="text-amber-700">
            Kryptohjelpen tilbyr kun <strong>teknisk veiledning</strong>. Vi gir ikke 
            investeringsråd, og er ikke ansvarlige for eventuelle tap som følge av 
            investeringer i kryptovaluta. All handel med krypto innebærer risiko.
          </p>
        </section>
      </div>
    </>
  );
}
