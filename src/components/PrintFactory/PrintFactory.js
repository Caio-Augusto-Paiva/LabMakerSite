'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PrintFactory.module.css';

/* Esteira de produção teórica de impressão 3D (CSS 3D puro, sem libs).
   Convenções da cena: 1 unidade = 1px; eixo X = comprimento da esteira,
   Y = profundidade (para a frente da tela), Z = altura. */

const STATIONS = [
  {
    n: '01',
    tag: 'PEDIDO',
    title: 'Pedido & Modelagem',
    text: 'Alguém da faculdade pede uma peça. A equipe transforma a ideia em um modelo 3D no computador.',
    input: 'pedido / ideia',
    output: 'modelo .STL',
  },
  {
    n: '02',
    tag: 'FATIAMENTO',
    title: 'Fatiamento',
    text: 'O modelo é cortado em centenas de camadas finas e recebe as configurações da impressão: material, preenchimento e suportes.',
    input: 'modelo .STL',
    output: 'arquivo G-code',
  },
  {
    n: '03',
    tag: 'IMPRESSÃO',
    title: 'Impressão',
    text: 'A impressora FDM deposita filamento camada por camada até a peça existir de verdade.',
    input: 'G-code + filamento',
    output: 'peça bruta',
  },
  {
    n: '04',
    tag: 'ACABAMENTO',
    title: 'Pós-processamento',
    text: 'Remoção de suportes, lixa e acabamento. É aqui que a peça ganha cara de produto.',
    input: 'peça bruta',
    output: 'peça acabada',
  },
  {
    n: '05',
    tag: 'ENTREGA',
    title: 'Inspeção & Entrega',
    text: 'Conferimos medidas e qualidade, embalamos e entregamos para quem pediu.',
    input: 'peça acabada',
    output: 'peça entregue',
  },
];

/* Presets de câmera: rx = inclinação (rotateX), rz = giro (rotateZ),
   zoom = escala (1 = tamanho real, calibrado para cena de ~800px de largura),
   tx/ty = deslocamento em px. */
const CAMERAS = [
  { id: 'iso', label: 'Isométrica', rx: 58, rz: -38, zoom: 0.78, tx: 0, ty: 10 },
  { id: 'front', label: 'Frontal', rx: 72, rz: 0, zoom: 0.68, tx: 0, ty: 10 },
  { id: 'top', label: 'Superior', rx: 0, rz: 0, zoom: 0.68, tx: 0, ty: 0 },
  { id: 'side', label: 'Lateral', rx: 62, rz: -90, zoom: 0.44, tx: 0, ty: 0 },
  { id: 'focus', label: 'Foco na impressora', rx: 56, rz: -32, zoom: 1.7, tx: 0, ty: 20 },
];

const FACES = ['top', 'front', 'back', 'left', 'right'];
const px = (v) => (typeof v === 'number' ? `${v}px` : v);

/* Caixa 3D genérica: w (X) × d (Y) × h (Z). Origem no CENTRO da base;
   x/y/z posicionam a base. Faces: topo + 4 laterais (a base não é desenhada). */
function Box({ w, d, h, x = 0, y = 0, z = 0, className = '' }) {
  return (
    <div
      className={`${styles.g} ${styles.box} ${className}`}
      style={{ '--w': px(w), '--d': px(d), '--h': px(h), '--x': px(x), '--y': px(y), '--z': px(z) }}
    >
      <div className={`${styles.g} ${styles.inner}`}>
        {FACES.map((f) => (
          <i key={f} className={`${styles.f} ${styles[f]}`} />
        ))}
      </div>
    </div>
  );
}

