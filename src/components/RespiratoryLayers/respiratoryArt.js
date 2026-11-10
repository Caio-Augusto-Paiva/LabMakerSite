// Ilustrações hairline das 4 camadas do sistema respiratório.
// Todas usam o mesmo viewBox (0 0 320 400), vista frontal, centradas em x=160,
// para que, sobrepostas, formem o sistema completo.

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke',
};

const f = (n) => Math.round(n * 10) / 10;
const MONO = { fontFamily: 'var(--font-mono), monospace' };

function Svg({ className, children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {children}
    </svg>
  );
}

function Tag({ children }) {
  return (
    <text x="12" y="390" fontSize="9" fill="currentColor" stroke="none" style={MONO}>
      {children}
    </text>
  );
}

// Linha de chamada: ponto em (x1,y1), cruz de registro em (x2,y2), rótulo opcional.
function Lead({ x1, y1, x2, y2, label, anchor = 'start' }) {
  const tx = anchor === 'end' ? x2 + 4 : x2 - 4;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} {...S} />
      <circle cx={x1} cy={y1} r="2" {...S} />
      <path d={`M${x2 - 4} ${y2}H${x2 + 4}M${x2} ${y2 - 4}V${y2 + 4}`} {...S} />
      {label ? (
        <text
          x={anchor === 'end' ? x2 + 4 : x2 - 4}
          y={y2 - 7}
          textAnchor={anchor === 'end' ? 'end' : 'start'}
          fontSize="9"
          fill="currentColor"
          stroke="none"
          style={MONO}
          data-x={tx}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

/* ---------- 01 · Caixa torácica ---------- */
const RIB_W = [58, 72, 86, 96, 102, 104, 102, 94, 84, 72, 60, 50];

function ribPaths(s) {
  const out = [];
  for (let i = 0; i < 12; i += 1) {
    const wi = RIB_W[i];
    const ys = 92 + i * 14;
    const bx = 160 + s * 14;
    const sx = 160 + s * wi;
    const ex = 160 + s * wi * 0.4;
    const ey = ys + 34 + i;
    const d =
      `M${f(bx)} ${ys}` +
      ` C${f(160 + s * wi * 0.55)} ${ys - 12} ${f(sx)} ${ys - 2} ${f(sx)} ${f(ys + 20 + i * 0.8)}` +
      ` C${f(sx)} ${ys + 38} ${f(160 + s * wi * 0.62)} ${ys + 44 + i} ${f(ex)} ${ey}`;
    out.push(d);
    if (i < 10) {
      const sy = 104 + i * 11;
      out.push(
        `M${f(ex)} ${ey} Q${f(160 + s * wi * 0.2)} ${f((ey + sy) / 2 + 4)} ${160 + s * 5} ${sy}`
      );
    }
  }
  return out;
}

const RIBS = [...ribPaths(-1), ...ribPaths(1)];
const VERTEBRAE = Array.from({ length: 20 }, (_, i) => 80 + i * 13);

export function RibcageArt({ className }) {
  return (
    <Svg className={className}>
      <g data-part="spine" opacity="0.7">
        {VERTEBRAE.map((y) => (
          <rect key={y} x="153" y={y} width="14" height="10" rx="2" strokeDasharray="2 3" {...S} />
        ))}
      </g>
      <g data-part="ribs">
        {RIBS.map((d, i) => (
          <path key={i} d={d} {...S} />
        ))}
        <path
          d="M152 100Q160 105 168 100L170 118L165 122L165 200L160 226L155 200L155 122L150 118Z"
          {...S}
        />
        <path d="M155 122H165" {...S} />
        <path d="M154 103C126 92 96 98 64 94" {...S} />
        <path d="M166 103C194 92 224 98 256 94" {...S} />
      </g>
      <Lead x1={162} y1={160} x2={300} y2={160} label="ESTERNO" anchor="end" />
      <Lead x1={58} y1={182} x2={20} y2={206} label="COSTELAS" />
      <Tag>01 · CAIXA TORÁCICA</Tag>
    </Svg>
  );
}

/* ---------- 02 · Pulmões ---------- */
const RIGHT_LUNG =
  'M148 100C130 84 100 96 92 130C82 170 78 215 84 250C90 268 130 272 150 262C154 230 154 150 148 100Z';
const LEFT_LUNG =
  'M172 100C190 84 220 96 228 130C238 170 242 215 236 250C230 268 190 272 172 262C171 245 172 232 176 224C192 214 196 190 188 172C182 160 172 140 172 100Z';

export function LungsArt({ className }) {
  return (
    <Svg className={className}>
      <g data-part="lungs">
        <path d={RIGHT_LUNG} {...S} />
        <path d={LEFT_LUNG} {...S} />
        <g transform="translate(160 182) scale(1.035) translate(-160 -182)" opacity="0.6">
          <path d={RIGHT_LUNG} {...S} />
          <path d={LEFT_LUNG} {...S} />
        </g>
        {/* fissuras: direito (oblíqua + horizontal), esquerdo (oblíqua) */}
        <path d="M96 140C115 160 135 200 148 240" {...S} />
        <path d="M86 178C105 170 130 168 151 160" {...S} />
        <path d="M226 130C210 155 195 195 178 240" {...S} />
        {/* hilos */}
        <ellipse cx="141" cy="152" rx="8" ry="15" {...S} />
        <ellipse cx="183" cy="152" rx="8" ry="15" {...S} />
        <path d="M149 146L156 140M149 156L156 160M175 146L168 140M175 156L168 160" {...S} />
      </g>
      <Lead x1={110} y1={205} x2={20} y2={236} label="PULMÃO DIREITO · 3 LOBOS" />
      <Lead x1={208} y1={150} x2={300} y2={104} label="PULMÃO ESQUERDO · 2 LOBOS" anchor="end" />
      <Tag>02 · PULMÕES</Tag>
    </Svg>
  );
}

/* ---------- 03 · Vias aéreas ---------- */
const TREE_LENS = [34, 25, 18, 13, 9];

function branch(acc, x, y, th, depth, s) {
  const len = TREE_LENS[depth];
  const dx = s * Math.sin(th) * len;
  const dy = Math.cos(th) * len;
  const x2 = x + dx;
  const y2 = y + dy;
  if (depth <= 1) {
    const w = depth === 0 ? 3.2 : 2.2;
    const nx = (-dy / len) * w;
    const ny = (dx / len) * w;
    acc.push(`M${f(x + nx)} ${f(y + ny)}L${f(x2 + nx)} ${f(y2 + ny)}`);
    acc.push(`M${f(x - nx)} ${f(y - ny)}L${f(x2 - nx)} ${f(y2 - ny)}`);
  } else {
    acc.push(`M${f(x)} ${f(y)}L${f(x2)} ${f(y2)}`);
  }
  if (depth < TREE_LENS.length - 1) {
    branch(acc, x2, y2, th + 0.34, depth + 1, s);
    branch(acc, x2, y2, th - 0.34, depth + 1, s);
  }
}

function treePath(s) {
  const acc = [];
  branch(acc, 160, 160, 0.5, 0, s);
  return acc.join('');
}

const TREE_D = treePath(-1) + treePath(1);
const RINGS = Array.from({ length: 16 }, (_, i) => 102 + i * 3.6);

export function AirwaysArt({ className }) {
  return (
    <Svg className={className}>
      {/* cavidade nasal */}
      <path d="M148 14C140 14 138 34 144 44L176 44C182 34 180 14 172 14Z" {...S} />
      <path d="M160 14V44M152 24C150 30 150 36 152 40M168 24C170 30 170 36 168 40" {...S} />
      {/* faringe + osso hioide */}
      <path d="M146 44C143 56 145 66 150 72M174 44C177 56 175 66 170 72" {...S} />
      <path d="M140 68Q160 75 180 68" {...S} />
      {/* laringe */}
      <path d="M150 76L170 76L172 94L160 100L148 94Z" {...S} />
      <path d="M160 76V100" {...S} />
      {/* traqueia */}
      <g data-part="trachea">
        <path d="M154 100V160M166 100V160" {...S} />
        {RINGS.map((y) => (
          <path key={y} d={`M154.5 ${f(y)}Q160 ${f(y + 2.4)} 165.5 ${f(y)}`} {...S} />
        ))}
      </g>
      <path d="M160 82V160" data-part="flow" strokeDasharray="3 6" {...S} />
      {/* carina + brônquios */}
      <path d="M154 158L160 166L166 158" {...S} />
      <path d={TREE_D} {...S} />
      <Lead x1={160} y1={130} x2={300} y2={130} label="TRAQUEIA" anchor="end" />
      <Lead x1={146} y1={30} x2={30} y2={30} label="CAVIDADE NASAL" />
      <Lead x1={118} y1={202} x2={22} y2={262} label="BRÔNQUIOS" />
      <Tag>03 · VIAS AÉREAS</Tag>
    </Svg>
  );
}

/* ---------- 04 · Diafragma ---------- */
function ellipsePoint(cx, cy, rx, ry, th, notch) {
  const c = Math.cos(th);
  const sn = Math.sin(th);
  let y = cy + ry * sn;
  if (notch && sn < 0) y += notch * Math.exp(-Math.pow((c * rx) / 14, 2)) * -sn;
  return [cx + rx * c, y];
}

const N_FIBERS = 36;
const DOME_ANGLES = Array.from({ length: N_FIBERS }, (_, i) => (i / N_FIBERS) * Math.PI * 2);
const OUTER = DOME_ANGLES.map((t) => ellipsePoint(160, 262, 92, 36, t, 8));
const INNER = DOME_ANGLES.map((t) => ellipsePoint(160, 254, 34, 13, t, 0));
const DOME_D =
  Array.from({ length: 72 }, (_, i) => {
    const [x, y] = ellipsePoint(160, 262, 92, 36, (i / 72) * Math.PI * 2, 8);
    return `${i === 0 ? 'M' : 'L'}${f(x)} ${f(y)}`;
  }).join('') + 'Z';
const TENDON_D =
  Array.from({ length: 48 }, (_, i) => {
    const [x, y] = ellipsePoint(160, 254, 34, 13, (i / 48) * Math.PI * 2, 0);
    return `${i === 0 ? 'M' : 'L'}${f(x)} ${f(y)}`;
  }).join('') + 'Z';
const FIBERS_D = DOME_ANGLES.map(
  (_, i) => `M${f(INNER[i][0])} ${f(INNER[i][1])}L${f(OUTER[i][0])} ${f(OUTER[i][1])}`
).join('');

export function DiaphragmArt({ className }) {
  return (
    <Svg className={className}>
      <g data-part="spine" opacity="0.7">
        {VERTEBRAE.slice(10).map((y) => (
          <rect key={y} x="153" y={y + 20} width="14" height="10" rx="2" strokeDasharray="2 3" {...S} />
        ))}
      </g>
      <g data-part="dome">
        <path d={DOME_D} {...S} />
        <path d={FIBERS_D} {...S} />
        <path d={TENDON_D} {...S} />
      </g>
      {/* pilares (crura) */}
      <path d="M148 292C146 316 148 342 152 366M157 296C155 318 157 342 160 366" {...S} />
      <path d="M172 292C174 312 172 332 168 348M163 296C165 314 164 332 162 346" {...S} />
      <path d="M152 366H160M162 346H168" {...S} />
      <Lead x1={160} y1={254} x2={300} y2={210} label="TENDÃO CENTRAL" anchor="end" />
      <Lead x1={150} y1={330} x2={24} y2={330} label="PILARES (CRURA)" />
      <Tag>04 · DIAFRAGMA</Tag>
    </Svg>
  );
}

export const LAYERS = [
  {
    id: 'caixa-toracica',
    number: 1,
    name: 'Caixa torácica',
    short: 'Costelas e esterno',
    text: 'Costelas, esterno e coluna protegem os pulmões e o coração, e se movem para ajudar na respiração.',
    Art: RibcageArt,
  },
  {
    id: 'pulmoes',
    number: 2,
    name: 'Pulmões',
    short: 'Troca de gases',
    text: 'Dois órgãos esponjosos: o direito tem 3 lobos e o esquerdo, 2. É nos alvéolos que o oxigênio entra no sangue e o gás carbônico sai.',
    Art: LungsArt,
  },
  {
    id: 'vias-aereas',
    number: 3,
    name: 'Vias aéreas',
    short: 'Nariz aos brônquios',
    text: 'Nariz, faringe, laringe, traqueia e brônquios aquecem, filtram e conduzem o ar até os pulmões.',
    Art: AirwaysArt,
  },
  {
    id: 'diafragma',
    number: 4,
    name: 'Diafragma',
    short: 'Músculo da respiração',
    text: 'Músculo em forma de cúpula sob os pulmões. Ao se contrair, desce e puxa o ar para dentro (inspiração); ao relaxar, sobe e o ar sai.',
    Art: DiaphragmArt,
  },
];
