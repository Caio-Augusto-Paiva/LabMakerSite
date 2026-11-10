import { useId } from 'react';
import styles from './circuitArt.module.css';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const VE = 'non-scaling-stroke';

// Traço simples. o = opacidade do traço, dash = tracejado, w = espessura.
function L({ d, o, dash, w }) {
  return (
    <path d={d} vectorEffect={VE} strokeOpacity={o} strokeDasharray={dash} strokeWidth={w} />
  );
}

// Ponto minúsculo (terminal / nó de chamada)
function Dot({ cx, cy }) {
  return <circle cx={cx} cy={cy} r="1" vectorEffect={VE} />;
}

// Nó de conexão aberto (contatos de chaves)
function Node({ cx, cy }) {
  return <circle cx={cx} cy={cy} r="2.5" vectorEffect={VE} />;
}

// Lista de traços: string ou [d, opacidade, tracejado, espessura]
function list(arr) {
  return arr.map((a, i) =>
    Array.isArray(a) ? (
      <L key={i} d={a[0]} o={a[1]} dash={a[2]} w={a[3]} />
    ) : (
      <L key={i} d={a} />
    )
  );
}

// Cruz de registro (canto superior esquerdo)
function Reg() {
  return <L d="M8 12h8M12 8v8" o={0.6} />;
}

