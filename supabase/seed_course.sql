-- Seed course chapters for Kryptokurs
-- Run after course_tables.sql migration

INSERT INTO course_chapters (slug, title, description, content, chapter_number, is_free) VALUES

-- Kapittel 1: Hva er kryptovaluta? (GRATIS)
(
  'hva-er-kryptovaluta',
  'Hva er kryptovaluta?',
  'Lær det grunnleggende om kryptovaluta, blockchain-teknologi, Bitcoin og hvorfor desentralisering er viktig.',
  '## Velkommen til kryptoverdenen!

Kryptovaluta har gått fra å være et nisjeprosjekt blant teknologientusiaster til å bli en global finansiell revolusjon. Men hva er egentlig kryptovaluta, og hvorfor bør du bry deg?

### Hva er penger – egentlig?

For å forstå kryptovaluta må vi først tenke over hva penger er. Den norske kronen har verdi fordi vi stoler på at Norges Bank og den norske staten står bak den. Det er en avtale mellom oss alle: vi er enige om at en hundrelapp er verdt noe.

Kryptovaluta fungerer på samme måte – men i stedet for å stole på en bank eller stat, stoler vi på **matematikk og teknologi**. Verdien sikres av et nettverk av datamaskiner som alle er enige om hvem som eier hva.

### Bitcoin – den første kryptovalutaen

I 2009 lanserte en anonym person (eller gruppe) under pseudonymet **Satoshi Nakamoto** den første kryptovalutaen: Bitcoin. Ideen var enkel men revolusjonerende:

- **Ingen mellomledd:** Du kan sende penger direkte til en annen person, uten bank
- **Begrenset mengde:** Det vil aldri eksistere mer enn 21 millioner Bitcoin
- **Åpent og transparent:** Alle transaksjoner er synlige på blokkjeden
- **Globalt:** Fungerer på tvers av landegrenser, 24/7

Tenk på det som digitalt gull – en verdibeholder som ikke kan inflateres bort av sentralbanker.

### Hva er blockchain?

Bak kryptovaluta ligger teknologien **blockchain** (blokkjede). Forestill deg en regnskapsbok som:

1. **Kopieres til tusenvis av datamaskiner** over hele verden
2. **Oppdateres samtidig** på alle kopiene
3. **Ikke kan endres i ettertid** uten at alle merker det
4. **Er åpen for alle** å lese

Hver «blokk» inneholder en samling transaksjoner, og blokker lenkes sammen i en kjede. Derav navnet «blokkjede».

### Desentralisering – hvorfor det er viktig

Det mest revolusjonerende med kryptovaluta er **desentralisering**. I det tradisjonelle finanssystemet:

- Banken din kan fryse kontoen din
- Myndighetene kan beslaglegge midlene dine
- Betalingssystemer kan nekte deg tilgang
- En enkelt feil i bankens systemer kan lamme alt

Med kryptovaluta er du din egen bank. Du – og kun du – kontrollerer dine digitale verdier. Det finnes ingen sentral myndighet som kan stenge systemet.

### Mer enn bare Bitcoin

Selv om Bitcoin var først, finnes det i dag tusenvis av forskjellige kryptovalutaer. De viktigste kategoriene er:

- **Bitcoin (BTC):** Digital verdibeholder, «digitalt gull»
- **Ethereum (ETH):** Plattform for smarte kontrakter og desentraliserte apper
- **Stablecoins (USDT, USDC):** Kryptovalutaer knyttet til dollarkursen
- **Altcoins:** Alle andre kryptovalutaer med ulike formål

### Kryptovaluta i Norge

Norge har et aktivt kryptomiljø med norske børser som **Firi** og **NBX** (Norwegian Block Exchange). Du kan kjøpe Bitcoin og andre kryptovalutaer med norske kroner, og fra 2023 må du rapportere kryptogevinster i skattemeldingen.

### Oppsummering

Kryptovaluta er digitale penger som drives av blokkjedeteknologi. De er desentraliserte, transparente og gir deg full kontroll over dine verdier. Bitcoin startet det hele i 2009, og siden har tusenvis av nye kryptovalutaer blitt skapt med ulike formål.

> **Tips:** Ikke invester mer enn du har råd til å tape. Kryptomarkedet er volatilt, og priser kan svinge kraftig. Start smått og lær underveis!

I neste kapittel dykker vi dypere inn i hvordan blokkjedeteknologien faktisk fungerer.',
  1,
  false
),

