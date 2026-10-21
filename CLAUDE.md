# CLAUDE.md

**Antes de qualquer tarefa neste repositório, leia `persona.md` por completo e siga o PROMPT DE INICIALIZAÇÃO da seção 0.**

Resumo do contrato:
- Código no mais alto nível profissional; prioridade: impacto visual (nível Awwwards) → performance → acessibilidade → manutenção.
- Efeitos 3D/shaders/scroll-storytelling com intenção, sempre com cleanup, fallback e `prefers-reduced-motion`.
- Bibliotecas sempre na versão estável mais recente: confirme com `npm view <pkg> version` e pesquise breaking changes antes de usar. Nunca confie em versões de memória.
- Ao descobrir versões/libs/técnicas novas, atualize a seção 6 (Radar Tecnológico) de `persona.md` com a data.
- Comentários e commits em PT-BR; strings visíveis nos 3 dicionários (`pt`, `en`, `es`).
- Validar com `npm run lint` e `npm run build` antes de declarar pronto.
