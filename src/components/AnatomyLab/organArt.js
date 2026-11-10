import styles from './organArt.module.css';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const VE = 'non-scaling-stroke';

// Traço simples. o = opacidade do traço, dash = tracejado.
function L({ d, o, dash }) {
  return <path d={d} vectorEffect={VE} strokeOpacity={o} strokeDasharray={dash} />;
}

function Dot({ cx, cy }) {
  return <circle cx={cx} cy={cy} r="1" vectorEffect={VE} />;
}

// Lista de traços: string ou [d, opacidade, tracejado]
function list(arr) {
  return arr.map((a, i) =>
    Array.isArray(a) ? <L key={i} d={a[0]} o={a[1]} dash={a[2]} /> : <L key={i} d={a} />
  );
}

// Cruz de registro (canto superior esquerdo)
function Reg() {
  return <L d="M8 12h8M12 8v8" o={0.6} />;
}

function Art({ className, children }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pulmões                                                             */
/* ------------------------------------------------------------------ */

function Pulmoes({ className }) {
  return (
    <Art className={className}>
      {list([
        // traqueia
        'M56 12 L56 40',
        'M64 12 L64 40',
        // brônquios principais
        'M56 40 C54 46 48 50 42 54',
        'M64 40 C66 46 72 50 78 54',
        // pulmão direito do paciente (esquerda da imagem)
        'M44 50 C28 52 16 74 15 98 C15 108 22 112 33 110 C43 108 49 102 52 92 C54 78 54 62 44 50 Z',
        // pulmão esquerdo do paciente, com chanfradura cardíaca
        'M76 50 C92 52 104 74 105 98 C105 108 98 112 87 110 C77 108 71 104 68 96 C67 90 70 86 70 80 C70 72 66 62 76 50 Z',
        // ramificação interna
        'M42 54 C40 66 34 78 28 92',
        'M40 64 C46 72 48 82 48 94',
        'M36 76 L24 80',
        'M78 54 C80 66 86 78 92 92',
        'M80 64 C76 72 74 80 74 90',
        'M84 76 L96 80',
        // fissuras
        ['M18 76 C30 80 42 90 50 100', 0.5],
        ['M100 74 C90 86 80 98 74 108', 0.5],
        ['M20 90 C32 88 44 88 52 86', 0.5],
        // eixo
        ['M60 6 V114', 0.4, '2 3'],
      ])}
      <Reg />
      <Dot cx={98} cy={62} />
      <L d="M98 62 L108 50 H114" o={0.6} />
    </Art>
  );
}

/* ------------------------------------------------------------------ */
/* Traqueia                                                            */
/* ------------------------------------------------------------------ */

const RING_Y = [34, 41, 48, 55, 62, 69, 76, 83];

function Traqueia({ className }) {
  return (
    <Art className={className}>
      {list([
        // laringe
        'M48 12 C52 8 68 8 72 12 L70 26 C66 30 54 30 50 26 Z',
        ['M44 7 H76', 0.5],
        ['M60 10 V26', 0.4],
        // tubo
        'M52 28 L52 88',
        'M68 28 L68 88',
        // brônquios principais (carina)
        'M52 88 C50 98 40 102 30 106',
        'M60 93 C56 100 48 106 32 110',
        'M30 106 L32 110',
        'M68 88 C70 98 80 102 90 106',
        'M60 93 C64 100 72 106 88 110',
        'M90 106 L88 110',
        ['M60 84 V93', 0.5],
      ])}
      {RING_Y.map((y) => (
        <L key={y} d={`M52 ${y} C56 ${y + 3} 64 ${y + 3} 68 ${y}`} o={0.8} />
      ))}
      <Reg />
      <Dot cx={68} cy={59} />
      <L d="M68 59 L84 48 H108" o={0.6} />
      <L d="M60 4 V116" o={0.3} dash="2 3" />
    </Art>
  );
}

/* ------------------------------------------------------------------ */
/* Brônquios (árvore gerada)                                           */
/* ------------------------------------------------------------------ */

const TREE_LENS = [0, 20, 15, 11, 8, 6];

function buildBronchialTree() {
  const levels = TREE_LENS.map(() => []);
  const r = (n) => Math.round(n * 10) / 10;
  function rec(x, y, a, depth) {
    if (depth >= TREE_LENS.length) return;
    const len = TREE_LENS[depth];
    const rad = (a * Math.PI) / 180;
    const x2 = x + Math.sin(rad) * len;
    const y2 = y + Math.cos(rad) * len;
    levels[depth].push(`M${r(x)} ${r(y)} L${r(x2)} ${r(y2)}`);
    rec(x2, y2, a + 25, depth + 1);
    rec(x2, y2, a - 35, depth + 1);
  }
  // dois brônquios principais a partir da carina (60, 32)
  rec(60, 32, 35, 1);
  rec(60, 32, -35, 1);
  return levels.slice(1).map((l) => l.join(' '));
}

const TREE_PATHS = buildBronchialTree();

function Bronquios({ className }) {
  return (
    <Art className={className}>
      <L d="M57 8 L57 32" />
      <L d="M63 8 L63 32" />
      {TREE_PATHS.map((d, i) => (
        <L key={i} d={d} o={Math.max(0.45, 1 - i * 0.14)} />
      ))}
      <Reg />
      <Dot cx={60} cy={32} />
      <L d="M60 32 L48 24 H30" o={0.6} />
      <L d="M60 4 V32" o={0.3} dash="2 3" />
    </Art>
  );
}

/* ------------------------------------------------------------------ */
/* Cérebro                                                             */
/* ------------------------------------------------------------------ */

function Cerebro({ className }) {
  return (
    <Art className={className}>
      {list([
        // cérebro (vista lateral)
        'M22 62 C16 40 32 20 58 18 C84 14 104 28 106 52 C107 64 100 72 90 74 C84 76 80 72 76 74 L50 76 C36 78 26 72 22 62 Z',
        // sulco lateral e sulco central
        'M44 62 C56 56 70 54 84 58',
        'M62 20 C60 32 66 42 60 54',
        // giros
        ['M30 40 C38 34 44 40 52 34 C58 30 62 34 66 30', 0.7],
        ['M26 52 C34 46 40 52 48 46 C52 43 56 46 58 44', 0.7],
        ['M68 24 C76 30 72 38 80 40 C88 42 90 36 98 38', 0.7],
        ['M72 46 C80 44 84 50 92 48 C98 46 100 52 102 56', 0.7],
        ['M36 64 C40 59 44 62 48 57', 0.7],
        ['M88 62 C92 58 96 62 100 60', 0.7],
        ['M64 66 C70 62 76 66 82 63', 0.7],
        // cerebelo
        'M76 76 C78 90 94 96 104 86 C108 82 106 76 100 74',
        ['M80 82 C88 86 98 84 105 80', 0.6],
        ['M82 88 C90 91 98 89 103 86', 0.6],
        // tronco encefálico
        'M56 76 C58 90 62 100 64 110',
        'M70 78 C70 90 70 100 72 110',
        ['M10 64 H112', 0.35, '2 3'],
      ])}
      <Reg />
      <Dot cx={40} cy={30} />
      <L d="M40 30 L30 14 H18" o={0.6} />
    </Art>
  );
}

/* ------------------------------------------------------------------ */
/* Medula                                                              */
/* ------------------------------------------------------------------ */

const VERT = [0, 1, 2, 3, 4, 5].map((i) => 10 + i * 16);

function Medula({ className }) {
  return (
    <Art className={className}>
      {VERT.map((y) => (
        <L
          key={y}
          d={`M48 ${y + 2} Q48 ${y} 50 ${y} H70 Q72 ${y} 72 ${y + 2} V${y + 11} Q72 ${y + 13} 70 ${y + 13} H50 Q48 ${y + 13} 48 ${y + 11} Z M48 ${y + 4} L36 ${y + 3} M72 ${y + 4} L84 ${y + 3}`}
        />
      ))}
      {/* medula (cordão central) */}
      <L d="M56 8 L56 106" />
      <L d="M64 8 L64 106" />
      <L d="M56 106 C58 112 62 112 64 106" />
      <L d="M60 110 V114" o={0.6} />
      {/* raízes nervosas em pares */}
      {[0, 1, 2, 3, 4].map((i) => {
        const g = VERT[i] + 14.5;
        return (
          <L
            key={i}
            d={`M56 ${g} C48 ${g + 2} 40 ${g + 4} 28 ${g + 10} M64 ${g} C72 ${g + 2} 80 ${g + 4} 92 ${g + 10}`}
            o={0.8}
          />
        );
      })}
      <Reg />
      <Dot cx={92} cy={24} />
      <L d="M92 24 L104 16 H114" o={0.6} />
      <L d="M60 6 V114" o={0.3} dash="2 3" />
    </Art>
  );
}

/* ------------------------------------------------------------------ */
/* Nervo ciático                                                       */
/* ------------------------------------------------------------------ */

function NervoCiatico({ className }) {
  return (
    <Art className={className}>
      {list([
        // sacro
        'M44 10 L76 10 L70 34 L60 42 L50 34 Z',
        ['M52 18 H68', 0.5],
        // raízes do plexo lombossacral
        'M30 12 C32 30 50 40 60 50',
        'M46 24 C48 36 56 44 60 50',
        'M74 24 C72 36 64 44 60 50',
        'M90 12 C88 30 70 40 60 50',
        // nervo ciático
        'M57 50 C56 64 58 76 56 88',
        'M63 50 C64 64 62 76 64 88',
        // divisão: tibial e fibular comum
        'M56 88 C54 98 56 104 56 112',
        'M60 90 C59 98 60 104 60 112',
        'M64 88 C70 92 76 98 80 108',
        // ramos colaterais
        ['M58 66 C52 68 48 70 44 76', 0.6],
        ['M62 72 C68 74 72 76 76 82', 0.6],
        // contorno da perna (referência)
        ['M30 40 C28 70 34 90 40 104 L40 114', 0.3],
        ['M90 40 C92 70 86 90 80 104 L80 114', 0.3],
        ['M60 4 V8', 0.3],
      ])}
      <Reg />
      <Dot cx={76} cy={82} />
      <L d="M76 82 L96 70 H112" o={0.6} />
      <L d="M60 52 V118" o={0.3} dash="2 3" />
    </Art>
  );
}

/* ------------------------------------------------------------------ */
/* Coração                                                             */
/* ------------------------------------------------------------------ */

function Coracao({ className }) {
  return (
    <Art className={className}>
      {list([
        // ventrículos
        'M46 52 C42 74 52 96 66 108 C84 98 100 80 98 60 C97 50 90 44 84 44',
        // sulco interventricular (descendente anterior)
        ['M56 50 C58 72 62 92 66 108', 0.5],
        // átrio direito e aurícula
        'M46 52 C38 50 36 40 42 34 C48 28 56 30 58 38',
        // aorta (arco)
        'M60 42 C58 28 60 18 70 14 C80 12 88 18 86 28 L86 36',
        'M70 42 C70 32 72 26 76 24 C80 22 82 26 82 30',
        // tronco pulmonar
        'M70 44 C72 36 80 32 96 30',
        'M82 44 C84 40 90 38 98 38',
        'M96 30 C99 32 99 36 98 38',
        // veia cava superior
        'M50 31 L50 12',
        'M58 36 L58 12',
        // sulco atrioventricular
        ['M46 52 C60 56 76 52 90 46', 0.5],
        // coronárias
        ['M48 42 C44 52 46 62 54 68 C60 70 62 72 64 76', 0.6],
        ['M86 46 C92 54 94 62 92 72', 0.6],
        ['M70 66 C76 68 80 74 82 80', 0.5],
        ['M62 82 C68 84 72 88 74 92', 0.5],
        // eixo do coração
        ['M44 22 L78 114', 0.35, '2 3'],
      ])}
      <Reg />
      <Dot cx={66} cy={108} />
      <L d="M66 108 L78 112 H110" o={0.6} />
    </Art>
  );
}

/* ------------------------------------------------------------------ */
/* Aorta                                                               */
/* ------------------------------------------------------------------ */

function Aorta({ className }) {
  return (
    <Art className={className}>
      {list([
        // aorta ascendente
        'M54 92 L54 56',
        'M64 92 L64 62',
        // arco e aorta descendente
        'M54 56 C54 40 66 32 78 34 C92 36 98 46 98 60 L98 112',
        'M64 62 C64 52 70 46 78 46 C86 46 88 52 88 62 L88 112',
        // tronco braquiocefálico e ramos
        'M62 37 L60 26',
        'M60 26 C52 24 44 24 34 28',
        'M60 26 L58 12',
        // carótida comum esquerda
        'M74 35 C74 26 74 18 74 12',
        // subclávia esquerda
        'M87 38 C90 30 98 26 108 28',
        // coração (referência)
        ['M40 98 C38 108 46 114 54 114 C64 112 72 104 70 96 C69 92 64 90 64 92 M54 92 C46 92 41 94 40 98', 0.5],
        ['M93 40 V112', 0.3, '2 3'],
      ])}
      <Reg />
      <Dot cx={98} cy={78} />
      <L d="M98 78 H112" o={0.6} />
    </Art>
  );
}

/* ------------------------------------------------------------------ */
/* Veia cava                                                           */
/* ------------------------------------------------------------------ */

function VeiaCava({ className }) {
  return (
    <Art className={className}>
      {list([
        // veia cava superior
        'M50 43 L50 14',
        'M60 44 L60 14',
        // veias braquiocefálicas (Y)
        'M50 14 C46 10 40 10 32 14 L26 24',
        'M60 14 C68 8 80 10 90 16 L96 28',
        // átrio direito
        'M50 43 C42 46 38 56 41 64 C44 72 52 76 60 74 C66 72 68 64 66 56 C65 50 62 46 60 44',
        // contorno dos ventrículos (referência)
        ['M66 54 C76 54 82 64 78 76 C74 86 68 92 64 94 C62 88 60 80 60 74', 0.4],
        // veia cava inferior
        'M46 73 L46 90',
        'M56 75 L56 90',
        ['M46 90 L56 90', 0.4, '1.5 2'],
        // tributárias (renais)
        ['M46 80 L34 78', 0.7],
        ['M56 82 L68 80', 0.7],
        // veias ilíacas comuns (Y)
        'M46 90 C42 96 36 102 34 112',
        'M56 90 C60 96 68 102 72 112',
        ['M60 4 V8', 0.3],
      ])}
      <Reg />
      <Dot cx={90} cy={60} />
      <L d="M90 60 L102 50 H114" o={0.6} />
    </Art>
  );
}

/* ------------------------------------------------------------------ */

export const ORGAN_ART = {
  pulmoes: Pulmoes,
  traqueia: Traqueia,
  bronquios: Bronquios,
  cerebro: Cerebro,
  medula: Medula,
  'nervo-ciatico': NervoCiatico,
  coracao: Coracao,
  aorta: Aorta,
  'veia-cava': VeiaCava,
};

/* ------------------------------------------------------------------ */
/* Corpo humano esquemático                                            */
/* ------------------------------------------------------------------ */

export const BODY_VIEWBOX = { w: 320, h: 640 };

// Traço de sistema: pathLength=1 para animar o desenho
function B({ d }) {
  return <path d={d} pathLength="1" vectorEffect={VE} />;
}

function bodyList(arr) {
  return arr.map((d, i) => <B key={i} d={d} />);
}

const SILHOUETTE = [
  // metade esquerda (pescoço, tronco, perna)
  'M148 92 L148 116 C132 120 112 124 102 134 C100 170 106 210 110 250 C112 280 106 296 104 316 C102 400 108 470 114 560 L116 600 C122 606 140 608 148 606 L148 570 C150 480 154 400 160 338',
  // metade direita
  'M172 92 L172 116 C188 120 208 124 218 134 C220 170 214 210 210 250 C208 280 214 296 216 316 C218 400 212 470 206 560 L204 600 C198 606 180 608 172 606 L172 570 C170 480 166 400 160 338',
  // braço esquerdo (do paciente: lado direito da imagem fica abaixo)
  'M100 136 C88 142 84 160 82 180 L74 270 L68 336 C66 352 68 368 76 372 C82 372 84 362 84 352 L90 280 L100 210 C102 190 104 170 106 156',
  'M220 136 C232 142 236 160 238 180 L246 270 L252 336 C254 352 252 368 244 372 C238 372 236 362 236 352 L230 280 L220 210 C218 190 216 170 214 156',
];

const RESP = [
  // laringe
  'M152 104 L168 104 L166 114 L154 114 Z',
  // traqueia
  'M157 114 L157 190',
  'M163 114 L163 190',
  // brônquios
  'M157 190 C150 196 140 202 130 210',
  'M163 190 C170 196 180 202 190 210',
  // pulmão direito do paciente (esquerda da imagem)
  'M150 160 C130 150 114 170 112 210 C110 250 112 272 124 274 C140 276 152 270 154 258 C156 230 156 190 150 160 Z',
  // pulmão esquerdo do paciente (direita da imagem), com chanfradura cardíaca
  'M170 160 C190 150 206 170 208 210 C210 250 208 272 196 274 C182 276 172 272 170 262 C170 250 176 244 174 236 C168 226 168 190 170 160 Z',
  // fissuras
  'M118 206 C130 214 142 226 152 240',
  'M202 214 C194 232 184 248 176 266',
  // ramificação interna
  'M130 210 C126 224 122 236 118 250',
  'M130 210 C138 224 142 236 144 252',
  'M190 210 C194 224 198 236 200 250',
];

const NERV = [
  // encéfalo
  'M138 56 C136 40 146 30 162 30 C176 30 184 40 183 54 C182 62 176 66 170 66 L146 66 C140 64 138 60 138 56 Z',
  'M146 42 C152 38 156 44 162 40 C168 36 172 40 176 38',
  'M144 52 C150 48 156 54 162 48 C168 44 174 50 180 46',
  // cerebelo
  'M164 68 C166 76 176 78 182 72',
  // tronco encefálico
  'M156 66 C156 76 158 84 160 92',
  // medula espinal
  'M160 94 L160 300',
  // vértebras (marcas)
  'M155 120 H165 M155 132 H165 M155 144 H165 M155 156 H165 M155 168 H165 M155 180 H165 M155 192 H165 M155 204 H165 M155 216 H165 M155 228 H165 M155 240 H165 M155 252 H165 M155 264 H165 M155 276 H165 M155 288 H165',
  // plexo braquial
  'M160 124 C146 124 124 130 106 150 C98 180 90 250 80 330',
  'M140 128 C130 140 118 156 112 176',
  'M160 124 C174 124 196 130 214 150 C222 180 230 250 240 330',
  'M180 128 C190 140 202 156 208 176',
  // nervos ciáticos
  'M160 300 C148 308 138 316 134 332 C131 380 131 430 132 470',
  'M132 470 C130 510 126 550 124 596',
  'M132 470 C138 500 144 540 146 588',
  'M160 300 C172 308 182 316 186 332 C189 380 189 430 188 470',
  'M188 470 C190 510 194 550 196 596',
  'M188 470 C182 500 176 540 174 588',
];

const CIRC = [
  // coração
  'M160 205 C170 198 186 202 190 216 C194 232 186 250 174 262 C166 252 156 236 156 222 Z',
  'M166 212 C168 230 170 246 174 262',
  // aorta: arco e descendente
  'M168 206 C166 176 172 158 182 160 C192 162 190 180 186 200 C184 230 172 250 168 270 L166 310',
  // ramos do arco
  'M166 142 C156 130 152 112 150 98',
  'M180 160 C176 140 172 118 170 98',
  'M172 162 C170 150 166 142 158 134 C140 134 120 138 106 152 C98 190 92 250 88 320',
  'M184 162 C192 148 204 142 216 152 C222 190 228 250 232 320',
  // veia cava superior e braquiocefálicas
  'M158 214 C150 190 150 160 150 134',
  'M150 134 C140 132 122 138 108 154',
  'M150 134 C170 130 196 140 212 154',
  // veia cava inferior
  'M160 252 C158 280 156 300 156 312',
  // ilíacas / femorais (artérias)
  'M166 310 C156 322 148 340 146 380 L142 560 L140 596',
  'M166 310 C170 324 172 340 174 380 L178 560 L180 596',
  // ilíacas / femorais (veias)
  'M156 312 C148 330 140 350 138 380 L136 560',
  'M156 312 C164 332 176 350 182 380 L184 560',
];

export function BodyBlueprint({ className, drawn }) {
  const cls = [styles.body, drawn ? styles.drawn : '', className || '']
    .filter(Boolean)
    .join(' ');
  const mono = 'var(--font-mono), monospace';

  return (
    <svg
      viewBox={`0 0 ${BODY_VIEWBOX.w} ${BODY_VIEWBOX.h}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cls}
    >
      {/* silhueta */}
      <g data-part="silhouette">
        <ellipse cx="160" cy="58" rx="27" ry="35" pathLength="1" vectorEffect={VE} />
        {bodyList(SILHOUETTE)}
      </g>

      <g data-system="respiratorio">{bodyList(RESP)}</g>
      <g data-system="nervoso">{bodyList(NERV)}</g>
      <g data-system="circulatorio">{bodyList(CIRC)}</g>

      {/* cotas e marcas de planta técnica */}
      <g data-part="cotas">
        {/* linha de centro */}
        <path d="M160 8 V632" vectorEffect={VE} strokeDasharray="10 4 2 4" strokeOpacity="0.35" />
        {/* cota vertical esquerda (altura total) */}
        <path
          d="M36 20 V300 M36 340 V620 M28 20 H44 M28 620 H44 M36 20 L33 28 M36 20 L39 28 M36 620 L33 612 M36 620 L39 612"
          vectorEffect={VE}
        />
        {/* cota vertical direita (tronco) */}
        <path
          d="M284 126 V210 M284 246 V330 M276 126 H292 M276 330 H292 M284 126 L281 134 M284 126 L287 134 M284 330 L281 322 M284 330 L287 322"
          vectorEffect={VE}
        />
        {/* linhas de chamada da cota do tronco */}
        <path d="M246 126 H276 M252 330 H276" vectorEffect={VE} strokeOpacity="0.4" strokeDasharray="2 3" />
        {/* marcas de registro */}
        <path
          d="M8 14 H22 M15 7 V21 M298 14 H312 M305 7 V21 M8 626 H22 M15 619 V633 M298 626 H312 M305 619 V633"
          vectorEffect={VE}
        />
        <text
          x="36"
          y="320"
          transform="rotate(-90 36 320)"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={mono}
          fontSize="9"
          fill="currentColor"
          stroke="none"
        >
          180 cm
        </text>
        <text
          x="284"
          y="228"
          transform="rotate(-90 284 228)"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily={mono}
          fontSize="9"
          fill="currentColor"
          stroke="none"
        >
          62 cm
        </text>
        <text x="166" y="18" fontFamily={mono} fontSize="9" fill="currentColor" stroke="none">
          A–A
        </text>
        <text x="166" y="630" fontFamily={mono} fontSize="9" fill="currentColor" stroke="none">
          A–A
        </text>
      </g>
    </svg>
  );
}
