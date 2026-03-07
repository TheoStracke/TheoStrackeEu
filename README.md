# Theo Stracke | Portfólio Web

Um portfólio interativo e responsivo construído com as tecnologias mais modernas do ecossistema web. Apresenta experiência profissional, trajetória educacional e projetos de forma envolvente com animações sofisticadas e uma experiência de usuário minimalista e intuitiva.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura](#-arquitetura)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Status do Projeto](#-status-do-projeto)
- [Contribuições & Contato](#-contribuições--contato)

---

## Sobre o Projeto

Este portfólio é uma vitrine digital profissional que combina **design minimalista** com **animações sofisticadas** para criar uma experiência memorável. Idealizado para apresentar trajetória em desenvolvimento de sistemas, suporte técnico e automação, o projeto demonstra domínio de tecnologias front-end modernas e boas práticas de desenvolvimento.

**Problema resolvido**: Criar uma presença digital diferenciada que escape dos portfólios genéricos, comunicando tecnicamente enquanto impressiona visualmente.

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Next.js** | 14.2.3 | Framework React com SSR, otimizações de performance e roteamento inteligente |
| **React** | 18.3.1 | Biblioteca para construção de UI com componentes reutilizáveis |
| **TypeScript** | 5.4.2 | Tipagem estática para maior segurança e qualidade de código |
| **Tailwind CSS** | 3.4.3 | Utility-first CSS framework para estilização eficiente |

### Animações & Interatividade
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Framer Motion** | 11.0.17 | Biblioteca de animações declarativas e gestos complexos |
| **Lenis** | 1.1.14 | Smooth scrolling de alta performance e elegância |

### Utilitários
| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Lucide React** | 0.378.0 | Ícones SVG moderados e consistentes |
| **clsx** | 2.1.0 | Utility para manipulação condicional de classes CSS |

### Desenvolvimento
| Ferramentas | Versão |
|-----------|--------|
| **ESLint** | 8.57.0 |
| **Prettier** | 3.2.5 |
| **PostCSS** | 8.4.38 |
| **Autoprefixer** | 10.4.19 |

---

## ✨ Funcionalidades Principais

### 🎯 Hero Section Dinâmica
- Tipografia grande e impactante com animações entrance suave
- Descrição clara da proposta de valor
- CTA (Call-to-Action) interativo com efeito magnético
- Indicador visual de disponibilidade para colaborações

### 💼 Experiência Profissional
- Timeline visual das experiências profissionais
- Cards informativos com empresa, período e detalhes
- Modal neural overlay para visualizar skills técnicos especializados
- Logo das empresas para maior contexto visual

### 🎓 Trajetória Educacional
- Histórico educacional estruturado por período
- Exibição de habilidades adquiridas por curso
- Integração visual com experiência profissional

### 🎨 Design Minimalista + Animações
- **Reveal animations** para elementos ao scroll
- **Custom cursor** personizado que acompanha o mouseflow
- **Magnetic buttons** que atraem o cursor antes do clique
- **Morphing buttons** com transições fluídas
- **Marquee effect** para destaque de informações
- **Neural overlay** com visual sofisticado (glassmorphism)

### 📱 Responsividade
- Design completamente responsivo (mobile-first)
- Grid adaptativo para diferentes breakpoints (sm, md, lg)
- Layout otimizado para tablets, desktops e ultra-wide screens

### 🌐 SEO & Metadata
- Metadata completa para compartilhamento em redes sociais
- Favicon customizado
- Idioma otimizado para português (Brasil)

---

## 🏗️ Arquitetura

### Padrão Utilizado: **Component-Driven Development**

O projeto segue o paradigma de componentes reutilizáveis, típico de aplicações React modernas, com separação clara de responsabilidades.

```
app/
├── layout.tsx           # Root layout com fontes, metadata e providers
├── page.tsx             # Página principal com lógica de estado
├── globals.css          # Estilos globais e variáveis CSS
└── components/
    ├── custom-cursor.tsx          # Cursor personalizado
    ├── featured-project-card.tsx  # Card para projetos destaque
    ├── lenis-provider.tsx         # Provider do Lenis (smooth scroll)
    ├── magnetic-button.tsx        # Botão com efeito magnético
    ├── marquee.tsx                # Efeito marquee para textos
    ├── morphing-button.tsx        # Botão com transição morphing
    ├── neural-overlay.tsx         # Modal com overlay neural
    ├── reveal.tsx                 # Componente reveal ao scroll
    ├── section-heading.tsx        # Heading reutilizável
    └── side-nav.tsx               # Navegação lateral/mobile

public/
└── images/logos/        # Assets de logos das empresas e educação
```

### Convenções de Código

**Componentes**:
- Padrão **functional components** com hooks
- Componentes UI abstraídos em arquivos separados (`components/`)
- Props tipadas com TypeScript
- Nomes descritivos e semânticos

**Estilos**:
- Tailwind CSS com classes utility
- Variáveis CSS customizadas para cores e tipografia
- Suporte a dark mode preparado (pode ser expandido)

**Animações**:
- Framer Motion para controle declarativo de animações
- Configurações centralizadas de easing e timing
- REM units para escalabilidade

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- **Node.js** >= 16.x (recomendado 18.x+)
- **npm** ou **yarn**

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/theostracke/theostracke.git
cd theostracke
```

### 2️⃣ Instalar Dependências

```bash
npm install
# ou
yarn install
```

### 3️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (se necessário para APIs futuras):

```env
# .env.local (exemplo para integrações futuras)
# NEXT_PUBLIC_API_URL=https://api.example.com
# SMTP_USER=seu-email@example.com
# SMTP_PASS=sua-senha
```

**Nota**: No estado atual, o projeto roda sem variáveis de ambiente. Este arquivo é preparatório para possíveis integrações futuras (formulário de contato, analytics, etc).

### 4️⃣ Rodar em Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

Acesse `http://localhost:3000` no navegador. O projeto abrirá com **hot reload** automático.

### 5️⃣ Build para Produção

```bash
npm run build
npm run start
```

### 6️⃣ Outras Alterações Úteis

**Formatar código** com Prettier:
```bash
npm run format
```

**Lint do código**:
```bash
npm run lint
```

### 📋 Checklist de Configuração

- [ ] Node.js >= 16.x instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto rodando localmente em `http://localhost:3000`
- [ ] Sem erros no console do navegador
- [ ] Animações e smooth scroll funcionando

---

## 📁 Estrutura de Pastas Detalhada

```
.
├── app/
│   ├── components/              # Componentes React reutilizáveis
│   ├── globals.css              # Estilos globais e temas
│   ├── layout.tsx               # Root layout com providers
│   └── page.tsx                 # Página principal do portfólio
│
├── public/
│   ├── images/logos/            # Assets de logos (empresa, educação)
│   └── favicon/                 # Favicon customizado
│
├── next.config.mjs              # Configuração Next.js
├── tailwind.config.ts           # Configuração Tailwind CSS
├── tsconfig.json                # Configuração TypeScript
├── postcss.config.js            # Configuração PostCSS + Autoprefixer
├── package.json                 # Dependências e scripts
└── README.md                    # Este arquivo
```

### Explicação das Pastas

| Pasta | Propósito |
|-------|----------|
| `app/` | Contém toda a lógica da aplicação (App Router do Next.js 13+) |
| `app/components/` | Componentes React isolados e reutilizáveis |
| `public/` | Assets estáticos (imagens, ícones) servidos diretamente |
| `app/globals.css` | CSS global e variáveis de tema (cores, tipografia) |

---

## 🎯 Endpoints & Rotas

Como é um portfólio estático sem backend, as rotas são apenas **páginas/seções**:

| Rota | Método | Descrição |
|------|--------|----------|
| `/` | GET | Página principal com hero, experiência, educação e projetos |
| `/#projects` | GET | Âncora para seção de projetos em destaque |
| `/#about` | GET | Âncora para seção sobre (biografia) |
| `mailto:theostracke11@gmail.com` | - | Link de contato via email |
| `https://linkedin.com/in/theostracke` | - | Link externo para LinkedIn |
| `https://github.com/theostracke` | - | Link externo para GitHub |

**Nota**: O projeto é um **Single Page Application (SPA)** otimizado com Next.js, podendo ser facilmente estendido com um backend (API routes do Next.js, autenticação, etc).

---

## 📊 Performance & Otimizações

- ✅ **Next.js Image Optimization**: Imagens otimizadas automaticamente
- ✅ **CSS-in-JS**: Tailwind CSS com tree-shaking automático
- ✅ **Code Splitting**: Componentes carregados under demand
- ✅ **Smooth Scroll**: Lenis para scroll performance mantido
- ✅ **TypeScript**: Detecção de erros em tempo de desenvolvimento
- ✅ **ESLint**: Qualidade de código garantida

---

## 🔮 Roadmap & Melhorias Futuras

- [ ] **Seção de Projetos Expandida**: Cards com links para GitHub/demos
- [ ] **Blog/Articles**: Seção de artigos técnicos com MDX
- [ ] **Formulário de Contato**: Integração com Sendgrid ou similar para emails
- [ ] **Dark Mode Toggle**: Suporte completo a temas
- [ ] **Analytics**: Integração com Google Analytics ou Plausible
- [ ] **CMS Headless**: Integração com Sanity.io ou Contentful para dinâmicidade
- [ ] **API Route**: Endpoint para envio de emails do formulário de contato
- [ ] **PWA**: Suporte offline com Service Workers

---

## 📸 Prints & Imagens

Aqui você pode adicionar screenshots de diferentes seções do portfólio:

```markdown
### Hero Section
[Imagem do hero com animações]

### Timeline de Experiência
[Imagem da seção de experiências profissionais]

### Responsividade Mobile
[Imagem da versão mobile]
```

**Como adicionar prints**:
1. Capture screenshots das diferentes seções
2. Coloque em `public/screenshots/`
3. Referencie com: `![Descrição](public/screenshots/nome.png)`

---

## ✅ Status do Projeto

| Status | Descrição |
|--------|-----------|
| **Desenvolvimento** | ✅ Arquitetura e componentes base implementados |
| **Produção** | ✅ Deploy ready (pode ser hospedado em Vercel, Netlify, etc) |
| **Manutenção** | 🔄 Em manutenção contínua para adicionar novas experiências |
| **Pronto** | ✅ Responsivo, otimizado e com boas práticas aplicadas |

**Última atualização**: Março de 2026

---

## 🤝 Contribuições & Contato

### Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Siga o padrão de código existente (Prettier + ESLint)
- Componentes devem ser reutilizáveis e bem tipados
- Escreva commits descritivos em português
- Teste responsividade em múltiplos breakpoints

### Entre em Contato

- 📧 **Email**: [theostracke11@gmail.com](mailto:theostracke11@gmail.com)
- 💼 **LinkedIn**: [linkedin.com/in/theostracke](https://linkedin.com/in/theostracke)
- 🐙 **GitHub**: [github.com/theostracke](https://github.com/theostracke)
- 📍 **Localização**: Palhoça, SC - Brasil

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Sinta-se livre para usar, modificar e distribuir. Veja [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- **Framer Motion** por proporcionar animações fluídas e intuitivas
- **Next.js & Vercel** por um framework incrível
- **Tailwind CSS** por revolucionar estilização web
- **Comunidade open-source** pelo suporte e bibliotecas

---

<div align="center">

**Feito com ❤️ por Theo Stracke**

Se este projeto foi útil, deixe uma ⭐ no repositório!

</div>
