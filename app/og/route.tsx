import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pega o título da URL (?title=...) ou usa o padrão do teu portfólio
    const hasTitle = searchParams.has('title');
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 100)
      : 'Portfólio | Desenvolvedor Full Stack';

    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: '#FDFBF7', // Teu fundo off-white (papel)
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '80px',
            border: '16px solid #0A0A0A', // Borda grossa e reta, bem séria
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <span
              style={{
                fontSize: 32,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#D95F2A', // Teu accent laranja queimado
                fontWeight: 600,
              }}
            >
              Theo Stracke
            </span>
            <h1
              style={{
                fontSize: 84,
                fontWeight: 800,
                color: '#0A0A0A', // Preto profundo (ink)
                lineHeight: 1.1,
                textTransform: 'uppercase',
                // Fonte nativa do sistema para evitar carregar arquivos externos pesados
                fontFamily: 'sans-serif',
              }}
            >
              {title}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '4px solid #0A0A0A', // Linha divisória reta
              paddingTop: '32px',
            }}
          >
            <span style={{ fontSize: 28, color: '#0A0A0A', fontWeight: 500, letterSpacing: '0.05em' }}>
              theostracke.com
            </span>
            <span style={{ fontSize: 28, color: '#0A0A0A', fontWeight: 500, letterSpacing: '0.05em' }}>
              Palhoça, SC
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('Erro ao gerar OG Image:', e);
    return new Response('Falha ao gerar a imagem OG', { status: 500 });
  }
}