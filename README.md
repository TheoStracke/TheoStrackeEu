# Theo Stracke — Portfólio

Portfólio em formato de narrativa por capítulos, guiado por scroll. Um palco 3D persistente — milhares de partículas na GPU — muda de forma a cada capítulo da trajetória (logo, órbita, livro, terreno noturno, chuva de dados, logo TR, constelação de skills, ondulação, módulos de ERP, galáxia e globo).

**Produção:** https://theostracke.work · **Idiomas:** pt (padrão), en, es

## Stack

Next.js 16 (App Router, Turbopack) · React 19.3 · TypeScript 6 · Tailwind CSS 4 · GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG, ScrambleText) · Lenis 1.3 · Three.js 0.186 · React Three Fiber 9 + drei 10 · d3-force.

## Destaques técnicos

- **Morph de partículas sem custo de CPU:** as 11 formas vivem num `DataArrayTexture`; o shader (GLSL3) interpola entre camadas, com atraso por partícula, turbulência de trânsito, neblina, "lanterna", repulsão do cursor e pulso no clique.
- **Coreografia declarativa:** `lib/stage/layouts.ts` define cada keyframe; os capítulos só registram _quando_ (posição de scroll, inclusive dentro de pins).
- **Loader sem corte:** o logo "TS." desenhado em SVG vira partículas no mesmo lugar e viaja até o hero.
- **Transições reversíveis:** máscaras por `clip-path`, SplitText por linha/letra, pins narrativos (GSAP `matchMedia`).
- **View Transitions:** a prévia do projeto vira o hero do case study (`/[lang]/projetos/[slug]`).
- **Acessibilidade e fallback:** mobile, `prefers-reduced-motion` e navegadores sem WebGL2 recebem a versão sem 3D (o Three nem é baixado); skip link, foco visível, menu com focus trap.
- **i18n tipado:** o schema nasce do `pt.json`, e a compilação falha se `en`/`es` divergirem.

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

Requer Node 20.9+. Variáveis opcionais: `NEXT_PUBLIC_SITE_URL` e `MAINTENANCE_MODE=true` (redireciona para `/{locale}/maintenance`).

## Estrutura

```
app/
  [lang]/              layout raiz (html/fontes/metadata), home, case studies, manutenção, OG
  components/
    chapters/          um componente por capítulo
    stage/             canvas R3F + campo de partículas
    motion/            SplitReveal, MaskReveal, FadeReveal, Magnetic, Counter
    providers/         Lenis + GSAP ticker, âncoras
    ui/                header, menu, cursor, HUD, ícones
lib/
  stage/               formas, layouts (keyframes), shaders, store
  gsap.ts, media.ts, brand.ts, chapters.ts, i18n.ts, skills-layout.ts
dictionaries/          pt.json · en.json · es.json
proxy.ts               idioma por cookie/Accept-Language + modo manutenção
```

As convenções do projeto e o radar de versões ficam em [`persona.md`](./persona.md).
