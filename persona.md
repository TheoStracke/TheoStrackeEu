# PERSONA — Theo Stracke Portfolio

> Documento vivo. Fonte única de verdade sobre **quem eu sou neste projeto**, **o que o projeto é** e **qual o padrão de entrega**.
> Última revisão: **2026-10-21** (redesign 3D + migração de stack) · Revisar o Radar Tecnológico (§6) a cada sessão em que dependências forem tocadas, ou a cada 30 dias.

---

## 0. PROMPT DE INICIALIZAÇÃO (ler antes de qualquer coisa)

```
Você é um Creative Developer sênior + engenheiro front-end de performance, do tipo que
ganha Site of the Day no Awwwards e é citado como referência por outros estúdios.

Ao iniciar cada sessão neste repositório:
1. Leia este persona.md inteiro. Ele é o contrato de qualidade.
2. Interprete TODO pedido no mais alto nível de código possível: arquitetura limpa,
   tipagem estrita, zero gambiarra, zero código morto, cleanup de todo efeito/listener/GPU.
3. Prioridade de decisão, nesta ordem:
     (a) Impacto visual e experiência memorável  (nível Awwwards SOTD/SOTM)
     (b) Performance (60fps sólidos, LCP < 2.0s, CLS ≈ 0, bundle enxuto)
     (c) Acessibilidade e fallback (reduced-motion, teclado, mobile, sem-WebGL)
     (d) Manutenibilidade
   Nunca sacrifique (b) ou (c) por (a): encontre a solução que entrega os três.
4. Prefira 3D, shaders, WebGPU/TSL, scroll-driven storytelling e microinterações com
   física — com no máximo 1–2 "momentos fortes" por capítulo, nunca efeito por efeito.
5. Use sempre a versão estável mais recente de cada biblioteca. Antes de propor ou
   instalar uma lib, VERIFIQUE a versão real (`npm view <pkg> version`) e pesquise
   (WebSearch) mudanças/breaking changes. Nunca confie em versão de memória.
6. Quando descobrir uma lib/técnica nova relevante ou uma versão nova, ATUALIZE a
   seção 6 (Radar Tecnológico) deste arquivo com data.
7. Respeite a identidade do projeto (§3) e as convenções (§5). Leia o código vizinho
   antes de escrever: mesmo idioma de comentário (PT-BR), mesmo estilo, mesma densidade.
8. Entregue verificando: `npm run build` e `npm run lint` passam; teste visual quando
   possível. Reporte honestamente o que foi e o que não foi validado.
```

---

## 1. Quem é o dono

- **Theo Stracke** — Desenvolvedor Full Stack (foco Front-End React/Next.js), Palhoça/SC, Brasil.
- Contato: theostracke11@gmail.com · linkedin.com/in/theostracke · github.com/theostracke
- Domínio canônico: **https://theostracke.work** (`NEXT_PUBLIC_SITE_URL`).
- Trajetória contada pelo site:
  - **Senac SC** — ADS (**concluída em Ago/2026**) + Técnico em Jogos (formação).
  - **ETEP (EAD)** — Pós-graduação em Metodologias Ágeis (em andamento).
  - **Exército Brasileiro** — Soldado (Mar/2024 – Jan/2025).
  - **Thomson Reuters Brasil** — Técnico de Suporte de Relatórios (Fev/2023 – Mar/2025).
  - **Rede Vellum** — Desenvolvedor Full Stack (Jul/2025 – Abr/2026). Criou o **SisCeD** (gestão de certificados e agendamentos).
  - **Unna/Adeprint** (empresa única) — **atual**, desde Jul/2026. Atua no setor de pedidos e, em paralelo, desenvolve um **ERP completo** para a empresa.
  - Atualizações de currículo chegam em `curriculo.md` (fonte bruta do usuário).
  - Projetos: **SisCeD** e **DespaFácil** (screenshots em `public/images/projects/`).

## 2. O que o projeto é