// Rótulo mono de designação
function Tag({ x, y, children, size = 8, anchor }) {
  return (
    <text
      x={x}
      y={y}
      fontFamily="var(--font-mono), monospace"
      fontSize={size}
      fill="currentColor"
      stroke="none"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

// Linha de chamada (canto inferior direito) + designação
function Call({ label }) {
  return (
    <>
      <L d="M76 94 L84 104 H112" o={0.5} />
      <Dot cx={76} cy={94} />
      <Tag x={88} y={101}>
        {label}
      </Tag>
    </>
  );
}

// Terminais: fios e pontos nas pontas (y = 60)
function Terms({ a, b }) {
  return (
    <>
      <L d={`M8 60 H${a}`} />
      <L d={`M${b} 60 H112`} />
      <Dot cx={8} cy={60} />
      <Dot cx={112} cy={60} />
    </>
  );
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
/* Símbolos                                                            */
/* ------------------------------------------------------------------ */

function Pilha({ className }) {
  return (
    <Art className={className}>
      <Reg />
      <Terms a={52} b={62} />
      {list([
        // contorno da pilha cilíndrica
        ['M38 34 H82 Q86 34 86 38 V82 Q86 86 82 86 H38 Q34 86 34 82 V38 Q34 34 38 34 Z', 0.45],
        ['M52 26 H68 V34', 0.45],
        // placa positiva (longa) e negativa (curta, grossa)
        'M52 40 V80',
        ['M62 49 V71', 1, undefined, 2],
        // sinais
        'M41 44 h6 M44 41 v6',
        'M73 44 h6',
      ])}
      <Call label="BT1" />
    </Art>
  );
}

function Bateria({ className }) {
  return (
    <Art className={className}>
      <Reg />
      {list([
        'M8 60 H26',
        'M90 60 H112',
        // célula 1
        'M26 42 V78',
        ['M34 50 V70', 1, undefined, 2],
        'M34 60 H46',
        // célula 2
        'M46 42 V78',
        ['M54 50 V70', 1, undefined, 2],
        'M54 60 H66',
        // célula 3
        'M66 42 V78',
        ['M74 50 V70', 1, undefined, 2],
        'M74 60 H90',
        // envoltório tracejado
        ['M20 34 H80 V86 H20 Z', 0.45, '3 3'],
        // sinais
        'M14 48 h6 M17 45 v6',
        'M96 48 h6',
      ])}
      <Dot cx={8} cy={60} />
      <Dot cx={112} cy={60} />
      <Call label="BT1" />
    </Art>
  );
}

function PainelSolar({ className }) {
  const sol = [
    'M107 22 L110.5 22',
    'M89 22 L85.5 22',
    'M98 31 L98 34.5',
    'M98 13 L98 9.5',
    'M104.4 28.4 L106.8 30.8',
    'M91.6 28.4 L89.2 30.8',
    'M104.4 15.6 L106.8 13.2',
    'M91.6 15.6 L89.2 13.2',
  ];
  return (
    <Art className={className}>
      <Reg />
      {list([
        // terminais
        'M8 60 H37',
        'M90 60 H112',
        // painel inclinado e grade 3x3
        'M30 80 L44 44 L96 44 L82 80 Z',
        ['M61.3 44 L47.3 80', 0.6],
        ['M78.7 44 L64.7 80', 0.6],
        ['M39.3 56 H91.3', 0.6],
        ['M34.7 68 H86.7', 0.6],
        // suporte
        'M56 80 V98',
        'M46 98 H66',
        // sol
        ...sol,
      ])}
      <circle cx="98" cy="22" r="6" vectorEffect={VE} />
      <Dot cx={8} cy={60} />
      <Dot cx={112} cy={60} />
      <Call label="G1" />
    </Art>
  );
}

function Lampada({ className }) {
  return (
    <Art className={className}>
      <Reg />
      <Terms a={40} b={80} />
      <circle cx="60" cy="60" r="20" vectorEffect={VE} />
      {list([
        'M45.9 45.9 L74.1 74.1',
        'M74.1 45.9 L45.9 74.1',
        // raios de luz
        ['M60 33 V24', 0.6],
        ['M43.5 43.5 L37 37', 0.6],
        ['M76.5 43.5 L83 37', 0.6],
      ])}
      <Call label="L1" />
    </Art>
  );
}

function Resistor({ className }) {
  return (
    <Art className={className}>
      <Reg />
      <Terms a={26} b={94} />
      {list(['M26 60 L32 48 L40 72 L48 48 L56 72 L64 48 L72 72 L78 60'])}
      <L d="M78 60 H94" />
      <Tag x={50} y={92}>
        Ω
      </Tag>
      <Call label="R1" />
    </Art>
  );
}

function Motor({ className }) {
  return (
    <Art className={className}>
      <Reg />
      <Terms a={38} b={82} />
      <circle cx="60" cy="60" r="22" vectorEffect={VE} />
      {list([
        // letra M
        'M49 70 V50 L60 62 L71 50 V70',
        // seta curva de rotação
        ['M44 28 C52 20 68 20 76 28', 0.6],
        ['M76 28 L69.5 27.5 M76 28 L76 21.5', 0.6],
      ])}
      <Call label="M1" />
    </Art>
  );
}

function Interruptor({ className }) {
  return (
    <Art className={className}>
      <Reg />
      <Terms a={34} b={86} />
      <Node cx={36} cy={60} />
      <Node cx={84} cy={60} />
      {list([
        // lâmina levantada
        'M38 58 L84 36',
        // seta de movimento (tracejada)
        ['M70 26 C88 26 96 42 90 54', 0.6, '3 3'],
        ['M90 54 L88.5 47.5 M90 54 L95.5 49.5', 0.6],
      ])}
      <Call label="S1" />
    </Art>
  );
}

function Botao({ className }) {
  return (
    <Art className={className}>
      <Reg />
      <Terms a={34} b={86} />
      <Node cx={34} cy={60} />
      <Node cx={86} cy={60} />
      {list([
        // ponte suspensa
        'M34 54 V48',
        'M86 54 V48',
        'M34 48 H86',
        // haste e chapéu em T
        'M60 48 V30',
        'M46 30 H74',
        // seta para baixo
        ['M60 12 V22', 0.6],
        ['M56 18 L60 22 L64 18', 0.6],
      ])}
      <Call label="S2" />
    </Art>
  );
}

function Fusivel({ className }) {
  return (
    <Art className={className}>
      <Reg />
      <Terms a={30} b={90} />
      {list([
        'M30 48 H90 V72 H30 Z',
        // filamento atravessando de ponta a ponta, com pequenos arcos
        'M30 60 H46 C49 52 55 52 58 60 C61 68 67 68 70 60 C73 52 79 52 82 60 H90',
        ['M38 48 V72', 0.45],
        ['M82 48 V72', 0.45],
      ])}
      <Call label="F1" />
    </Art>
  );
}

export const CIRCUIT_ART = {
  pilha: Pilha,
  bateria: Bateria,
  'painel-solar': PainelSolar,
  lampada: Lampada,
  resistor: Resistor,
  motor: Motor,
  interruptor: Interruptor,
  botao: Botao,
  fusivel: Fusivel,
};

/* ------------------------------------------------------------------ */
/* Circuito completo                                                   */
/* ------------------------------------------------------------------ */

export const CIRCUIT_VIEWBOX = { w: 480, h: 360 };

// Traço do circuito: pathLength normalizado para a animação de desenho
function P({ d, w }) {
  return <path d={d} pathLength="1" vectorEffect={VE} strokeWidth={w} />;
}

function PList({ items }) {
  return items.map((a, i) =>
    Array.isArray(a) ? <P key={i} d={a[0]} w={a[1]} /> : <P key={i} d={a} />
  );
}

function Cross({ x, y }) {
  return <path d={`M${x - 6} ${y}h12M${x} ${y - 6}v12`} vectorEffect={VE} strokeOpacity="0.6" />;
}

// Raios de luz da lâmpada (centro 320,185), exceto na direção dos fios
const RAIOS = [0, 45, 135, 180, 225, 315].map((deg) => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const f = (n) => n.toFixed(1);
  return `M${f(320 + 28 * c)} ${f(185 + 28 * s)} L${f(320 + 37 * c)} ${f(185 + 37 * s)}`;
});

export function CircuitBlueprint({ className, drawn }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const glowId = `glow${uid}`;
  const cls = [styles.circuit, drawn ? styles.drawn : '', className || '']
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${CIRCUIT_VIEWBOX.w} ${CIRCUIT_VIEWBOX.h}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cls}
    >
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#fff6c2" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffe58a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffd75e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Brilho da lâmpada (atrás de tudo) */}
      <g data-part="brilho">
        <circle cx="320" cy="185" r="52" fill={`url(#${glowId})`} stroke="none" />
      </g>

      {/* Fios: laço fechado + ramos em paralelo */}
      <g data-part="fios">
        <PList
          items={[
            'M70 150 V70 H107',
            'M173 70 H210',
            'M266 70 H430 V163',
            'M430 207 V300 H70 V202',
            'M320 70 V163',
            'M320 207 V300',
            'M375 70 V159',
            'M375 211 V300',
          ]}
        />
      </g>

      {/* Nós das junções */}
      <g data-part="nos">
        <circle cx="320" cy="70" r="3" vectorEffect={VE} />
        <circle cx="375" cy="70" r="3" vectorEffect={VE} />
        <circle cx="320" cy="300" r="3" vectorEffect={VE} />
        <circle cx="375" cy="300" r="3" vectorEffect={VE} />
      </g>

      {/* Fonte: bateria de 3 células, + para cima */}
      <g data-class="fontes">
        <PList
          items={[
            'M54 150 H86',
            ['M60 158 H80', 2],
            'M70 158 V172',
            'M54 172 H86',
            ['M60 180 H80', 2],
            'M70 180 V194',
            'M54 194 H86',
            ['M60 202 H80', 2],
          ]}
        />
      </g>

      {/* Controle: interruptor fechado e fusível, em série */}
      <g data-class="controle">
        <circle cx="110" cy="70" r="3" pathLength="1" vectorEffect={VE} />
        <circle cx="170" cy="70" r="3" pathLength="1" vectorEffect={VE} />
        <PList
          items={[
            'M113 70 H167',
            'M210 62 H266 V78 H210 Z',
            'M210 70 H232 C236 63 242 63 244 70 C246 77 252 77 256 70 H266',
          ]}
        />
      </g>

      {/* Cargas em paralelo: lâmpada, resistor, motor */}
      <g data-class="cargas">
        <circle cx="320" cy="185" r="22" pathLength="1" vectorEffect={VE} />
        <PList
          items={[
            'M304.4 169.4 L335.6 200.6',
            'M335.6 169.4 L304.4 200.6',
            'M375 159 L383 165 L367 173 L383 181 L367 189 L383 197 L367 205 L375 211',
            'M421 195 V175 L430 187 L439 175 V195',
          ]}
        />
        <circle cx="430" cy="185" r="22" pathLength="1" vectorEffect={VE} />
      </g>

      {/* Raios da lâmpada acesa */}
      <g data-part="luz">
        {RAIOS.map((d, i) => (
          <path key={i} d={d} vectorEffect={VE} />
        ))}
      </g>

      {/* Rotação do motor */}
      <g data-part="rotor">
        <circle cx="430" cy="185" r="30" vectorEffect={VE} strokeOpacity="0" />
        <path d="M430 155 A30 30 0 1 1 404 200" vectorEffect={VE} />
        <path d="M409.1 202.8 L404 200 L403.9 205.8" vectorEffect={VE} />
      </g>

      {/* Cotas, rótulos e marcas de registro */}
      <g data-part="cotas">
        <Cross x={14} y={14} />
        <Cross x={466} y={14} />
        <Cross x={14} y={346} />
        <Cross x={466} y={346} />

        {/* envoltório da bateria e cota de 9 V */}
        <path d="M44 140 H96 V212 H44 Z" vectorEffect={VE} strokeOpacity="0.45" strokeDasharray="3 3" />
        <path d="M36 140 V212 M30 140 H42 M30 212 H42" vectorEffect={VE} strokeOpacity="0.7" />
        <path d="M97 146 h6 M100 143 v6 M97 210 h6" vectorEffect={VE} />
        <Tag x={9} y={180} size={9}>
          9 V
        </Tag>
        <Tag x={104} y={186} size={9}>
          BT1
        </Tag>

        {/* designações */}
        <Tag x={134} y={56} size={9} anchor="middle">
          S1
        </Tag>
        <Tag x={238} y={56} size={9} anchor="middle">
          F1
        </Tag>
        <Tag x={320} y={240} size={9} anchor="middle">
          L1
        </Tag>
        <Tag x={375} y={240} size={9} anchor="middle">
          R1
        </Tag>
        <Tag x={430} y={246} size={9} anchor="middle">
          M1
        </Tag>
        <Tag x={394} y={186} size={8}>
          10 Ω
        </Tag>

        {/* seta do sentido convencional da corrente */}
        <path d="M332 56 H362 M356 52 L362 56 L356 60" vectorEffect={VE} />
        <Tag x={347} y={48} size={9} anchor="middle">
          I
        </Tag>

        {/* corte A–A */}
        <path d="M292 40 V322" vectorEffect={VE} strokeOpacity="0.5" strokeDasharray="8 3 2 3" />
        <Tag x={292} y={34} size={9} anchor="middle">
          A
        </Tag>
        <Tag x={292} y={334} size={9} anchor="middle">
          A
        </Tag>
        <Tag x={302} y={334} size={8}>
          ÁREA A–A
        </Tag>

        {/* legenda */}
        <Tag x={36} y={334} size={8}>
          CIRCUITO EM PARALELO
        </Tag>
        <Tag x={450} y={334} size={8} anchor="end">
          ESC 1:1
        </Tag>
      </g>

      {/* Corrente: cópias dos fios (sem pathLength, no sentido convencional) */}
      <g data-part="corrente">
        <path d="M70 150 V70 H107" vectorEffect={VE} />
        <path d="M173 70 H210" vectorEffect={VE} />
        <path d="M266 70 H430 V163" vectorEffect={VE} />
        <path d="M430 207 V300 H70 V202" vectorEffect={VE} />
        <path d="M320 70 V163" vectorEffect={VE} />
        <path d="M320 207 V300" vectorEffect={VE} />
        <path d="M375 70 V159" vectorEffect={VE} />
        <path d="M375 211 V300" vectorEffect={VE} />
      </g>
    </svg>
  );
}
