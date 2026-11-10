/* ==========================================================================
   PROBLEMAS DO MUNDO — usados no globo da página "Sustentabilidade e Acessibilidade".

   IMPORTANTE: os números abaixo vêm de relatórios públicos conhecidos (fonte em cada item),
   mas devem ser CONFERIDOS e atualizados pela equipe antes da publicação.
   Os pontos no globo são ILUSTRATIVOS (não indicam que o dado vale só para aquela cidade);
   o campo `scope` diz o alcance real do número.

   theme: "acessibilidade" | "sustentabilidade"
   ========================================================================== */

export const THEMES = {
  // color = cor forte (pino, borda, ícone); textColor = tom claro para TEXTO sobre azul (contraste ≥ 4,5:1)
  acessibilidade: { label: "Acessibilidade", color: "#ff7a45", textColor: "#ffb08f" },
  sustentabilidade: { label: "Sustentabilidade", color: "#5fe3b4", textColor: "#9cf0d3" },
};

export const problems = [
  {
    id: "deficiencia-mundo",
    theme: "acessibilidade",
    scope: "Mundo",
    value: "1,3 bi",
    label: "de pessoas vivem com alguma deficiência significativa",
    text: "É cerca de 1 em cada 6 pessoas no planeta. Barreiras físicas, digitais e de atendimento ampliam a desigualdade em saúde, educação e trabalho.",
    source: "OMS, 2022",
    place: "Genebra, Suíça",
    lat: 46.2,
    lon: 6.14,
    labmaker: "Adaptações sob medida podem ser impressas em 3D a baixo custo.", // PROVISÓRIO
  },
  {
    id: "tecnologia-assistiva",
    theme: "acessibilidade",
    scope: "Mundo",
    value: "2,5 bi",
    label: "de pessoas precisam de ao menos um produto assistivo",
    text: "Cadeiras de rodas, próteses, aparelhos auditivos, óculos e adaptações. Cerca de 1 bilhão de pessoas não têm acesso a eles, principalmente em países de baixa e média renda.",
    source: "OMS e UNICEF, 2022",
    place: "Nairóbi, Quênia",
    lat: -1.29,
    lon: 36.82,
    labmaker: "Tecnologia assistiva local reduz custo e tempo de espera.", // PROVISÓRIO
  },
  {
    id: "deficiencia-brasil",
    theme: "acessibilidade",
    scope: "Brasil",
    value: "18,6 mi",
    label: "de brasileiros têm alguma deficiência",
    text: "São 8,9% da população com 2 anos ou mais, segundo a PNAD Contínua. Acessibilidade é rotina de milhões de pessoas, não exceção.",
    source: "IBGE, PNAD Contínua 2022",
    place: "Rio de Janeiro, Brasil",
    lat: -22.91,
    lon: -43.17,
    labmaker: "Projetos dentro da faculdade começam pela realidade de quem estuda aqui.", // PROVISÓRIO
  },
  {
    id: "web-acessivel",
    theme: "acessibilidade",
    scope: "Mundo (web)",
    value: "96%",
    label: "das páginas iniciais têm falhas de acessibilidade",
    text: "A análise de 1 milhão de sites encontrou falhas detectáveis em quase todas as páginas iniciais, como imagens sem texto alternativo e baixo contraste. Isso exclui quem usa leitor de tela e outras tecnologias de apoio.",
    source: "WebAIM Million, 2024",
    place: "Nova York, EUA",
    lat: 40.71,
    lon: -74.01,
    labmaker: "Este site também foi pensado para ser acessível.", // PROVISÓRIO
  },
  {
    id: "plastico-oceanos",
    theme: "sustentabilidade",
    scope: "Mundo",
    value: "11 mi t",
    label: "de plástico chegam aos oceanos por ano",
    text: "Sem mudanças, o volume pode quase triplicar até 2040. O plástico se fragmenta em microplásticos e entra na cadeia alimentar.",
    source: "Pew e SYSTEMIQ, 2020 (citado pelo UNEP)",
    place: "Oceano Pacífico",
    lat: 12,
    lon: -150,
    labmaker: "Filamento reciclado e peças feitas para durar reduzem o descarte.", // PROVISÓRIO
  },
  {
    id: "reciclagem-plastico",
    theme: "sustentabilidade",
    scope: "Mundo",
    value: "9%",
    label: "do lixo plástico gerado no mundo em 2019 foi reciclado",
    text: "Cerca de 50% foi para aterros, 19% foi incinerado e 22% foi mal gerido (lixões e descarte no ambiente). Reaproveitar material e projetar para reparo importa.",
    source: "OCDE, 2022 (dados de 2019)",
    place: "Tóquio, Japão",
    lat: 35.68,
    lon: 139.69,
    labmaker: "Testar reaproveitamento de material faz parte da rotina do laboratório.", // PROVISÓRIO
  },
  {
    id: "lixo-eletronico",
    theme: "sustentabilidade",
    scope: "Mundo",
    value: "62 mi t",
    label: "de lixo eletrônico gerado em 2022",
    text: "Apenas 22,3% foram coletados e reciclados de forma formal. O resto vira passivo ambiental e perda de metais valiosos.",
    source: "Global E-waste Monitor 2024 (ITU e UNITAR)",
    place: "Acra, Gana",
    lat: 5.6,
    lon: -0.19,
    labmaker: "Consertar e reimprimir peças prolonga a vida útil de equipamentos.", // PROVISÓRIO
  },
  {
    id: "agua-potavel",
    theme: "sustentabilidade",
    scope: "Mundo",
    value: "2,2 bi",
    label: "de pessoas ainda não têm água potável gerenciada com segurança",
    text: "Em 2022, esse era o retrato de um serviço básico que afeta saúde, estudo e trabalho. Preservar recursos e reduzir a poluição das fontes é parte da resposta.",
    source: "OMS e UNICEF (JMP), 2023",
    place: "Nova Délhi, Índia",
    lat: 28.61,
    lon: 77.21,
    labmaker: "Soluções simples e baratas podem ser prototipadas e testadas localmente.", // PROVISÓRIO
  },
];