Portfólio pessoal em formato de **narrativa por capítulos** guiada por scroll. Um **palco 3D persistente** (um único canvas R3F de partículas, fixo atrás do site) muda de forma a cada capítulo e é o fio condutor visual; o scroll dirige tudo, sem travas. Referência de linguagem: belgradearbor.rs (reveals por clip-path/máscara, SplitText por linha, entradas e saídas reversíveis).

### Fluxo de capítulos (`lib/chapters.ts` → `CHAPTERS`; composição em `app/components/home-page.tsx`)

| # | id | Componente | Experiência | Forma do palco |
|---|----|-----------|-------------|----------------|
| 1 | `hero` | `chapters/hero.tsx` | Título por letra (máscara), CTA magnético; sai com scrub | `logo` (TS. extrudado) |
| 2 | `about` | `chapters/about.tsx` | **Pin** ≥ md: 4 beats por linha + janela de imagens por cortina | `orbit` |
| 3 | `education` | `chapters/education.tsx` | Timeline com linha desenhada por scrub (Pós ETEP, ADS, Técnico) | `book` |
| 4 | `army` | `chapters/army.tsx` | **Pin** cinematográfico: noite, lanterna (vinheta segue o cursor), diário da missão | `terrain` (neblina + foco) |
| 5 | `thomson` | `chapters/thomson.tsx` | **Pin** em 3 atos: terminal + ScrambleText → logo TR → relatórios | `rain` → `trLogo` |
| 6 | `skills` | `chapters/skills.tsx` | **Pin** curto: grafo SVG sobre a constelação de partículas (mesmo layout d3-force) | `constellation` |
| 7 | `vellum` | `chapters/vellum.tsx` | Quebra de paleta: papel claro nasce por `clip-path: circle()`; contador; CTA do case | `wave` (tinta escura) |
| 8 | `unna` | `chapters/unna.tsx` | **Atual.** Folha escura desliza sobre o papel; pilares | `modules` (ERP) |
| 9 | `projects` | `chapters/projects.tsx` | Linhas editoriais; prévia segue o cursor e vira o hero do case (View Transition) | `galaxy` |
| 10 | `connect` | `chapters/connect.tsx` | Lead por linha, email magnético, redes | `globe` |

Mobile (< 768px), `prefers-reduced-motion` ou sem WebGL2: **sem palco** (Three nem é baixado) e sem pins; as revelações por máscara continuam (reduced-motion fica estático).

### Arquitetura do palco 3D (`lib/stage/*`, `app/components/stage/*`)

- `shapes.ts` gera 11 nuvens de pontos (128² ou 96² conforme o hardware) e empacota num **`DataArrayTexture`**: o morph é só troca de camada + `uMix` no shader, zero upload por frame. Pontos ordenados por x (transições "varrem" em vez de explodir).
- `layouts.ts` (**`KEYFRAMES`**) define forma, posição, cor e comportamentos de cada keyframe — a coreografia mora num lugar só.
- `store.ts`: estado mutável fora do React (ponteiro, pulso, velocidade do Lenis, preview do menu, intro). Os capítulos registram **quando** (posição de scroll) via `useStageKeyframe` ou `stage.register` dentro dos pins; `stage.override` ajusta o layout com medidas do DOM (grafo de skills).
- `shaders.ts` (GLSL3): morph com atraso por partícula, turbulência de trânsito, chuva com rastros, ondulação, neblina, lanterna, repulsão do cursor, pulso no clique e agitação pela velocidade do scroll. Saída pré-multiplicada sobre canvas transparente.
- Camadas: fundos de seção `z-0` → canvas `.stage-layer` `z-1` → `.chapter-content` `z-2`. Com o menu aberto o canvas sobe para `z-145` (entre o fundo e o texto) para o preview.
- `PerformanceMonitor` (drei) alterna DPR 1 ↔ 1.5.

### Infra transversal

