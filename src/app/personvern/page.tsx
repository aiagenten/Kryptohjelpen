import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Personvernerklæring | Kryptohjelpen.no',
  description: 'Vår personvernerklæring beskriver hvordan vi samler inn, bruker og beskytter dine personopplysninger.',
};

export default function PersonvernPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50">
        <div className="page-hero">
          <h1>Personvernerklæring</h1>
          <p>Sist oppdatert: 31. januar 2026</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Innledning</h2>
              <p className="text-gray-700 leading-relaxed">
                Kryptohjelpen.no ("vi", "oss", "vår") er opptatt av å beskytte ditt personvern. 
                Denne personvernerklæringen forklarer hvordan vi samler inn, bruker, deler og 
                beskytter informasjon om deg når du bruker våre tjenester.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Behandlingsansvarlig</h2>
              <p className="text-gray-700 leading-relaxed">
                AI AGENTEN AS er behandlingsansvarlig for behandling av personopplysninger som 
                beskrevet i denne personvernerklæringen.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Kontakt:</strong><br />
                  E-post: personvern@kryptohjelpen.no<br />
                  Adresse: Norge
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Hvilke opplysninger vi samler inn</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Vi samler inn følgende kategorier av personopplysninger:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Kontaktinformasjon:</strong> Navn, e-postadresse, telefonnummer</li>
                <li><strong>Kontoinformasjon:</strong> Brukernavn, passord (kryptert)</li>
                <li><strong>Betalingsinformasjon:</strong> Transaksjonshistorikk (vi lagrer ikke kortdetaljer)</li>
                <li><strong>Bruksdata:</strong> IP-adresse, nettlesertype, besøkte sider</li>
                <li><strong>Kommunikasjon:</strong> Meldinger sendt til vår kundeservice eller chatbot</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Hvordan vi bruker opplysningene</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Vi bruker dine personopplysninger til å:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Levere og forbedre våre tjenester</li>
                <li>Behandle bestillinger og betalinger</li>
                <li>Kommunisere med deg om tjenester, support og oppdateringer</li>
                <li>Tilpasse din brukeropplevelse</li>
                <li>Overholde juridiske forpliktelser</li>
                <li>Forhindre svindel og misbruk</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Rettslig grunnlag</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Vi behandler personopplysninger basert på følgende rettslige grunnlag:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Avtale:</strong> For å oppfylle avtalen om levering av tjenester</li>
                <li><strong>Samtykke:</strong> For markedsføring og nyhetsbrev</li>
                <li><strong>Berettiget interesse:</strong> For å forbedre våre tjenester og forhindre svindel</li>
                <li><strong>Juridisk forpliktelse:</strong> For å overholde regnskapsloven og andre lover</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Deling av opplysninger</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vi deler kun personopplysninger med tredjeparter når det er nødvendig:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Betalingsleverandører:</strong> Vipps, kryptovaluta-nettverk</li>
                <li><strong>Tekniske tjenester:</strong> Hosting, e-posttjenester</li>
                <li><strong>Myndigheter:</strong> Når loven krever det</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Vi selger aldri dine personopplysninger til tredjeparter.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Lagring og sikkerhet</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi lagrer personopplysninger så lenge det er nødvendig for formålene beskrevet i 
                denne erklæringen, eller så lenge loven krever. Vi bruker tekniske og organisatoriske 
                sikkerhetstiltak for å beskytte dine opplysninger, inkludert kryptering, 
                tilgangskontroll og regelmessige sikkerhetsgjennomganger.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Dine rettigheter</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Du har følgende rettigheter:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Innsyn:</strong> Be om kopi av opplysninger vi har om deg</li>
                <li><strong>Retting:</strong> Be om at feil opplysninger korrigeres</li>
                <li><strong>Sletting:</strong> Be om at opplysninger slettes ("retten til å bli glemt")</li>
                <li><strong>Begrensning:</strong> Be om begrenset behandling</li>
                <li><strong>Dataportabilitet:</strong> Motta dine data i et strukturert format</li>
                <li><strong>Innsigelse:</strong> Protestere mot behandling basert på berettiget interesse</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                For å utøve dine rettigheter, kontakt oss på personvern@kryptohjelpen.no
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Informasjonskapsler (cookies)</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi bruker informasjonskapsler for å forbedre brukeropplevelsen og analysere 
                nettstedstrafikk. Du kan administrere dine cookie-preferanser i nettleserinnstillingene. 
                Nødvendige cookies for funksjonalitet (som handlekurv) kreves for at tjenesten skal fungere.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Endringer</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi kan oppdatere denne personvernerklæringen fra tid til annen. Ved vesentlige 
                endringer vil vi varsle deg via e-post eller på nettsiden. Fortsatt bruk av 
                tjenesten etter endringer betyr at du aksepterer den oppdaterte erklæringen.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Klage</h2>
              <p className="text-gray-700 leading-relaxed">
                Hvis du mener at vår behandling av personopplysninger ikke er i samsvar med 
                personvernregelverket, har du rett til å klage til Datatilsynet (datatilsynet.no).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Kontakt oss</h2>
              <p className="text-gray-700 leading-relaxed">
                Har du spørsmål om personvern? Kontakt oss:
              </p>
              <div className="mt-4 p-4 bg-[#8DC99C]/10 rounded-lg">
                <p className="text-gray-700">
                  E-post: personvern@kryptohjelpen.no<br />
                  🌐 kryptohjelpen.no/kontakt
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
