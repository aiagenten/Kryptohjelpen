# Kryptohjelpen.no - Next.js

Migrert fra Express + statisk HTML til Next.js 16 med App Router.

## Installering

```bash
npm install
```

## Utvikling

```bash
npm run dev
```

Serveren starter på http://localhost:3000 (eller PORT fra .env.local)

## Produksjon

```bash
npm run build
npm start
```

## Struktur

```
src/
├── app/                     # App Router sider og API-routes
│   ├── api/                 # API-endepunkter
│   │   ├── products/        # Produkter
│   │   ├── cart/            # Handlekurv
│   │   ├── auth/            # Autentisering
│   │   ├── articles/        # Artikler
│   │   ├── bookings/        # Konsultasjoner
│   │   ├── contact/         # Kontaktskjema
│   │   └── customer/        # Kundeinfo
│   ├── artikler/            # Artikler-sider
│   ├── cart/                # Handlekurv
│   ├── checkout/            # Betaling
│   ├── konsultasjon/        # Book konsultasjon
│   ├── kontakt/             # Kontakt oss
│   ├── logg-inn/            # Innlogging
│   ├── registrer/           # Registrering
│   ├── min-side/            # Kundekonto
│   ├── om-oss/              # Om oss
│   ├── order-confirmation/  # Ordrebekreftelse
│   ├── layout.tsx           # Root layout med Nav og Footer
│   ├── page.tsx             # Forside med produkter
│   └── globals.css          # Global styling
├── components/              # Delte komponenter
│   ├── Nav.tsx              # Navigasjon
│   └── Footer.tsx           # Footer
└── lib/                     # Hjelpefunksjoner
    └── db.ts                # Database-tilkobling

database/                    # SQLite database
lib/                         # Betalings- og email-tjenester (fra original)
public/
├── admin/                   # Admin-panel (uendret)
├── images/                  # Bilder
└── js/                      # Chatbot etc.
```

## Migrering

Følgende er migrert fra Express:
- ✅ Alle HTML-sider → Next.js App Router
- ✅ Express API-routes → Next.js API routes
- ✅ Session-basert cart → Cookie-basert cart
- ✅ Kundeautentisering → Cookie-sessions
- ✅ SQLite database (better-sqlite3)
- ✅ Styling → Tailwind CSS
- ✅ Admin-panel → Statisk i /public/admin

## Footer

© 2026 Kryptohjelpen.no

## Identisk meny

Nav-komponenten er identisk på alle sider med:
- Produkter
- Artikler
- Om oss
- Kontakt
- Handlekurv (med badge)
- Logg inn / Bruker-avatar