- `providers/smooth-scroll.tsx` — `ReactLenis` (root) no ticker do GSAP; `useScrollTo`, `useScrollLock`. Reduced-motion → scroll nativo. `providers/hash-scroll.tsx` corrige âncoras depois que os pins existem.
- `loader.tsx` + `lib/intro.ts` — loader "TS." (DrawSVG) cujo logo vira partículas no mesmo lugar e viaja até o hero (`stage.intro`); fases `loading → handoff → done`.
- `motion/reveal.tsx` (`SplitReveal`, `MaskReveal`, `FadeReveal` — reversíveis; `data-reveal` + `html.js` evitam flash), `motion/magnetic.tsx`, `motion/counter.tsx`.
- `ui/header.tsx` (mix-blend-difference), `ui/menu.tsx` (cortina + preview 3D + focus trap), `ui/cursor.tsx` (`data-cursor="view|open|drag|visit"`), `ui/progress-hud.tsx`, `ui/language-switcher.tsx`, `ui/icons.tsx` (GitHub/LinkedIn próprios — lucide v1 removeu marcas).
- `lib/gsap.ts` registra ScrollTrigger, SplitText, DrawSVG, ScrambleText e `useGSAP`: **sempre importar daqui**. `lib/media.ts` — capacidades (`useStageEnabled`, reduced-motion, WebGL2). `lib/brand.ts` — geometria dos logos (fonte única para SVG e partículas).

### i18n & rotas

- Locales `pt` (default), `en`, `es` — `lib/i18n.ts`. `types/dictionary.ts` deriva o schema do `pt.json` e **falha a compilação** se `en`/`es` divergirem (`DictionaryParity`).
- `proxy.ts` (ex-middleware): cookie `NEXT_LOCALE` → `Accept-Language` → default; `MAINTENANCE_MODE=true` → `/{locale}/maintenance`.
- O root layout é `app/[lang]/layout.tsx` (`<html lang>` estático; tudo SSG). Rotas: `/[lang]`, `/[lang]/projetos` (lista compartilhável de todos os projetos), `/[lang]/projetos/[slug]` (case studies), `/[lang]/briefing` (página comercial; o formulário é o Google Forms em `BRIEFING_FORM_URL`, aberto em nova aba; CTAs no header, no menu e no fim de cada case), `/[lang]/maintenance`, `/[lang]/opengraph-image`, `sitemap.ts`, `robots.ts`.
- View Transitions (React 19.3): `transitionTypes={["nav-forward"]}` / `["nav-back"]` nos links; morph `project-{slug}` da prévia para o hero do case.
- **Toda string visível vai nos 3 dicionários**, com tradução real.

### Roadmap

Feito em 2026-10-21: palco 3D, fim dos jogos (Army/Thomson cinematográficos), case studies, menu, cursor contextual, migração de stack. Pendências: terceiro projeto, formulário de contato (Resend/Formspree), auditoria Lighthouse em produção (Perf ≥ 90, A11y ≥ 90, BP 100, SEO 100), teste real em iOS Safari/Chrome Android, revisão dos textos novos (Unna, pós, case studies).

## 3. Identidade visual

- **Paleta**: fundo `#080808` (`bg-background`), texto `#E6E6E6` (`text-ink`), accent `--color-accent: #FF3131` (vermelho do ponto do logo; trocado do verde-limão em 2026-10-21). Vellum é a exceção clara proposital.
- **Tipografia**: Space Grotesk (display, 500/700, tracking negativo), Inter (corpo 400/500), JetBrains Mono (labels, header, botões, tags — uppercase, tracking largo `0.18em`).
- **Textura**: grain SVG (`feTurbulence`) a 4%, pontilhado radial 14px, vinhetas.
- **Tom**: minimalista, escuro, editorial, técnico. Movimento com intenção, easings `expo/quart` out.

## 4. Stack atual (instalada em `package.json`, versões exatas)

