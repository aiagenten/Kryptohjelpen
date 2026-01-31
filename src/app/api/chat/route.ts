import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { findNextAvailableSlots, formatSlots } from '@/lib/calendar';
import supabase from '@/lib/supabase';

// Create OpenAI client lazily at request time (not build time)
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

// Keywords that indicate crypto-specific questions
const CRYPTO_KEYWORDS = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'krypto', 'crypto', 'wallet', 'lommebok',
  'blockchain', 'nft', 'defi', 'staking', 'mining', 'token', 'coin', 'binance',
  'coinbase', 'metamask', 'ledger', 'trezor', 'seed phrase', 'private key',
  'smart contract', 'web3', 'dapp', 'swap', 'exchange', 'børs', 'altcoin',
  'solana', 'cardano', 'polygon', 'arbitrum', 'optimism', 'layer 2', 'l2',
  'gas', 'gwei', 'memecoin', 'shitcoin', 'hodl', 'moon', 'pump', 'dump',
  'kjøpe', 'selge', 'investere', 'handle', 'overføre', 'sende'
];

const SYSTEM_PROMPT = `Du er en hjelpsom kundeservice-assistent for Kryptohjelpen.no.

Om Kryptohjelpen:
- Vi tilbyr TEKNISK VEILEDNING innen krypto, blockchain og Web3
- Vi gir IKKE investeringsråd
- Våre tjenester: AI Chatbot (betalt), 1-til-1 konsultasjon, bedriftskurs
- Kontakt: post@kryptohjelpen.no

Viktige regler:
1. ALDRI gi investeringsråd eller anbefal kjøp/salg av krypto
2. For generelle spørsmål (åpningstider, priser, kontakt osv): Svar fritt
3. For krypto-spesifikke spørsmål: Forklar at dette krever chatbot-tilgang
4. Vær vennlig, profesjonell og svar på norsk
5. Hold svarene konsise

Priser:
- Chatbot-tilgang (7 dager): 250 kr
- 1-til-1 Konsultasjon (60 min): 1490 kr
- Bedriftskurs: Fra 4990 kr

Kontakt: post@kryptohjelpen.no`;

const FREE_PROMPT = `${SYSTEM_PROMPT}

VIKTIG: Brukeren har IKKE betalt for chatbot-tilgang.
- Svar på generelle spørsmål om Kryptohjelpen, priser, kontaktinfo
- For krypto-spesifikke spørsmål, si at de må kjøpe chatbot-tilgang (250 kr) for å få hjelp
- Tilby alternativt å booke en personlig konsultasjon hvis de vil ha mer dyptgående hjelp`;

const PAID_PROMPT = `${SYSTEM_PROMPT}

Brukeren HAR betalt for chatbot-tilgang. Gi dem full teknisk hjelp med krypto-spørsmål.
Fokuser på teknisk veiledning, ikke investeringsråd.`;

function isCryptoQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return CRYPTO_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

async function hasActiveChatbotAccess(userId: number | null): Promise<boolean> {
  if (!userId) return false;
  
  try {
    // Check if user has active chatbot access (purchased in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('order_items')
      .select(`
        id,
        orders!inner(user_id, order_status, created_at),
        products!inner(category)
      `)
      .eq('orders.user_id', userId)
      .eq('orders.order_status', 'completed')
      .eq('products.category', 'chatbot')
      .gte('orders.created_at', sevenDaysAgo.toISOString())
      .limit(1);
    
    return !error && data && data.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], userId = null, action = null } = await request.json();

    // Handle special actions
    if (action === 'check_availability') {
      try {
        const slots = await findNextAvailableSlots(60, 3);
        const formatted = formatSlots(slots);
        return NextResponse.json({
          reply: `Her er de neste ledige tidene for en konsultasjon:\n\n${formatted}\n\nVil du booke en av disse? Gå til kryptohjelpen.no/konsultasjon for å bestille.`,
          action: 'show_slots',
          slots
        });
      } catch (error) {
        console.error('Calendar error:', error);
        return NextResponse.json({
          reply: 'Beklager, jeg kunne ikke sjekke kalenderen akkurat nå. Kontakt oss på post@kryptohjelpen.no for å booke.',
        });
      }
    }

    if (!message) {
      return NextResponse.json({ error: 'Melding er påkrevd' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Chatbot ikke konfigurert' }, { status: 500 });
    }

    const isCrypto = isCryptoQuestion(message);
    const hasAccess = await hasActiveChatbotAccess(userId);

    // Determine which prompt to use
    let systemPrompt = FREE_PROMPT;
    let shouldUpsell = false;

    if (isCrypto && !hasAccess) {
      shouldUpsell = true;
      systemPrompt = FREE_PROMPT;
    } else if (hasAccess) {
      systemPrompt = PAID_PROMPT;
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.slice(-10).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    let reply = completion.choices[0]?.message?.content || 'Beklager, jeg kunne ikke generere et svar.';

    // Build response
    const response: {
      reply: string;
      upsell?: { type: string; message: string; productId?: number };
      isCryptoQuestion?: boolean;
      hasAccess?: boolean;
    } = { reply };

    // Add upsell info for frontend
    if (shouldUpsell) {
      response.upsell = {
        type: 'chatbot',
        message: 'Få tilgang til krypto-hjelp i 7 dager for kun 250 kr!',
        productId: 9 // Øyeblikkelig hjelp (Chatbot)
      };
      response.isCryptoQuestion = true;
      response.hasAccess = false;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Noe gikk galt' }, { status: 500 });
  }
}
