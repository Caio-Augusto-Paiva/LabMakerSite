/* ==========================================================================
   CONTEÚDO DO SITE — edite aqui.
   Todos os textos marcados com "PROVISÓRIO" são redação de apoio, para serem
   substituídos pelo texto oficial de cada equipe.
   Imagens: coloque os arquivos em /public/areas e ajuste o caminho em `logo`.
   ========================================================================== */

export const SITE = {
  name: "LabMaker",
  year: 2026,
  tagline: "Impressão 3D feita por estudantes",
  // PROVISÓRIO
  description:
    "O LabMaker é um projeto universitário formado por estudantes, voltado à impressão 3D e à atuação extensionista junto à faculdade e à comunidade.",
  // PROVISÓRIO — preencher quando houver
  university: "", // ex.: "Universidade X" (só aparece no rodapé quando preenchido)
  socials: [], // ex.: [{ label: "Instagram", href: "https://..." }]
};

/**
 * effect = tipo de folha holográfica do card:
 * "rainbow" | "aurora" | "shards" | "stars" | "gold"
 */
export const areas = [
  {
    slug: "educacao",
    number: "01",
    name: "Educação em Foco Tecnológico",
    short: "Educação",
    navLabel: "Educação em Foco",
    titleLines: ["EDUCAÇÃO EM", "FOCO", "TECNOLÓGICO"],
    logo: "/areas/educacao.jpg",
    effect: "rainbow",
    tagline: "Tecnologia como ferramenta de aprendizado.",
    summary:
      "Leva a impressão 3D e a cultura maker para as escolas e para a comunidade acadêmica.",
    about: [
      "A equipe de Educação em Foco Tecnológico transforma a impressão 3D em ferramenta de ensino: oficinas, materiais didáticos e atividades que aproximam estudantes e professores da tecnologia.",
      "Texto complementar da equipe: história, objetivos e como participar das ações. (PROVISÓRIO)",
    ],
    focus: [
      "Oficinas e minicursos de modelagem e impressão 3D",
      "Materiais didáticos impressos para a sala de aula",
      "Ações de extensão em escolas parceiras",
    ],
  },
  {
    slug: "sustentabilidade",
    number: "02",
    name: "Sustentabilidade e Acessibilidade",
    short: "Sustentabilidade",
    navLabel: "Sustentabilidade e Acessib.",
    titleLines: ["SUSTENTABILIDADE", "E ACESSIBILIDADE"],
    logo: "/areas/sustentabilidade.jpg",
    effect: "aurora",
    tagline: "Menos impacto, mais acesso.",
    summary:
      "Soluções que reduzem o impacto ambiental e ampliam o acesso por meio da tecnologia assistiva.",
    about: [
      "A equipe de Sustentabilidade e Acessibilidade desenvolve soluções que reaproveitam material, reduzem desperdício e derrubam barreiras de acesso, com tecnologia assistiva produzida em impressão 3D.",
      "Texto complementar da equipe: história, objetivos e como participar das ações. (PROVISÓRIO)",
    ],
    focus: [
      "Reaproveitamento de material e filamento reciclado",
      "Tecnologia assistiva impressa em 3D",
      "Projetos que reduzem barreiras de acesso na faculdade",
    ],
  },
  {
    slug: "escritorio-3d",
    number: "03",
    name: "Escritório 3D",
    short: "Escritório 3D",
    navLabel: "Escritório 3D",
    titleLines: ["ESCRITÓRIO", "3D"],
    logo: "/areas/escritorio-3d.jpg",
    effect: "shards",
    tagline: "Do pedido à peça entregue.",
    summary:
      "O núcleo de produção do laboratório: recebe pedidos, modela, fatia, imprime e entrega peças.",
    about: [
      "O Escritório 3D é a linha de produção do LabMaker. Recebe pedidos da faculdade e dos outros projetos, transforma ideias em modelos 3D, imprime, acaba e entrega cada peça.",
      "Texto complementar da equipe: história, objetivos e como participar das ações. (PROVISÓRIO)",
    ],
    focus: [
      "Recebimento e triagem de pedidos de peças",
      "Modelagem, fatiamento e impressão",
      "Controle de qualidade e entrega",
    ],
  },
  {
    slug: "saude",
    number: "04",
    name: "Inovação em Saúde",
    short: "Saúde",
    navLabel: "Inovação em Saúde",
    titleLines: ["INOVAÇÃO", "EM SAÚDE"],
    logo: "/areas/saude.jpg",
    effect: "stars",
    tagline: "Impressão 3D a serviço do cuidado.",
    summary:
      "Modelos anatômicos, adaptações e protótipos que apoiam o ensino e o cuidado em saúde.",
    about: [
      "A equipe de Inovação em Saúde usa a impressão 3D para criar modelos anatômicos, adaptações sob medida e protótipos em parceria com os cursos e profissionais da área da saúde.",
      "Texto complementar da equipe: história, objetivos e como participar das ações. (PROVISÓRIO)",
    ],
    focus: [
      "Modelos anatômicos para estudo",
      "Órteses e adaptações sob medida",
      "Protótipos em parceria com os cursos da saúde",
    ],
  },
  {
    slug: "marketing",
    number: "05",
    name: "Marketing",
    short: "Marketing",
    navLabel: "Marketing",
    titleLines: ["MARKETING"],
    // LOGO PROVISÓRIA (SVG gerado). Trocar pela arte oficial quando existir.
    logo: "/areas/marketing.svg",
    effect: "gold",
    tagline: "A voz e a cara do LabMaker.",
    summary:
      "Identidade, redes e divulgação: a comunicação do LabMaker dentro e fora da faculdade.",
    about: [
      "A equipe de Marketing cuida da identidade visual, das redes sociais e da divulgação dos projetos, levando o trabalho do LabMaker para dentro e para fora da faculdade.",
      "Texto complementar da equipe: história, objetivos e como participar das ações. (PROVISÓRIO)",
    ],
    focus: [
      "Identidade visual e redes sociais",
      "Fotografia e vídeo dos projetos",
      "Divulgação do LabMaker na faculdade e fora dela",
    ],
  },
];

export function getArea(slug) {
  return areas.find((a) => a.slug === slug);
}

export function otherAreas(slug) {
  return areas.filter((a) => a.slug !== slug);
}
