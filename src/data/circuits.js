/* ==========================================================================
   LABORATÓRIO DE CIRCUITOS (página Educação em Foco Tecnológico).
   Jogo: separar os componentes elétricos nas três classes de um circuito.
   Tema: o minicurso de circuitos elétricos da equipe.

   PROVISÓRIO: as curiosidades são texto de apoio, em linguagem simples.
   Peça para a equipe revisar antes de publicar.
   ========================================================================== */

/** tone = cor das linhas da classe sobre o fundo azul blueprint (tons claros; usados também em texto pequeno) */
export const CIRCUIT_CLASSES = [
  {
    id: "fontes",
    name: "Fontes de energia",
    short: "Fontes",
    role: "Fornecem a energia que faz a corrente elétrica circular.",
    tone: "#ffe08a",
  },
  {
    id: "cargas",
    name: "Cargas",
    short: "Cargas",
    role: "Consomem a energia elétrica e a transformam em luz, calor ou movimento.",
    tone: "#8fe3ff",
  },
  {
    id: "controle",
    name: "Controle e proteção",
    short: "Controle",
    role: "Abrem, fecham ou protegem o circuito.",
    tone: "#b6f2c8",
  },
];

/** id do componente = chave usada pela arte em src/components/CircuitLab/circuitArt.js */
export const CIRCUIT_ITEMS = [
  {
    id: "pilha",
    name: "Pilha",
    group: "fontes",
    fact: "Converte energia química em energia elétrica e fornece tensão contínua (1,5 V numa pilha comum).",
  },
  {
    id: "bateria",
    name: "Bateria",
    group: "fontes",
    fact: "Conjunto de pilhas ligadas entre si para fornecer mais tensão ou mais carga.",
  },
  {
    id: "painel-solar",
    name: "Painel solar",
    group: "fontes",
    fact: "Converte a luz do Sol em energia elétrica por meio de células fotovoltaicas.",
  },
  {
    id: "lampada",
    name: "Lâmpada",
    group: "cargas",
    fact: "Transforma energia elétrica em luz e calor quando a corrente passa por ela (a lâmpada incandescente esquenta bastante).",
  },
  {
    id: "resistor",
    name: "Resistor",
    group: "cargas",
    fact: "Transforma energia elétrica em calor (efeito Joule) e, com isso, limita a corrente do circuito. Seu valor é medido em ohms (Ω).",
  },
  {
    id: "motor",
    name: "Motor",
    group: "cargas",
    fact: "Transforma energia elétrica em movimento (energia mecânica).",
  },
  {
    id: "interruptor",
    name: "Interruptor",
    group: "controle",
    fact: "Abre ou fecha o circuito: fechado, a corrente passa; aberto, ela para.",
  },
  {
    id: "botao",
    name: "Botão de pressão",
    group: "controle",
    fact: "Fecha o circuito só enquanto está apertado e abre de novo quando é solto.",
  },
  {
    id: "fusivel",
    name: "Fusível",
    group: "controle",
    fact: "Protege o circuito: se a corrente passar do limite, o filamento derrete e abre o circuito.",
  },
];

/** Textos do jogo (o motor SortLab é genérico) */
export const CIRCUIT_COPY = {
  intro: "Separe os componentes nas três classes do circuito. Arraste, ou selecione um cartão e escolha a classe.",
  unit: "componentes",
  reportTag: "LAB-CIRCUITOS",
  scaleTag: "ESQUEMA ELÉTRICO · 4,5 V",
  stampTitle: "CIRCUITO FECHADO",
  bannerText: "Circuito completo",
  emptyTray: "Bandeja vazia · circuito completo",
  victoryShape: "landscape", // o esquema do circuito é mais largo que alto
};
