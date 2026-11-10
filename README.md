# LabMaker — site expositivo

Landing page + uma página para cada área do laboratório. Somente exposição (sem cadastro/login).

**Stack:** Next.js 16 (App Router) · React 19 · JavaScript · HTML/CSS (CSS Modules). Sem bibliotecas extras.

## Rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm start
```

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Landing: hero, o projeto, as 5 áreas (cards holográficos), destaques |
| `/areas/educacao` | Educação em Foco Tecnológico |
| `/areas/sustentabilidade` | Sustentabilidade e Acessibilidade |
| `/areas/escritorio-3d` | Escritório 3D (inclui a **esteira de produção 3D**) |
| `/areas/saude` | Inovação em Saúde |
| `/areas/marketing` | Marketing |

## Onde editar

- **Textos das áreas, nomes, resumos, efeito holográfico de cada card:** `src/data/areas.js`
  (textos marcados `PROVISÓRIO` são de apoio e devem ser trocados pelos oficiais).
- **Redes sociais e nome da universidade (rodapé):** `SITE` em `src/data/areas.js`.
- **Logos das áreas:** `public/areas/` (os originais continuam em `public/assets/`).
  - `marketing.svg` é uma **logo provisória** gerada para o site — substitua pela arte oficial.
  - `sustentabilidade.jpg` e `saude.jpg` têm só 150×150 px e ficam levemente suavizadas nos cards; use versões de 640 px ou mais.
- **Projetos (pastas de vidro):** cadastre em `projects` dentro da área em `src/data/areas.js` (formato e exemplo em `src/data/projects.js`).
  Cada projeto tem `files` com `src` (imagem em `public/`), `alt` e `label`; sem `src` aparece o espaço hachurado reservado.
- **Equipe (crachás, sem fotos):** cadastre em `team` dentro da área em `src/data/areas.js` (formato em `src/data/team.js`). Sem `team`, aparecem 6 crachás de exemplo.
- **Globo de problemas (página Sustentabilidade e Acessibilidade):** `src/data/problems.js`. Os números têm fonte, mas **confira e atualize antes de publicar**; os pontos no globo são ilustrativos.
- **Outros espaços de imagem** (hero das áreas, galeria de trabalhos, landing): componente `src/components/Placeholder.js`.
  Para colocar uma imagem real, troque `<Placeholder label="…" ratio="…" />` por
  `<Image src="/areas/arquivo.jpg" alt="…" width={…} height={…} />` (`next/image`).

## Efeitos

- **Card holográfico** (`src/components/HoloCard.js`): inclina com o ponteiro, levanta no hover e vira no clique; o verso mostra o resumo e o botão "Acessar página" (só navega quando a pessoa clica nele). "Voltar", Esc ou clicar fora desvira.
  Efeitos de folha: `rainbow`, `aurora`, `shards`, `stars`, `gold`. Respeita `prefers-reduced-motion`.
- **Pastas de vidro** (`src/components/ProjectFolders.js`): montam ao rolar, inclinam ao ponteiro, abrem em leque e ampliam a imagem num visualizador.
- **Crachás em trilho** (`src/components/TeamLanyard/`): balançam com física de mola, arrastam pelo trilho e viram para mostrar a bio. Sem fotos.
- **Globo** (`src/components/ProblemGlobe/`): globo de pontos em canvas (sem WebGL), gira sozinho, arrasta com inércia em qualquer direção (horizontal e vertical, com o mouse; no toque só horizontal para não travar a rolagem da página) e mostra o cartão de cada problema.
- **Esteira 3D** (`src/components/PrintFactory/`): CSS 3D puro — 5 estações (modelagem → fatiamento → impressão → pós-processamento → entrega),
  5 câmeras, pausar/retomar, detalhe por estação.

> Os efeitos foram recriados do zero a partir das descrições públicas do 21st.dev
> (o código-fonte de lá exige login), então não são cópias dos componentes originais.