export default function PrintFactory({ className = '' }) {
  const [sel, setSel] = useState(2);
  const [camId, setCamId] = useState('iso');
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const rootRef = useRef(null);

  // As ~125 faces animadas da esteira só rodam enquanto ela está visível (economiza CPU/GPU na rolagem)
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cam = CAMERAS.find((c) => c.id === camId) || CAMERAS[0];
  const st = STATIONS[sel];
  const glass = styles.glass;

  const stationProps = (i) => ({
    className: `${styles.g} ${styles.station} ${sel === i ? styles.on : ''}`,
    style: { '--k': i - 2 },
    onClick: () => setSel(i),
  });

  return (
    <div ref={rootRef} className={`${styles.root} ${paused || !onScreen ? styles.paused : ''} ${className}`}>
      {/* Barra de controles */}
      <div className={styles.bar}>
        <div className={styles.cams} role="group" aria-label="Câmeras">
          {CAMERAS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.ctl}
              aria-pressed={camId === c.id}
              onClick={() => setCamId(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`${styles.ctl} ${styles.pause}`}
          data-paused={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Retomar' : 'Pausar'}
        </button>
      </div>

      <div className={styles.layout}>
        {/* Cena 3D */}
        <div className={`${styles.stage} blueprint`}>
          <div
            className={`${styles.g} ${styles.world}`}
            aria-hidden="true"
            style={{
              '--rx': `${cam.rx}deg`,
              '--rz': `${cam.rz}deg`,
              '--zoom': cam.zoom,
              '--tx': `${cam.tx}px`,
              '--ty': `${cam.ty}px`,
            }}
          >
            <div className={styles.shadow} />

            {/* Esteira: 1100×120×28 */}
            <Box className={styles.belt} w="var(--belt-len)" d="var(--belt-dep)" h="var(--belt-h)" />

            {/* "Convés": origem Z na superfície da esteira */}
            <div className={`${styles.g} ${styles.deck}`}>
              {/* 01 – Modelagem: mesa + monitor + cubo wireframe girando (fora da esteira, no chão: z = -28) */}
              <div {...stationProps(0)}>
                <div className={`${styles.g} ${styles.lift}`}>
                  <Box className={glass} w={120} d={44} h={52} y={-92} z={-28} />
                  <Box className={`${glass} ${styles.screen}`} w={84} d={5} h={52} y={-108} z={24} />
                  <div className={`${styles.g} ${styles.holo}`}>
                    <div className={`${styles.g} ${styles.spin}`}>
                      <Box className={glass} w={26} d={26} h={26} />
                    </div>
                  </div>
                </div>
                <div className={styles.tag}>{STATIONS[0].n} {STATIONS[0].tag}</div>
              </div>

              {/* 02 – Fatiamento: portal + lâmina horizontal que sobe e desce */}
              <div {...stationProps(1)}>
                <div className={`${styles.g} ${styles.lift}`}>
                  <Box className={glass} w={10} d={10} h={92} y={-52} />
                  <Box className={glass} w={10} d={10} h={92} y={52} />
                  <Box className={glass} w={14} d={114} h={10} z={92} />
                  <div className={`${styles.g} ${styles.blade}`}>
                    <Box className={styles.sheet} w={60} d={96} h={2} />
                  </div>
                </div>
                <div className={styles.tag}>{STATIONS[1].n} {STATIONS[1].tag}</div>
              </div>

              {/* 03 – Impressão: gaiola em cubo (extremidades abertas p/ a esteira) + cabeçote */}
              <div {...stationProps(2)}>
                <div className={`${styles.g} ${styles.lift}`}>
                  <Box className={`${glass} ${styles.noEnds}`} w={130} d={122} h={110} />
                  <Box className={styles.post} w={6} d={6} h={110} x={-62} y={-58} />
                  <Box className={styles.post} w={6} d={6} h={110} x={62} y={-58} />
                  <Box className={styles.post} w={6} d={6} h={110} x={-62} y={58} />
                  <Box className={styles.post} w={6} d={6} h={110} x={62} y={58} />
                  {/* trilho em X que desliza em Y; cabeçote que desliza em X sobre o trilho */}
                  <div className={`${styles.g} ${styles.rail}`}>
                    <Box className={styles.post} w={118} d={7} h={7} z={78} />
                    <div className={`${styles.g} ${styles.head}`}>
                      <Box className={styles.post} w={16} d={16} h={16} z={62} />
                      <Box className={styles.nozzle} w={5} d={5} h={14} z={48} />
                    </div>
                  </div>
                </div>
                <div className={styles.tag}>{STATIONS[2].n} {STATIONS[2].tag}</div>
              </div>

              {/* 04 – Pós-processamento: braço giratório com ferramenta */}
              <div {...stationProps(3)}>
                <div className={`${styles.g} ${styles.lift}`}>
                  <Box className={styles.post} w={30} d={30} h={38} y={-80} z={-28} />
                  <div className={`${styles.g} ${styles.armPos}`}>
                    <div className={`${styles.g} ${styles.swing}`}>
                      <Box className={styles.post} w={10} d={10} h={60} z={10} />
                      <Box className={glass} w={8} d={78} h={8} y={39} z={62} />
                      <div className={`${styles.g} ${styles.tip}`}>
                        <Box className={styles.nozzle} w={8} d={8} h={22} y={78} z={40} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.tag}>{STATIONS[3].n} {STATIONS[3].tag}</div>
              </div>

              {/* 05 – Inspeção: portal com feixe de scanner + caixas empilhadas */}
              <div {...stationProps(4)}>
                <div className={`${styles.g} ${styles.lift}`}>
                  <Box className={glass} w={10} d={10} h={82} y={-52} />
                  <Box className={glass} w={10} d={10} h={82} y={52} />
                  <Box className={glass} w={14} d={114} h={10} z={82} />
                  <div className={`${styles.g} ${styles.scan}`}>
                    <Box className={styles.beam} w={2} d={96} h={76} />
                  </div>
                  <Box className={styles.pack} w={40} d={40} h={58} x={-24} y={-92} z={-28} />
                  <Box className={styles.pack} w={40} d={40} h={58} x={24} y={-92} z={-28} />
                  <Box className={styles.pack} w={36} d={36} h={26} y={-92} z={30} />
                </div>
                <div className={styles.tag}>{STATIONS[4].n} {STATIONS[4].tag}</div>
              </div>

              {/* Peças: 5 em fila, defasadas pelo delay negativo (--i). */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`${styles.g} ${styles.piece}`} data-i={i} style={{ '--i': i }}>
                  <Box className={styles.ghost} w={40} d={40} h={40} />
                  <Box className={styles.slice} w={39} d={39} h={39} />
                  <Box className={styles.solid} w={38} d={38} h={38} />
                  <Box className={styles.gloss} w={37} d={37} h={37} />
                  <Box className={styles.pack} w={48} d={48} h={46} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna direita: lista + detalhe */}
        <div className={`${styles.side} plate plate--dark`}>
          <ol className={styles.list}>
            {STATIONS.map((s, i) => (
              <li key={s.n}>
                <button
                  type="button"
                  className={styles.item}
                  aria-current={sel === i ? 'step' : undefined}
                  onClick={() => setSel(i)}
                >
                  <span className={styles.itemN}>{s.n}</span>
                  <span className={styles.itemT}>{s.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className={styles.detail} aria-live="polite">
            <div className={styles.bigN}>{st.n}</div>
            <h3 className={styles.dTitle}>{st.title}</h3>
            <p className={styles.dText}>{st.text}</p>
            <div className={styles.chips}>
              <span className={styles.chip}>ENTRADA: {st.input}</span>
              <span className={styles.chip}>SAÍDA: {st.output}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