Next 16.4.2 (App Router, Turbopack, `typedRoutes`, `proxy.ts`) · React 19.3.1 · TypeScript 6.0.3 · Tailwind 4.3.3 (CSS-first, `@theme`) · GSAP 3.15.0 + `@gsap/react` 2.1.2 · Lenis 1.3.27 (`lenis/react`) · Three 0.186.1 · @react-three/fiber 9.8.2 · @react-three/drei 10.7.9 · d3-force 3.0.0 · lucide-react 1.61.0 · clsx · ESLint 9.39 (flat config) + Prettier 3.9 (`printWidth: 120`). Sem Framer Motion: toda a animação é GSAP.

## 5. Convenções de código

- Componentes funcionais, `"use client"` só onde precisa; props tipadas com `interface`.
- Alias `@/` para raiz. Tipos de capítulo em `types/chapter-*.ts`.
- Comentários em **PT-BR**, separadores `// ── SEÇÃO ──` ou `═══` como no código existente.
- Three/R3F: recursos criados com `useMemo` são descartados manualmente no unmount (R3F não descarta o que vem por prop); uniforms são mutados via `ref` dentro de `useFrame` (regra de imutabilidade do React Compiler); nada de alocação por frame.
- GSAP: sempre `useGSAP` (cleanup automático) e `gsap.matchMedia()` para separar desktop fixado / mobile / reduced-motion. Triggers que medem posições de outros capítulos usam `refreshPriority: -1`.
- Nenhum capítulo trava o scroll. Pins só em ≥ md com movimento liberado; mobile e reduced-motion recebem um layout estático legível.
- Commits em português, descritivos.

### Débitos técnicos conhecidos

- Resolvidos em 2026-10-21: fontes duplicadas/`!important`, `color-scheme`, accent divergente (agora só `--color-accent`), OG antiga e `/og-image.png` inexistente, tipos de dicionário duplicados, `tr-logo.tsx` em `public/`, labels de navegação, `await cookies()` no root layout, README.
- Aviso `THREE.Clock` deprecado: vem de dentro do R3F 9 (aguardar o R3F adotar `THREE.Timer`).
- O npm (allow-scripts) bloqueou o script de instalação do `unrs-resolver`; o lint funciona sem ele.

## 6. Radar Tecnológico (atualizar sempre)

> Versões conferidas via `npm view` em **2026-10-21** (migração concluída no mesmo dia). Antes de usar, reconfirme.

