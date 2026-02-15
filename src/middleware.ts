import { NextRequest, NextResponse } from 'next/server';

// Static page content
const PAGES: Record<string, string> = {
  '/': `---
title: Kryptohjelpen - Din tryggeste vei inn i krypto
description: Norges mest brukervennlige kryptovaluta-butikk. Kjøp hardware wallets, cold storage og krypto-tilbehør med VIPS og Ethereum.
---

# Kryptohjelpen

## Din tryggeste vei inn i krypto

Kryptohjelpen er Norges mest brukervennlige kryptovaluta-butikk. Vi tilbyr hardware wallets, cold storage-løsninger og tilbehør for sikker oppbevaring av kryptovaluta.

### Hvorfor velge oss?

- **Norsk butikk** med lokal support
- **Sikker betaling** med VIPS og Ethereum
- **Rask levering** til hele Norge
- **Ekspertise** - vi bruker produktene selv

### Produktkategorier

- Hardware Wallets (Ledger, Trezor, etc.)
- Cold Storage løsninger
- Backup-løsninger (stålplater, seed phrase oppbevaring)
- Krypto-tilbehør

### Betaling

Vi aksepterer:
- VIPS (Norges betalingsapp)
- Ethereum (ETH)
- Bankoverføring

### Kontakt

E-post: kontakt@kryptohjelpen.no
Web: https://kryptohjelpen.no
`,

  '/om-oss': `---
title: Om Kryptohjelpen
description: Lær mer om teamet bak Kryptohjelpen og vår visjon for sikker krypto i Norge.
---

# Om Kryptohjelpen

Kryptohjelpen ble startet for å gjøre det enklere og tryggere for nordmenn å komme inn i kryptovaluta-verdenen.

## Vår visjon

Vi tror at alle bør ha tilgang til sikre løsninger for oppbevaring av kryptovaluta. Vårt mål er å være den mest pålitelige ressursen for krypto-sikkerhet i Norge.

## Hva vi tilbyr

- Kuratert utvalg av kvalitetsprodukter
- Norsk kundeservice
- Veiledning og support
- Artikler og guider

## Kontakt

E-post: kontakt@kryptohjelpen.no
`,

  '/konsultasjon': `---
title: Krypto-konsultasjon - Kryptohjelpen
description: Book en personlig konsultasjon med våre krypto-eksperter. Få hjelp med wallet-oppsett, sikkerhet og strategi.
---

# Krypto-konsultasjon

## Personlig veiledning fra eksperter

Trenger du hjelp med å komme i gang med krypto? Våre eksperter kan hjelpe deg med:

- Oppsett av hardware wallet
- Sikker oppbevaring av seed phrase
- Valg av riktig løsning for dine behov
- Generell krypto-strategi

## Hvordan det fungerer

1. Book en tid som passer deg
2. Vi tar kontakt for en innledende prat
3. Gjennomfører konsultasjonen (video eller telefon)
4. Oppfølging og support etterpå

## Pris

Ta kontakt for priser og tilgjengelighet.

E-post: kontakt@kryptohjelpen.no
`
};

export async function middleware(request: NextRequest) {
  const acceptHeader = request.headers.get('accept') || '';
  const path = request.nextUrl.pathname;

  // Only intercept if client accepts markdown
  if (!acceptHeader.includes('text/markdown')) {
    return NextResponse.next();
  }

  // Skip API routes and static files
  if (path.startsWith('/api/') || path.startsWith('/_next/') || path.includes('.')) {
    return NextResponse.next();
  }

  // Check for product pages
  if (path.startsWith('/produkt/')) {
    // For individual products, we could fetch from API and convert
    // For now, redirect to products API
    return NextResponse.next();
  }

  // Check for static pages
  const normalizedPath = path.endsWith('/') && path !== '/' 
    ? path.slice(0, -1) 
    : path;

  if (PAGES[normalizedPath]) {
    const markdown = PAGES[normalizedPath];
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
        'x-markdown-tokens': String(Math.ceil(markdown.length / 4)),
        'Vary': 'Accept'
      }
    });
  }

  // For products listing page
  if (path === '/produkter' || path === '/products') {
    try {
      const baseUrl = request.nextUrl.origin;
      const productsRes = await fetch(`${baseUrl}/api/products?limit=100`);
      
      if (productsRes.ok) {
        const products = await productsRes.json();
        
        let markdown = `---
title: Produkter - Kryptohjelpen
description: Se vårt utvalg av hardware wallets, cold storage og krypto-tilbehør.
---

# Produkter

`;
        for (const product of products) {
          markdown += `## ${product.name}

${product.description}

- **Pris:** ${product.price_nok} NOK
- **Kategori:** ${product.category}
${product.stock > 0 ? '- **Status:** På lager' : '- **Status:** Utsolgt'}

---

`;
        }

        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Signal': 'ai-train=yes, search=yes, ai-input=yes',
            'x-markdown-tokens': String(Math.ceil(markdown.length / 4)),
            'Vary': 'Accept'
          }
        });
      }
    } catch (e) {
      console.error('Failed to fetch products for markdown:', e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
