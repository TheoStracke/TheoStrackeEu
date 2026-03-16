import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theostracke.work';
  
  // Os idiomas que tu dás suporte
  const locales = ['pt', 'en', 'es'];

  // Gera uma rota pra cada idioma
  const localeRoutes = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1, // Prioridade máxima pras homes traduzidas
  }));

  return [
    {
      url: baseUrl, // A raiz (que o middleware redireciona)
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    ...localeRoutes,
  ]
}