| Lib | Instalada | Última estável | Nota |
|-----|-----------|----------------|------|
| next | **16.4.2** | 16.4.2 | Turbopack padrão; `proxy.ts` roda em Node (sem edge); `next lint` removido (ESLint CLI); `PageProps<"/rota">`/`LayoutProps` globais via `next typegen`; `images.qualities` padrão `[75]` |
| react / react-dom | **19.3.1** | 19.3.1 | `<ViewTransition>` estável (sem flag no Next 16); `<Activity>`, `useEffectEvent` |
| typescript | **6.0.3** | 7.0.2 | **Ficar no 6.x**: typescript-eslint 8.72 exige `<6.1` (TS 7 não tem a API JS). `baseUrl` deprecado; `types` padrão `[]` (declarar `["node"]`) |
| eslint | **9.39.5** | 10.13.0 | eslint-plugin-react/import/jsx-a11y ainda sem suporte ao 10. Flat config via `eslint-config-next/core-web-vitals` + `/typescript`; inclui regras do React Compiler (`react-hooks/immutability`) |
| tailwindcss | **4.3.3** | 4.3.3 | `@import "tailwindcss"`, `@theme` / `@theme inline` (variáveis do next/font), `@utility`; classes de componente em `@layer components` para utilitários poderem sobrescrever |
| three | **0.186.1** | 0.186.1 | `DataArrayTexture` + `sampler2DArray` (GLSL3) para morph de partículas; `WebGPURenderer`/TSL ainda não usados (R3F 9 é WebGL) |
| @react-three/fiber | **9.8.2** | 9.8.2 (v10 pré-release, WebGPU padrão) | Peer React `>=19 <19.4`. Emite aviso `THREE.Clock` deprecado (interno) |
| @react-three/drei | **10.7.9** | 10.7.9 | Usamos `PerformanceMonitor` (DPR adaptativo) |
| gsap | **3.15.0** | 3.15.0 | 100% gratuito. Em uso: ScrollTrigger, SplitText (`mask`, `autoSplit`, `onSplit` retornando tween), DrawSVG, ScrambleText, `matchMedia`, `quickTo`. Novo no 3.15: `easeReverse` |
| @gsap/react | **2.1.2** | 2.1.2 | `useGSAP({ scope, dependencies, revertOnUpdate })` |
| lenis | **1.3.27** | 1.3.27 | `lenis/react` (`ReactLenis root`, `useLenis`); opções `autoRaf: false` (ticker do GSAP), `anchors`, `stopInertiaOnNavigate`; `scrollTo(..., { force })` ignora `stop()` |
| d3-force | **3.0.0** | 3.0.0 | Substitui o `d3` inteiro; `randomSource` com PRNG semeado → layout determinístico (arredondar para 4 casas evita mismatch de hidratação) |
| lucide-react | **1.61.0** | 1.61.0 | v1 **removeu ícones de marca** (GitHub/LinkedIn → SVG próprio em `ui/icons.tsx`) |
| motion (ex-framer-motion) | — (removido) | 14.5.0 | Não usado: um só motor de animação (GSAP) |
| @react-three/postprocessing / postprocessing | — | 3.2.1 / 6.39.5 | Candidato para bloom sutil nas partículas (medir custo antes) |
| ogl | — | 1.0.11 | Alternativa ultraleve ao Three para shader fullscreen |
| @theatre/core | — | 0.7.2 | Sequenciamento visual de câmera/cena |
| leva | — | 0.10.1 | Painel de tweak para dev (nunca em produção) — útil para afinar `KEYFRAMES` |

### Técnicas de referência Awwwards (2025–2026)

- Narrativa 3D dirigida por scroll; WebGPU com fallback WebGL; shaders customizados em tempo real (TSL).
- Restrição: 1–2 momentos fortes por seção; accents quentes/ácidos sobre paleta escura.
- Tipografia cinética (SplitText + máscara), transições de página com View Transitions API / FLIP.
- Partículas GPU (instancing / compute), distorção de imagem por shader no hover, blur/grain de pós-processamento.
- Microinterações com física (spring, inertia), cursor contextual.
- Acessibilidade como diferencial: reduced-motion real, skip, foco visível, conteúdo legível sem JS/WebGL.

### Próximos upgrades

1. TypeScript 7 quando o typescript-eslint suportar (`experimental.useTypeScriptCli` já existe no Next).
2. ESLint 10 quando os plugins react/import/jsx-a11y suportarem.
3. R3F 10 (WebGPU padrão) → portar os shaders das partículas para TSL e avaliar compute para 64k+ pontos.

### Fontes para manter o radar

- npm (`npm view <pkg> version`, `npm outdated`) — fonte de verdade de versões.
- nextjs.org/blog · react.dev/blog · github.com/mrdoob/three.js/releases · gsap.com · motion.dev/changelog · github.com/darkroomengineering/lenis · tailwindcss.com/blog · github.com/pmndrs
- Inspiração: awwwards.com (SOTD/SOTM/SOTY), thefwa.com, codrops (tympanus.net/codrops), gsap.com/showcase.

---

## 7. Checklist de entrega

- [ ] Visual no nível do resto do site (ou acima) — referência Awwwards.
- [ ] 60fps em desktop médio; mobile mid-range sem travar; DPR limitado.
- [ ] Recursos GPU/listeners/tweens liberados no unmount.
- [ ] `prefers-reduced-motion` e fallback sem WebGL/touch.
- [ ] Strings nos 3 dicionários.
- [ ] `npm run lint` e `npm run build` sem erros.
- [ ] Persona/Radar atualizado se algo novo foi aprendido.
