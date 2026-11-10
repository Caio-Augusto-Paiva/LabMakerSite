/* ==========================================================================
   LABORATÓRIO DE ANATOMIA (página Inovação em Saúde).
   Jogo: separar os órgãos pelos sistemas do corpo humano.

   PROVISÓRIO: as curiosidades são texto de apoio, em linguagem simples e conferido
   apenas de forma geral. Peça para a equipe de Saúde revisar antes de publicar.
   ========================================================================== */

/** tone = cor das linhas do sistema sobre o fundo azul blueprint (tons claros; também usados em texto pequeno, por isso ≥ 4,5:1) */
export const SYSTEMS = [
  {
    id: "respiratorio",
    name: "Sistema respiratório",
    short: "Respiratório",
    role: "Leva o ar até o sangue: entrada de oxigênio e saída de gás carbônico.",
    tone: "#8fe3ff",
  },
  {
    id: "nervoso",
    name: "Sistema nervoso",
    short: "Nervoso",
    role: "Recebe informações e comanda o corpo com sinais elétricos.",
    tone: "#ffe08a",
  },
  {
    id: "circulatorio",
    name: "Sistema circulatório",
    short: "Circulatório",
    role: "Transporta o sangue, com oxigênio e nutrientes, por todo o corpo.",
    tone: "#ffc4c9",
  },
];

/** id do órgão = chave usada pela arte em src/components/AnatomyLab/organArt.js */
export const ORGANS = [
  {
    id: "pulmoes",
    name: "Pulmões",
    plural: true,
    system: "respiratorio",
    fact: "Fazem as trocas gasosas: o oxigênio entra no sangue e o gás carbônico sai, nos alvéolos.",
  },
  {
    id: "traqueia",
    name: "Traqueia",
    system: "respiratorio",
    fact: "Tubo reforçado por anéis de cartilagem que leva o ar da laringe até os brônquios.",
  },
  {
    id: "bronquios",
    name: "Brônquios",
    plural: true,
    system: "respiratorio",
    fact: "Ramificações da traqueia que distribuem o ar para cada pulmão.",
  },
  {
    id: "cerebro",
    name: "Cérebro",
    system: "nervoso",
    fact: "Centro de comando do corpo: processa informações e coordena pensamento, memória e movimento.",
  },
  {
    id: "medula",
    name: "Medula espinhal",
    system: "nervoso",
    fact: "Cordão de tecido nervoso protegido pela coluna vertebral, que leva sinais entre o cérebro e o resto do corpo.",
  },
  {
    id: "nervo-ciatico",
    name: "Nervo ciático",
    system: "nervoso",
    fact: "O nervo mais longo e calibroso do corpo: desce da região lombar pela parte de trás da coxa até a perna, levando sinais.",
  },
  {
    id: "coracao",
    name: "Coração",
    system: "circulatorio",
    fact: "Bomba muscular que impulsiona o sangue por todo o corpo a cada batimento.",
  },
  {
    id: "aorta",
    name: "Aorta",
    system: "circulatorio",
    fact: "A maior artéria do corpo: leva o sangue rico em oxigênio do coração para os tecidos.",
  },
  {
    id: "veia-cava",
    name: "Veias cavas",
    plural: true,
    system: "circulatorio",
    fact: "Grandes veias que levam o sangue pobre em oxigênio do corpo de volta ao átrio direito do coração.",
  },
];