-- Kapittel 2: Hvordan fungerer blockchain? (GRATIS)
(
  'hvordan-fungerer-blockchain',
  'Hvordan fungerer blockchain?',
  'Forstå teknologien bak krypto: blokker, mining, konsensusmekanismer og noder.',
  '## Blokkjedens indre liv

I forrige kapittel lærte du at blockchain er en distribuert regnskapsbok. Nå skal vi se nærmere på hvordan den faktisk fungerer under panseret.

### Blokker og kjeder

En blockchain består av **blokker** som er lenket sammen. Hver blokk inneholder:

1. **Transaksjonsdata:** En liste over transaksjoner (f.eks. «Ola sendte 0.5 BTC til Kari»)
2. **Tidsstempel:** Når blokken ble opprettet
3. **Hash:** En unik digital «fingeravtrykk» av blokken
4. **Forrige blokks hash:** Lenken til blokken før

Det er hashen som gjør blockchain så sikker. Hvis noen prøver å endre en gammel transaksjon, endres hashen til den blokken – og dermed brytes lenken til neste blokk. Hele kjeden etter endringen blir ugyldig.

### Hva er en hash?

En hash er resultatet av en matematisk funksjon som tar inn data av vilkårlig størrelse og gir ut en tekststreng med fast lengde. For eksempel:

- Input: «Hei Norge» → Hash: `a3f2b8c9d1...`
- Input: «Hei Norge!» → Hash: `7e4d1a2f9b...`

Selv den minste endring gir et helt annet resultat. Det er praktisk umulig å gjette inputen fra hashen.

### Mining – å sikre nettverket

Du har kanskje hørt om **mining** (utvinning). Men hva gjør egentlig minere?

Minere konkurrerer om å løse et matematisk puslespill. Den første som finner løsningen får lov til å legge til neste blokk i kjeden – og mottar en belønning i form av nye Bitcoin. Denne prosessen kalles **Proof of Work** (bevis på arbeid).

Slik fungerer det steg for steg:

1. Transaksjoner samles i en «ventekø» (mempool)
2. Minere velger transaksjoner og pakker dem i en blokk
3. De prøver milliarder av tall for å finne en hash som oppfyller kravene
4. Første miner som finner løsningen kringkaster blokken
5. Andre noder verifiserer at blokken er gyldig
6. Blokken legges til kjeden, og mineren får belønning

### Proof of Work vs. Proof of Stake

Det finnes to hovedtyper konsensusmekanismer:

**Proof of Work (PoW)** – brukt av Bitcoin:
- Krever enorme mengder strøm og datakraft
- Svært sikkert fordi det er dyrt å angripe
- Kritiseres for høyt energiforbruk

**Proof of Stake (PoS)** – brukt av Ethereum (siden 2022):
- Validatorer «låser inn» (staker) krypto som sikkerhet
- Tilfeldig utvalgte validatorer bekrefter transaksjoner
- Bruker 99,95 % mindre energi enn PoW
- Svindlere mister sine innlåste midler (slashing)

### Noder – nettverkets ryggrad

En **node** er en datamaskin som kjører blokkjedens programvare. Det finnes ulike typer:

- **Full node:** Lagrer hele blokkjeden og verifiserer alle transaksjoner
- **Light node:** Lagrer kun blokkhodene, bruker mindre plass
- **Mining/validator node:** Deltar aktivt i å skape nye blokker

Hvem som helst kan kjøre en node. Det er dette som gjør blockchain desentralisert – det finnes ingen sentral server som kan slås av.

### Transaksjoner i praksis

Når du sender Bitcoin til noen, skjer dette:

1. Du signerer transaksjonen med din **private nøkkel** (som et digitalt passord)
2. Transaksjonen kringkastes til nettverket
3. Noder verifiserer at du har nok midler og at signaturen er gyldig
4. Transaksjonen legges i ventekøen
5. En miner inkluderer den i neste blokk
6. Etter 1-6 bekreftelser (nye blokker oppå) regnes den som endelig

For Bitcoin tar dette vanligvis 10-60 minutter. For nyere blokkjeder som Solana kan det skje på sekunder.

### Hvorfor er blockchain revolusjonerende?

Blockchain løser et gammelt problem i informatikken: **Byzantine Generals'' Problem** – hvordan kan parter som ikke stoler på hverandre bli enige uten en mellommann?

Svaret er: ved å gjøre det matematisk umulig (eller ekstremt dyrt) å jukse, og ved å belønne ærlig oppførsel.

### Smart kontrakter – en bonus

Ethereum introduserte **smarte kontrakter** – små programmer som kjører automatisk på blokkjeden. De kan for eksempel:

- Automatisk utbetale forsikring ved forsinkede fly
- Drifte desentraliserte børser uten mellomledd
- Skape digitale eiendeler (NFT-er) med bevisbar eierskap

Vi kommer tilbake til dette i kapittel 5!

### Oppsummering

Blockchain er en kjede av datablokker sikret med kryptografi. Mining og konsensusmekanismer sørger for at alle er enige om tilstanden, uten en sentral myndighet. Noder over hele verden holder nettverket i live og verifiserer transaksjoner.

> **Visste du?** Bitcoins blokkjede har aldri blitt hacket siden starten i 2009. All «krypto-hacking» du hører om handler om at børser eller lommebøker blir kompromittert – ikke selve blokkjeden.

Neste kapittel handler om krypto-lommebøker – hvordan du faktisk oppbevarer og sikrer dine kryptovalutaer.',
  2,
  false
),

