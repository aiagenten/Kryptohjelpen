import { Metadata } from 'next';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { BookOpen, Shield, Wallet, Palette, Cpu, Globe } from 'lucide-react';

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Artikler om krypto, blockchain og Web3 | Kryptohjelpen',
  description: 'Lær om kryptovaluta, blockchain-teknologi, NFT, DeFi og Web3. Guider og artikler for nybegynnere og viderekommende.',
  keywords: ['krypto', 'bitcoin', 'ethereum', 'blockchain', 'NFT', 'DeFi', 'Web3', 'guide', 'nybegynner'],
  openGraph: {
    title: 'Artikler om krypto, blockchain og Web3',
    description: 'Lær om kryptovaluta, blockchain-teknologi, NFT, DeFi og Web3.',
    type: 'website',
    siteName: 'Kryptohjelpen',
  },
};

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  image_url: string | null;
  category: string;
  created_at: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, slug, summary, image_url, category, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

export default async function ArtiklerPage() {
  const articles = await getArticles();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, typeof BookOpen> = {
      'Grunnleggende': BookOpen,
      'Sikkerhet': Shield,
      'DeFi': Wallet,
      'NFT': Palette,
      'Hardware': Cpu,
      'Web3': Globe,
    };
    return iconMap[category] || BookOpen;
  };

  // JSON-LD for article list
  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Kryptohjelpen Artikler',
    description: 'Artikler og guider om kryptovaluta, blockchain og Web3',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: article.title,
          description: article.summary,
          url: `https://kryptohjelpen.no/artikler/${article.slug}`
        }
      }))
    }
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />

      {/* Hero */}
      <div className="page-hero">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>Lær om krypto</h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Artikler og guider for å forstå kryptovaluta, blockchain og Web3-teknologi.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block text-[var(--primary)] flex justify-center"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ingen artikler ennå</h2>
            <p className="text-gray-500">Kom tilbake snart for nye artikler!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/artikler/${article.slug}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  (() => {
                    const Icon = getCategoryIcon(article.category);
                    return (
                      <div className="w-full h-48 bg-gradient-to-br from-[#8DC99C]/20 to-[#8DC99C]/5 flex items-center justify-center">
                        <Icon className="w-16 h-16 text-[#8DC99C]/60" />
                      </div>
                    );
                  })()
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-1 bg-[#8DC99C]/10 text-[#8DC99C] rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(article.created_at)}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#8DC99C] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
