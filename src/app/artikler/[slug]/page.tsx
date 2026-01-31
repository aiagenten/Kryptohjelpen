import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import supabase from '@/lib/supabase';
import { marked, Renderer } from 'marked';

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic';

// Configure marked to open external links in new tab
const renderer = new Renderer();
renderer.link = function({ href, title, text }) {
  const isExternal = href?.startsWith('http') && !href?.includes('kryptohjelpen.no');
  const titleAttr = title ? ` title="${title}"` : '';
  const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
};
marked.setOptions({ renderer });

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  image_url: string | null;
  category: string;
  created_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  aeo_question: string | null;
  aeo_answer: string | null;
}

// Category to image mapping
function getCategoryImage(category: string): string {
  const images: Record<string, string> = {
    'Sikkerhet': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop',
    'Grunnleggende': 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&h=600&fit=crop',
    'DeFi': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop',
    'NFT': 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=1200&h=600&fit=crop',
    'Hardware': 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=1200&h=600&fit=crop',
    'Web3': 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&h=600&fit=crop',
  };
  return images[category] || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&h=600&fit=crop';
}

// Hent artikkel fra database
async function getArticle(slug: string): Promise<Article | null> {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id, title, slug, content, summary, image_url, category, created_at,
        seo_title, seo_description, seo_keywords, aeo_question, aeo_answer
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      return null;
    }

    return article;
  } catch {
    return null;
  }
}

// Generer metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Artikkel ikke funnet' };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.summary || '';
  const keywords = article.seo_keywords?.split(',').map(k => k.trim()) || [];
  const image = article.image_url || getCategoryImage(article.category);

  return {
    title: `${title} | Kryptohjelpen`,
    description,
    keywords,
    authors: [{ name: 'Kryptohjelpen' }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.created_at,
      authors: ['Kryptohjelpen'],
      images: [image],
      siteName: 'Kryptohjelpen',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

// Get inline image for article content
function getInlineImage(category: string): string {
  const images: Record<string, string> = {
    'Sikkerhet': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop',
    'Grunnleggende': 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&h=400&fit=crop',
    'DeFi': 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=400&fit=crop',
    'NFT': 'https://images.unsplash.com/photo-1645731504601-3a3e97659ebc?w=800&h=400&fit=crop',
    'Hardware': 'https://images.unsplash.com/photo-1625806786037-2af608423424?w=800&h=400&fit=crop',
    'Web3': 'https://images.unsplash.com/photo-1644361566696-3d442b5b482a?w=800&h=400&fit=crop',
  };
  return images[category] || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=400&fit=crop';
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Convert markdown to HTML
  const contentHtml = marked(article.content || '');
  
  // Get images - use header version for article page
  const getHeaderImage = (imageUrl: string | null) => {
    if (!imageUrl) return getCategoryImage(article.category);
    // Convert /images/articles/name.png to /images/articles/header-name.png
    if (imageUrl.includes('/images/articles/') && !imageUrl.includes('header-')) {
      return imageUrl.replace('/images/articles/', '/images/articles/header-');
    }
    return imageUrl;
  };
  const headerImage = getHeaderImage(article.image_url);
  const inlineImage = getInlineImage(article.category);

  // JSON-LD Structured Data for SEO/AEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seo_description || article.summary,
    image: article.image_url || undefined,
    datePublished: article.created_at,
    author: {
      '@type': 'Organization',
      name: 'Kryptohjelpen',
      url: 'https://kryptohjelpen.no'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kryptohjelpen',
      url: 'https://kryptohjelpen.no'
    }
  };

  // FAQ Schema for AEO (Answer Engine Optimization)
  const faqSchema = article.aeo_question && article.aeo_answer ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: article.aeo_question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: article.aeo_answer
      }
    }]
  } : null;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Hero with image */}
      <div className="relative">
        <div className="absolute inset-0">
          <img 
            src={headerImage} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/30"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-8 py-20 text-white text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">{article.category}</span>
            <span className="text-white/80">{formatDate(article.created_at)}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{article.title}</h1>
          <p className="text-lg opacity-90">Av Kryptohjelpen</p>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-8 py-12">
        {/* AEO Featured Answer Box */}
        {article.aeo_question && article.aeo_answer && (
          <div className="bg-gradient-to-r from-[#8DC99C]/10 to-[#8DC99C]/5 border-l-4 border-[#8DC99C] rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>💡</span> {article.aeo_question}
            </h2>
            <p className="text-gray-700">{article.aeo_answer}</p>
          </div>
        )}

        {/* Inline image */}
        <img
          src={inlineImage}
          alt={article.title}
          className="w-full h-64 md:h-80 object-cover rounded-xl mb-8 shadow-lg"
        />

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-a:text-[#8DC99C] prose-img:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-td:border prose-td:border-gray-300 prose-td:p-3"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/artikler" className="text-[#8DC99C] hover:underline">
            ← Tilbake til alle artikler
          </Link>
        </div>
      </article>
    </>
  );
}