-- Kapittel 3: Krypto-lommebøker (KREVER LOGIN)
(
  'krypto-lommeboker',
  'Krypto-lommebøker',
  'Alt om hot wallets, cold wallets, seed phrases og hvordan du sikrer kryptovalutaene dine.',
  '## Din digitale bankboks

Hvis kryptovaluta er digitale penger, trenger du en digital lommebok for å oppbevare dem. Men en krypto-lommebok fungerer litt annerledes enn du kanskje tror.

### Hva er en krypto-lommebok?

En krypto-lommebok lagrer egentlig ikke kryptovalutaen din. Den lagrer dine **private nøkler** – de digitale kodene som gir deg tilgang til dine midler på blokkjeden. Tenk på det slik:

- **Offentlig nøkkel (adresse):** Som et kontonummer – del denne med andre for å motta krypto
- **Privat nøkkel:** Som PIN-koden din – del ALDRI denne med noen

Kryptovalutaen «bor» alltid på blokkjeden. Lommeboken gir deg bare tilgang.

### Hot wallets – alltid tilkoblet

En **hot wallet** er koblet til internett. Fordelen er at den er rask og enkel å bruke. Ulempen er at den er mer sårbar for hacking.

**Typer hot wallets:**

- **Mobilapper:** Trust Wallet, MetaMask (mobil), Coinbase Wallet
- **Desktop-programmer:** Exodus, Electrum
- **Nettleser-utvidelser:** MetaMask, Phantom
- **Børs-lommebøker:** Firi, NBX, Coinbase (børsen holder nøklene for deg)

**Når bruke hot wallet?**
- For daglig bruk og små beløp
- For handel og trading
- For interaksjon med DeFi-apper

### Cold wallets – offline sikkerhet

En **cold wallet** er ikke koblet til internett, noe som gjør den mye sikrere mot hacking.

**Typer cold wallets:**

- **Hardware wallets:** Ledger Nano, Trezor – fysiske enheter som ligner USB-pinner
- **Paper wallets:** Private nøkler skrevet ned på papir (utdatert metode)
- **Steel wallets:** Seed phrase preget inn i stålplater (brann- og vannsikkert)

**Når bruke cold wallet?**
- For langsiktig oppbevaring av større beløp
- For verdier du ikke trenger daglig tilgang til
- Som din primære «sparekonto» for krypto

### Seed phrase – din viktigste backup

Når du oppretter en ny lommebok, får du en **seed phrase** (gjenopprettingsfrase) – vanligvis 12 eller 24 engelske ord i en bestemt rekkefølge. For eksempel:

*apple garden mountain river sunset piano...*

Denne frasen er **alt du trenger for å gjenopprette tilgang** til alle dine kryptovalutaer, selv om telefonen eller hardware-walleten går i stykker.

### Seed phrase – sikkerhetstips

Din seed phrase er det viktigste du eier i kryptoverdenen. Her er reglene:

1. **Skriv den ned på papir** – aldri lagre den digitalt (ikke i Notes, ikke i Google Drive, ikke som screenshot)
2. **Lag minst to kopier** og oppbevar dem på forskjellige steder
3. **Del ALDRI seed phrase med noen** – ingen legitim tjeneste vil noensinne be om den
4. **Vurder stålbackup** – papir kan brenne eller bli vannskadet
5. **Oppbevar trygt** – tenk brannskap, bankboks, eller godt gjemt hjemme

> **Viktig:** Hvis noen får tak i din seed phrase, har de full tilgang til alle dine kryptovalutaer. Det finnes ingen «glemt passord»-funksjon i krypto.

### Sikkerhet i praksis

Her er en god sikkerhetsstrategi for nybegynnere i Norge:

**Nivå 1 – Starter (under 5 000 kr):**
- Bruk børsens lommebok (Firi eller NBX)
- Aktiver 2-faktor autentisering (2FA)
- Bruk et sterkt, unikt passord

**Nivå 2 – Middels (5 000 – 50 000 kr):**
- Flytt til en egen hot wallet (MetaMask, Trust Wallet)
- Sikre seed phrase på papir, oppbevar trygt
- Aldri bruk offentlig WiFi for kryptotransaksjoner

**Nivå 3 – Seriøs (over 50 000 kr):**
- Kjøp en hardware wallet (Ledger eller Trezor)
- Seed phrase på stålplate, oppbevart i brannskap
- Vurder multi-sig oppsett for ekstra sikkerhet

### Vanlige feil å unngå

- **Lagre seed phrase digitalt** – screenshots og notater i skyen er sårbare
- **Bruke samme passord overalt** – hvis én tjeneste lekker, mister du alt
- **Sende til feil adresse** – trippelsjekk alltid adressen, kryptotransaksjoner kan ikke reverseres
- **Falle for svindel** – «Send 1 BTC, få 2 tilbake» er ALLTID svindel

### Oppsummering

Krypto-lommebøker gir deg tilgang til dine midler på blokkjeden. Hot wallets er praktiske for daglig bruk, cold wallets er tryggest for langsiktig oppbevaring. Din seed phrase er din ultimate backup – beskytt den som om det var kontanter.

> **Tommelfingerregel:** Behandle krypto som kontanter. Det du mister er borte for godt. Vær like forsiktig med din seed phrase som du ville vært med en bunke tusenlapper.

Neste kapittel: Hvordan du faktisk kjøper og selger kryptovaluta i Norge!',
  3,
  false
),

