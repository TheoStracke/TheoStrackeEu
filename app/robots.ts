import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theostracke.work';

  return {
    rules: {
      userAgent: '*', // Aceita qualquer robô de busca
      allow: '/',     // Pode ler o site inteiro
      // Se um dia tu tiveres um painel admin, tu bloqueias aqui:
      // disallow: '/admin/', 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}