-- Kapittel 4: Kjøpe og selge krypto (KREVER LOGIN)
(
  'kjope-og-selge-krypto',
  'Kjøpe og selge krypto',
  'Praktisk guide til å kjøpe krypto i Norge: børser, Vipps-kjøp, NOK til krypto, og gebyrer.',
  '## Fra norske kroner til krypto

Nå som du forstår hva kryptovaluta er og hvordan du oppbevarer det, er det på tide å lære hvordan du faktisk kjøper og selger. I Norge har vi heldigvis flere gode alternativer.

### Norske kryptobørser

Som nordmann har du to hovedalternativer for regulerte norske børser:

**Firi (tidligere MiraiEx)**
- Norsk selskap basert i Trondheim
- Registrert hos Finanstilsynet
- Støtter Vipps og norsk bankkonto
- Brukervennlig app perfekt for nybegynnere
- Støtter Bitcoin, Ethereum og flere populære kryptovalutaer
- Gebyr: ca. 0,7 % per handel

**NBX (Norwegian Block Exchange)**
- Grunnlagt av Bjørn Kjos (Norwegian-gründeren)
- Regulert i Norge
- Bankoverføring og kortbetaling
- Litt mer avansert grensesnitt
- Støtter et bredere utvalg av kryptovalutaer
- Gebyr: varierer, sjekk nbx.com

### Internasjonale alternativer

Du kan også bruke internasjonale børser, men vær klar over at du fortsatt må rapportere til norsk skattemyndighet:

- **Coinbase:** Verdens mest kjente børs, enkel å bruke
- **Kraken:** Populær i Europa, godt utvalg
- **Binance:** Størst i verden, men mer kompleks

### Steg-for-steg: Kjøp din første Bitcoin

La oss bruke Firi som eksempel:

**1. Opprett konto**
- Last ned Firi-appen eller gå til firi.com
- Registrer deg med BankID (norsk identifisering)
- KYC-verifisering fullføres automatisk via BankID

**2. Sett inn penger**
- Overfør norske kroner fra bankkontoen din
- Alternativt: betal direkte med Vipps for raskere kjøp
- Beløpet er vanligvis tilgjengelig innen minutter

**3. Kjøp kryptovaluta**
- Velg hvilken kryptovaluta du vil kjøpe (f.eks. Bitcoin)
- Skriv inn beløpet i NOK (f.eks. 500 kr)
- Se over ordredetaljer og gebyrer
- Bekreft kjøpet

**4. Ferdig!**
- Kryptovalutaen ligger nå i din Firi-lommebok
- Du kan la den stå der, eller overføre til en egen lommebok

### Kjøpe med Vipps

Flere norske tjenester lar deg kjøpe krypto med Vipps – noe som gjør prosessen ekstra enkel:

1. Velg «Kjøp med Vipps» på børsen
2. Du sendes til Vipps-appen
3. Bekreft betalingen med fingeravtrykk eller PIN
4. Kryptoen er din innen sekunder

Det er nesten like enkelt som å Vippse en kompis!

### Forstå gebyrer

Gebyrer er viktig å forstå, spesielt for mindre kjøp:

| Type | Beskrivelse | Typisk |
|------|-------------|--------|
| **Handelsgebyr** | Børsens gebyr per kjøp/salg | 0,5–1,5 % |
| **Spread** | Forskjell mellom kjøps- og salgspris | 0,5–2 % |
| **Uttaksgebyr** | For å sende krypto til egen lommebok | Varierer |
| **Nettverksgebyr** | Blokkjedens egen transaksjonskostnad | Varierer |

**Tips:** For små beløp (under 1 000 kr) kan gebyrene spise en betydelig del av investeringen. Vurder å kjøpe sjeldnere men for større beløp.

### DCA – Dollar Cost Averaging

En populær strategi er **DCA (Dollar Cost Averaging)** – å kjøpe for et fast beløp med jevne mellomrom, uansett pris:

- Eksempel: Kjøp Bitcoin for 500 kr hver måned
- Du unngår å «time» markedet (noe selv eksperter sliter med)
- Over tid jevner du ut prissvingningene
- Firi tilbyr automatisk spareavtale for dette

### Selge kryptovaluta

Å selge er like enkelt som å kjøpe:

1. Gå til børsen (f.eks. Firi)
2. Velg «Selg» for kryptovalutaen du vil selge
3. Velg beløp (hele beholdningen eller deler)
4. NOK overføres til din konto

**Viktig:** Husk at salg kan utløse skatteplikt! Mer om dette i kapittel 6.

### Sikkerhetstips for kjøp og salg

- **Start smått:** Gjør ditt første kjøp for 100-500 kr for å bli kjent med prosessen
- **Bruk kun regulerte børser:** Firi og NBX er registrert hos Finanstilsynet
- **Aldri kjøp på grunn av FOMO:** Ikke la frykt for å gå glipp av noe drive investeringene dine
- **Sett et budsjett:** Bestem på forhånd hvor mye du vil investere per måned
- **Ikke invester lånte penger:** Bruk kun penger du har råd til å tape

### Oppsummering

Å kjøpe krypto i Norge er enkelt og trygt gjennom regulerte børser som Firi og NBX. Med Vipps er prosessen nesten like enkel som netthandel. Start smått, bruk DCA-strategien, og husk at gebyrer teller – spesielt for mindre beløp.

> **Pro-tips:** Sett opp en fast spareavtale på Firi for f.eks. 500 kr i måneden i Bitcoin. Det er den enkleste måten å bygge opp en kryptoportefølje over tid, uten stress og uten å prøve å «time» markedet.

Neste kapittel tar deg inn i DeFi og Web3 – den spennende verdenen av desentralisert finans!',
  4,
  false
),

-- Kapittel 5: DeFi og Web3 (KREVER LOGIN)
(
  'defi-og-web3',
  'DeFi og Web3',
  'Introduksjon til smarte kontrakter, desentraliserte børser, staking, og NFT.',
  '## Den desentraliserte fremtiden

Du har nå lært om kryptovaluta, blockchain, lommebøker og kjøp. Nå er det på tide å utforske det virkelig spennende: **DeFi** (Decentralized Finance) og **Web3** – teknologiene som kan revolusjonere hele finanssystemet.

### Hva er DeFi?

DeFi står for **Decentralized Finance** – desentralisert finans. Det er finansielle tjenester som kjører på blokkjeden, uten banker eller mellomledd:

- **Lån og utlån** uten bank
- **Handel** uten megler
- **Sparing** med høyere rente enn banken
- **Forsikring** uten forsikringsselskap

Alt styres av **smarte kontrakter** – automatiske programmer som kjører på blokkjeden.

### Smarte kontrakter forklart

En smart kontrakt er et program som automatisk utfører avtaler når vilkårene er oppfylt. Tenk på det som en salgsautomat:

1. Du putter inn penger (sender krypto)
2. Automaten sjekker at beløpet stemmer (kontrakten verifiserer)
3. Du får varen (kontrakten utfører handlingen)

Ingen trenger å stole på noen – koden gjør jobben. Smarte kontrakter kjører på Ethereum og lignende blokkjeder, og koden er åpen for alle å lese og verifisere.

### DEX – Desentraliserte børser

En **DEX** (Decentralized Exchange) lar deg bytte kryptovalutaer direkte, uten en sentral aktør:

**Populære DEX-er:**
- **Uniswap:** Størst på Ethereum
- **PancakeSwap:** Populær på BNB Chain
- **Jupiter:** Ledende på Solana

**Hvordan fungerer en DEX?**
1. Du kobler til lommeboken din (f.eks. MetaMask)
2. Velger hvilke tokens du vil bytte
3. DEX-en finner best pris automatisk via «liquidity pools»
4. Du godkjenner transaksjonen i lommeboken
5. Byttet skjer direkte, uten mellomledd

**Fordeler med DEX:**
- Ingen KYC-registrering nødvendig
- Du beholder kontrollen over dine nøkler
- Tilgjengelig 24/7, ingen nedetid
- Ingen kan fryse eller begrense kontoen din

**Ulemper:**
- Kan være teknisk komplisert for nybegynnere
- Høyere risiko (ingen kundeservice ved feil)
- Nettverksgebyrer (gas fees) kan være høye på Ethereum

### Staking – tjen passiv inntekt

**Staking** er å låse inn kryptovaluta for å hjelpe med å sikre nettverket – og du får belønning for det:

- Ethereum: ca. 3-5 % årlig avkastning
- Mange andre tokens tilbyr staking-belønninger
- Du kan stake direkte eller gjennom en tjeneste

**Typer staking:**
- **Direkte staking:** Du kjører en validator-node (krever 32 ETH for Ethereum)
- **Delegert staking:** Du delegerer til en validator (enklere)
- **Liquid staking:** Du staker og får et token tilbake som du kan bruke videre (f.eks. Lido)

Firi tilbyr staking av Ethereum direkte i appen – en enkel måte å komme i gang.

### Yield farming og likviditetsgruver

**Yield farming** er å tilby likviditet til DeFi-protokoller i bytte mot avkastning:

1. Du setter inn to tokens i en «liquidity pool» (f.eks. ETH + USDC)
2. Andre brukere bruker denne likviditeten til å handle
3. Du får en andel av handelsgebyrene

**Viktig advarsel:** Yield farming har høyere risiko:
- **Impermanent loss:** Du kan tape verdi selv om prisen går opp
- **Smart contract risk:** Bugs i koden kan føre til tap
- **Rug pulls:** Svindelprosjekter som stjeler innskudd

### NFT – Digitalt eierskap

**NFT** (Non-Fungible Token) er unike digitale eiendeler på blokkjeden. Mens en Bitcoin er lik en annen Bitcoin, er hver NFT unik.

**Bruksområder for NFT:**
- **Digital kunst:** Bevisbart eierskap av digitale verk
- **Spillgjenstander:** Items du virkelig eier og kan selge
- **Billetter og medlemskap:** Konsertbilletter, klubbmedlemskap
- **Eiendomsbevis:** Digitale skjøter (fremtiden)

NFT-markedet hadde en stor hype i 2021-2022, men teknologien har reelle bruksområder utover spekulative bilder.

### Web3 – det desentraliserte internett

**Web3** er visjonen om et internett der brukerne eier sine egne data og digitale eiendeler:

- **Web1** (1990-tallet): Les-bare nettsider
- **Web2** (2000-nå): Sosiale medier, men Big Tech eier dataene dine
- **Web3** (fremtiden): Du eier dataene, identiteten og de digitale eiendelene dine

### Risiko i DeFi

DeFi er spennende, men ikke uten risiko:

- **Smart contract bugs:** Kode kan ha feil som utnyttes
- **Regulatorisk usikkerhet:** Lovverket er fortsatt under utvikling
- **Kompleksitet:** Lett å gjøre dyre feil
- **Svindel:** Mange falske prosjekter i DeFi-verdenen

### Oppsummering

DeFi og Web3 representerer fremtiden for finans og internett. Smarte kontrakter automatiserer finansielle tjenester, DEX-er lar deg handle uten mellomledd, staking gir passiv inntekt, og NFT-er muliggjør digitalt eierskap. Men med stor mulighet kommer stor risiko – start forsiktig og lær underveis.

> **Råd for nybegynnere:** Utforsk DeFi med små beløp du har råd til å miste. Prøv å bytte litt ETH på Uniswap eller stake en liten sum for å forstå hvordan det fungerer, før du investerer større beløp.

Siste kapittel handler om sikkerhet, skattemeldingen og veien videre!',
  5,
  false
),

-- Kapittel 6: Sikkerhet og neste steg (KREVER LOGIN)
(
  'sikkerhet-og-neste-steg',
  'Sikkerhet og neste steg',
  'Beskytt deg mot svindel, forstå 2FA, skattemeldingen for krypto i Norge, og veien videre.',
  '## Beskytt deg selv og planlegg fremover

Gratulerer – du har nå en solid forståelse av kryptoverdenen! I dette siste kapittelet fokuserer vi på det viktigste: å holde deg trygg og gjøre ting riktig med norske myndigheter.

### Kryptosvindel – kjenn tegnene

Dessverre tiltrekker kryptoverdenen svindlere. Her er de vanligste formene:

**1. Phishing**
- Falske e-poster som ser ut som de kommer fra Firi, Coinbase osv.
- Falske nettsider som ligner ekte børser
- **Beskyttelse:** Sjekk alltid URL-en, bruk bokmerker, aldri klikk lenker i e-post

**2. Falske investeringsmuligheter**
- «Garantert 10 % daglig avkastning» – alltid svindel
- Kjendiser som «anbefaler» investeringer (falske annonser)
- Ponzi-opplegg som betaler tidlige investorer med nye investorers penger
- **Beskyttelse:** Hvis det høres for godt ut til å være sant, er det det

**3. Rug pulls**
- Nye tokens som plutselig mister all verdi
- Utviklere som forsvinner med investorenes penger
- Spesielt vanlig med meme-coins og nye DeFi-prosjekter
- **Beskyttelse:** Invester kun i etablerte prosjekter, gjør research

**4. Romance scams**
- Noen du møter online som vil «hjelpe deg med kryptoinvestering»
- De bygger tillit over tid, deretter ber om penger
- **Beskyttelse:** Aldri send krypto til noen du bare kjenner online

**5. Falsk kundeservice**
- Svindlere som utgir seg for å være support på Discord, Telegram osv.
- De ber om seed phrase for å «fikse» et problem
- **Beskyttelse:** Ekte support vil ALDRI be om seed phrase eller private nøkler

### 2FA – Tofaktor-autentisering

**2FA** er et ekstra sikkerhetslag utover passordet ditt. Det er essensielt for alle kryptokontoer.

**Typer 2FA (fra svakest til sterkest):**

1. **SMS-koder:** Bedre enn ingenting, men sårbart for SIM-swap
2. **Authenticator-app:** Google Authenticator, Authy – mye tryggere
3. **Hardware-nøkkel:** YubiKey – det sikreste alternativet

**Sett opp 2FA:**
- Aktiver på ALLE kryptobørser og lommebøker
- Bruk Authenticator-app (ikke SMS) der det er mulig
- **Viktig:** Ta backup av 2FA-kodene! Hvis du mister telefonen, trenger du dem

### Sikkerhetsjekkliste

Gå gjennom denne listen for å sikre at du er godt beskyttet:

- Unike, sterke passord for hver tjeneste (bruk en passordmanager som 1Password eller Bitwarden)
- 2FA aktivert på alle kontoer
- Seed phrase skrevet ned på papir, oppbevart sikkert
- Aldri del seed phrase eller private nøkler med noen
- Oppdatert programvare på telefon og PC
- Aldri bruk offentlig WiFi for kryptotransaksjoner
- Dobbeltsjekk alltid mottakeradresser
- Ha en hardware wallet for større beløp

### Krypto og skattemeldingen i Norge

I Norge er kryptovaluta skattepliktig. Her er det du trenger å vite:

**Hva er skattepliktig?**
- Gevinst ved salg av krypto (du selger for mer enn du kjøpte for)
- Bytte mellom kryptovalutaer (regnes som salg + kjøp)
- Betaling for varer/tjenester med krypto
- Mining-inntekter
- Staking-belønninger

**Hva er IKKE skattepliktig?**
- Å kjøpe krypto (selve kjøpet utløser ikke skatt)
- Å overføre mellom egne lommebøker
- Urealisert gevinst (krypto som har steget men ikke solgt)

**Skattesats:**
- Gevinst beskattes som kapitalinntekt: **22 %**
- Tap kan trekkes fra mot annen kapitalinntekt

**Praktisk gjennomføring:**

1. **Hold oversikt:** Logg alle kjøp, salg og bytter med dato, beløp og pris
2. **Bruk verktøy:** Tjenester som Koinly eller CoinTracker kan importere transaksjoner automatisk
3. **Firi og NBX rapporterer:** Norske børser rapporterer til Skatteetaten, men du er selv ansvarlig for at alt er korrekt
4. **Skattemeldingen:** Krypto skal føres i skattemeldingen under «Virtuelle eiendeler/kryptovaluta»

> **Tips:** Start med god bokføring fra dag én. Det er mye enklere å holde orden underveis enn å rekonstruere transaksjonshistorikk i ettertid.

### Veien videre

Du har nå grunnkunnskapen for å navigere kryptoverdenen trygt. Her er noen forslag til neste steg:

**Nivå 1 – Kom i gang:**
- Opprett konto på Firi
- Kjøp din første krypto for et lite beløp
- Sett opp 2FA

**Nivå 2 – Bygg kunnskap:**
- Følg med på kryptonyheter (CoinDesk, The Block)
- Bli med i norske kryptomiljøer
- Prøv å sende krypto mellom egne lommebøker

**Nivå 3 – Utforsk videre:**
- Skaff en hardware wallet
- Prøv en DEX med et lite beløp
- Utforsk staking for passiv inntekt

**Nivå 4 – Bli ekspert:**
- Lær om teknisk analyse
- Utforsk DeFi-strategier
- Vurder å kjøre en node

### Trenger du mer hjelp?

Kryptoverdenen kan være overveldende. Hos **Kryptohjelpen** tilbyr vi personlig veiledning tilpasset ditt nivå og dine mål. Enten du vil:

- Ha hjelp med å komme i gang
- Forstå skattemeldingen for krypto
- Lage en investeringsstrategi
- Sikre dine kryptoverdier ordentlig

Vi er her for å hjelpe! Book en uforpliktende konsultasjon, så tar vi en prat om din situasjon.

### Oppsummering

Sikkerhet er jobb nummer én i krypto. Bruk 2FA, beskytt seed phrase, og vær skeptisk til alt som virker for godt. Husk skattemeldingen – hold oversikt fra dag én. Og viktigst av alt: fortsett å lære, start smått, og bygg kunnskap over tid.

> **Gratulerer!** Du har fullført hele kryptokurset! Du har nå bedre kunnskap enn de fleste nordmenn om kryptovaluta, blockchain, sikkerhet og norske regler. Bruk kunnskapen klokt, og husk: den beste investeringen du kan gjøre er i din egen forståelse.

Lykke til på din kryptoreise!',
  6,
  false
)
ON CONFLICT (slug) DO NOTHING;
