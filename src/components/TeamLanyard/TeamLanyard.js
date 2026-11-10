'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './TeamLanyard.module.css';

/* ---------- Constantes de layout e física ---------- */
const TOP = 28; // y (px) onde o cabo começa, logo abaixo do centro do trilho
const CORD0 = 34; // comprimento de repouso do cabo retrátil
const L = 300; // comprimento efetivo do pêndulo (px), usado para converter aceleração em torque
const GAP = 6; // folga mínima entre crachás
const DRAG_THRESHOLD = 6; // px para distinguir clique de arrasto
const MAX_PULL = 70; // alongamento máximo do cabo
const MAX_ANGLE = 0.6; // rad
const HOVER_PUSH = 16; // px que o vizinho é empurrado no hover
const EPS = { x: 0.05, v: 1, a: 0.0008, av: 0.01 };

// Mola do deslocamento horizontal (quase crítica: zeta ~0,85)
const KX = 170;
const KX_DRAG = 300;
const ZX = 0.85;
// Pêndulo (subamortecido de propósito, para balançar): w^2 = 60, zeta = 0,18
const W2 = 60;
const ZA = 0.18;
// Cabo retrátil: solta com ressalto (zeta 0,3); enquanto puxado, amortecido (0,8)
const KC = 200;
const ZC_FREE = 0.3;
const ZC_PULL = 0.8;

const NARROW_QUERY = '(max-width: 719px)';
const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* ---------- Utilitários ---------- */
function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

const isPlaceholder = (name) => /^nome/i.test(String(name || '').trim());
const isExternal = (href) => /^https?:\/\//i.test(href || '');
const announce = (m) => `${m.name}, ${m.role}, equipe ${m.team}`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/**
 * Resolve posições-alvo ao longo do trilho respeitando ordem, espaçamento mínimo
 * e limites. Se há um crachá "pivô" (o que está sendo arrastado), ele manda e
 * os vizinhos são empurrados para fora a partir dele.
 */
function solve(base, push, pivot, pivotX, width, bw) {
  const n = base.length;
  const gap = bw + GAP;
  const half = bw / 2 + 8;
  const lo = (i) => half + i * gap;
  const hi = (i) => width - half - (n - 1 - i) * gap;
  const t = base.map((b, i) => b + (push ? push[i] : 0));
  if (pivot >= 0) {
    t[pivot] = clamp(pivotX, lo(pivot), Math.max(lo(pivot), hi(pivot)));
    for (let i = pivot + 1; i < n; i++) t[i] = Math.max(t[i], t[i - 1] + gap);
    for (let i = pivot - 1; i >= 0; i--) t[i] = Math.min(t[i], t[i + 1] - gap);
  }
  // Passadas gerais: garantem ordem e limites (sem pivô, é a única regra)
  for (let i = 0; i < n; i++) t[i] = Math.max(t[i], i === 0 ? lo(0) : t[i - 1] + gap);
  for (let i = n - 1; i >= 0; i--) t[i] = Math.min(t[i], i === n - 1 ? hi(n - 1) : t[i + 1] - gap);
  return t;
}

function PersonGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" fill="currentColor" />
    </svg>
  );
}

/* ---------- Componente ---------- */
export default function TeamLanyard({ members = [], caption = '', className = '' }) {
  const list = Array.isArray(members) ? members : [];
  const n = list.length;

  const [mode, setMode] = useState('rail'); // 'rail' | 'carousel'
  const [bw, setBw] = useState(168);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [flippedId, setFlippedId] = useState(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const [dragIdx, setDragIdx] = useState(-1);
  const [live, setLive] = useState(caption);

  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const slotRefs = useRef([]);
  const cordRefs = useRef([]);
  const swingRefs = useRef([]);

  const simRef = useRef([]); // estado físico por crachá
  const baseRef = useRef([]); // posição de repouso (onde foi solto)
  const widthRef = useRef(0);
  const bwRef = useRef(168);
  const modeRef = useRef('rail');
  const physicsRef = useRef(true);
  const hoverRef = useRef(-1);
  const dragRef = useRef(null);
  const suppressRef = useRef(false);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const lastRef = useRef(0);

  physicsRef.current = !reduced && mode === 'rail';
  modeRef.current = mode;

  // Escreve a física no DOM (sem passar pelo React, para manter 60fps)
  const applyAll = useCallback(() => {
    const sim = simRef.current;
    const rail = modeRef.current === 'rail';
    for (let i = 0; i < sim.length; i++) {
      const slot = slotRefs.current[i];
      const cord = cordRefs.current[i];
      const swing = swingRefs.current[i];
      if (!slot || !cord || !swing) continue;
      if (!rail) {
        slot.style.transform = '';
        cord.style.height = '';
        swing.style.transform = '';
        continue;
      }
      const s = sim[i];
      slot.style.transform = `translate3d(${s.x.toFixed(2)}px,0,0)`;
      cord.style.height = `${(CORD0 + s.c).toFixed(2)}px`;
      swing.style.transform = `translate3d(0,${(TOP + CORD0 + s.c).toFixed(2)}px,0) rotate(${s.a.toFixed(4)}rad)`;
    }
  }, []);

  const computeTargets = useCallback(() => {
    const base = baseRef.current;
    const d = dragRef.current;
    const h = hoverRef.current;
    const push = base.map((_, i) => (d || h < 0 ? 0 : i === h - 1 ? -HOVER_PUSH : i === h + 1 ? HOVER_PUSH : 0));
    return solve(base, push, d && d.moved ? d.i : -1, d ? d.x : 0, widthRef.current, bwRef.current);
  }, []);

  const step = useCallback((dt) => {
    const sim = simRef.current;
    const d = dragRef.current;
    const dragging = d && d.moved ? d.i : -1;
    const targets = computeTargets();
    let moving = false;
    for (let i = 0; i < sim.length; i++) {
      const s = sim[i];
      s.tx = targets[i];
      const isDrag = i === dragging;
      const ct = isDrag ? d.pull : 0;

      // (a) deslocamento horizontal: mola quase crítica
      const kx = isDrag ? KX_DRAG : KX;
      const ax = kx * (s.tx - s.x) - 2 * Math.sqrt(kx) * ZX * s.vx;
      s.vx += ax * dt;
      s.x += s.vx * dt;

      // (b) pêndulo: a aceleração do ponto de fixação (ax) gera torque de inércia
      // ax/L (o crachá "fica para trás" e balança); o sinal positivo bate com o
      // rotate() do CSS, em que ângulo positivo leva a base do crachá para a esquerda.
      const aa = -W2 * s.a - 2 * ZA * Math.sqrt(W2) * s.av + ax / L;
      s.av += aa * dt;
      s.a = clamp(s.a + s.av * dt, -MAX_ANGLE, MAX_ANGLE);

      // (c) cabo retrátil: mola com ressalto ao soltar
      const zc = isDrag ? ZC_PULL : ZC_FREE;
      const ac = KC * (ct - s.c) - 2 * zc * Math.sqrt(KC) * s.cv;
      s.cv += ac * dt;
      s.c = clamp(s.c + s.cv * dt, -12, MAX_PULL + 20);

      if (
        Math.abs(s.tx - s.x) > EPS.x || Math.abs(s.vx) > EPS.v ||
        Math.abs(s.a) > EPS.a || Math.abs(s.av) > EPS.av ||
        Math.abs(ct - s.c) > EPS.x * 2 || Math.abs(s.cv) > EPS.v
      ) moving = true;
    }
    return moving || dragging >= 0;
  }, [computeTargets]);

  const tick = useCallback((ts) => {
    if (!runningRef.current) return;
    const last = lastRef.current || ts;
    // dt limitado para a integração não explodir após aba em segundo plano
    const dt = Math.min((ts - last) / 1000, 1 / 30);
    lastRef.current = ts;
    let moving = false;
    for (let k = 0; k < 2; k++) moving = step(dt / 2);
    if (moving) {
      applyAll();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Tudo parado: crava nos valores exatos e dorme
      for (const s of simRef.current) {
        s.x = s.tx; s.vx = 0; s.a = 0; s.av = 0; s.c = 0; s.cv = 0;
      }
      applyAll();
      runningRef.current = false;
      rafRef.current = 0;
    }
  }, [step, applyAll]);

  const wake = useCallback(() => {
    if (!physicsRef.current || runningRef.current) return;
    runningRef.current = true;
    lastRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Medição, modo (trilho/carrossel) e distribuição inicial
  useIso(() => {
    const stage = stageRef.current;
    if (!stage || !n) return undefined;
    let prevW = -1;
    let prevN = -1;
    const measure = () => {
      const w = stage.clientWidth;
      if (!w) return;
      const narrow = window.matchMedia(NARROW_QUERY).matches;
      const fit = Math.floor(w / n) - GAP;
      const car = narrow || fit < 120;
      const nextBw = car ? Math.round(clamp(w * 0.7, 180, 240)) : Math.min(176, fit);
      modeRef.current = car ? 'carousel' : 'rail';
      bwRef.current = nextBw;
      setMode(car ? 'carousel' : 'rail');
      setBw(nextBw);
      if (w !== prevW || n !== prevN) {
        // Redistribui mantendo a ordem, igualmente espaçado
        widthRef.current = w;
        baseRef.current = Array.from({ length: n }, (_, i) => ((i + 0.5) * w) / n);
        const t = solve(baseRef.current, null, -1, 0, w, nextBw);
        baseRef.current = t;
        simRef.current = t.map((x) => ({ x, vx: 0, tx: x, a: 0, av: 0, c: 0, cv: 0 }));
        prevW = w;
        prevN = n;
      }
      applyAll();
      setReady(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, [n, applyAll]);

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Ao mudar de modo/reduced, assenta tudo sem animação
  useEffect(() => {
    if (!physicsRef.current) {
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      for (const s of simRef.current) {
        s.x = s.tx; s.vx = 0; s.a = 0; s.av = 0; s.c = 0; s.cv = 0;
      }
    }
    applyAll();
  }, [mode, reduced, applyAll]);

  useEffect(() => { setLive(caption); }, [caption]);

  /* ---------- Interações ---------- */
  const toggle = (i) => {
    const m = list[i];
    const opening = flippedId !== m.id;
    setFlippedId(opening ? m.id : null);
    setLive(`${announce(m)}. ${opening ? 'Verso aberto.' : 'Frente.'}`);
  };

  const onPointerDown = (e, i) => {
    suppressRef.current = false;
    if (!physicsRef.current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest && e.target.closest('a')) return;
    const s = simRef.current[i];
    dragRef.current = {
      i, id: e.pointerId, sx: e.clientX, sy: e.clientY,
      startX: s ? s.x : 0, x: s ? s.x : 0, pull: 0, moved: false,
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignora */ }
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      hoverRef.current = -1;
      setDragIdx(d.i);
    }
    d.x = d.startX + dx;
    // Resistência: o alongamento cresce cada vez menos (assíntota em MAX_PULL)
    d.pull = dy > 0 ? MAX_PULL * (1 - Math.exp(-dy / 90)) : 0;
    wake();
  };

  const endDrag = (e, cancelled) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved) {
      // Deixa o crachá (e os empurrados) onde ficaram
      baseRef.current = solve(baseRef.current, null, d.i, d.x, widthRef.current, bwRef.current);
      suppressRef.current = true;
      setDragIdx(-1);
    } else if (cancelled) {
      suppressRef.current = true;
    }
    dragRef.current = null;
    wake();
  };

  const onClick = (e, i) => {
    if (suppressRef.current) { suppressRef.current = false; return; }
    if (e.target.closest && e.target.closest('a')) return;
    toggle(i);
  };

  const onKeyDown = (e, i) => {
    if (e.key === 'Escape') {
      if (flippedId !== null) {
        setFlippedId(null);
        setLive(`${announce(list[i])}. Frente.`);
        cardRefs.current[i]?.focus();
      }
      return;
    }
    if (e.target !== e.currentTarget) return; // teclas em links do verso não viram o crachá
    let j = -1;
    if (e.key === 'ArrowRight') j = Math.min(n - 1, i + 1);
    else if (e.key === 'ArrowLeft') j = Math.max(0, i - 1);
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    if (j >= 0) {
      e.preventDefault();
      setFocusIdx(j);
      cardRefs.current[j]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(i);
    }
  };

  const onHoverStart = (e, i) => {
    if (e.pointerType !== 'mouse' || !physicsRef.current || dragRef.current) return;
    hoverRef.current = i;
    const sim = simRef.current;
    // Pequeno "tranco" no balanço do crachá e dos vizinhos
    if (sim[i]) sim[i].av += 1.1;
    if (sim[i - 1]) sim[i - 1].av -= 0.6;
    if (sim[i + 1]) sim[i + 1].av += 0.6;
    wake();
  };

  const onHoverEnd = (e, i) => {
    if (hoverRef.current === i) { hoverRef.current = -1; wake(); }
  };

  if (!n) return null;

  const rootCls = [
    styles.root,
    mode === 'carousel' ? styles.carousel : styles.rail,
    reduced ? styles.reduced : '',
    ready ? styles.ready : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={rootCls} style={{ '--bw': `${bw}px` }}>
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.railBar} aria-hidden="true">
          <span className={`${styles.screw} ${styles.screwL}`} />
          <span className={`${styles.screw} ${styles.screwR}`} />
        </div>

        <div className={styles.track} role="group" aria-label="Crachás da equipe">
          {list.map((m, i) => {
            const flipped = flippedId === m.id;
            const tone = ['brand', 'accent', 'mint', 'ink'].includes(m.tone) ? m.tone : 'accent';
            const id = String(i + 1).padStart(2, '0');
            const links = Array.isArray(m.links) ? m.links : [];
            const tags = Array.isArray(m.tags) ? m.tags : [];
            return (
              <div
                key={m.id ?? i}
                ref={(el) => { slotRefs.current[i] = el; }}
                className={`${styles.slot} ${styles[`tone_${tone}`]} ${dragIdx === i ? styles.dragging : ''} ${flipped ? styles.slotOpen : ''}`}
              >
                <span className={styles.carriage} aria-hidden="true" />
                <span className={styles.cord} ref={(el) => { cordRefs.current[i] = el; }} aria-hidden="true" />
                <div className={styles.swing} ref={(el) => { swingRefs.current[i] = el; }}>
                  <div className={styles.strap} aria-hidden="true">
                    <span>LABMAKER</span>
                    <span>LABMAKER</span>
                  </div>
                  <span className={styles.clip} aria-hidden="true" />
                  <div
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className={styles.card}
                    role="group"
                    aria-label={`${m.name}, ${m.role}. ${flipped ? 'Verso aberto. Esc para voltar.' : 'Enter para virar o crachá.'}`}
                    tabIndex={i === focusIdx ? 0 : -1}
                    onFocus={() => {
                      setFocusIdx(i);
                      setLive(announce(m));
                    }}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    onClick={(e) => onClick(e, i)}
                    onPointerDown={(e) => onPointerDown(e, i)}
                    onPointerMove={onPointerMove}
                    onPointerUp={(e) => endDrag(e, false)}
                    onPointerCancel={(e) => endDrag(e, true)}
                    onPointerEnter={(e) => onHoverStart(e, i)}
                    onPointerLeave={(e) => onHoverEnd(e, i)}
                  >
                    <div className={styles.inner} data-flipped={flipped ? 'true' : 'false'}>
                      {/* Frente */}
                      <div className={`${styles.face} ${styles.front}`} inert={flipped}>
                        <div className={styles.band}>
                          <span className={styles.hole} aria-hidden="true" />
                          <span className={`mono ${styles.bandText}`}>LABMAKER</span>
                        </div>
                        <div className={styles.frontBody}>
                          <div className={styles.mono} aria-hidden="true">
                            {isPlaceholder(m.name) ? <PersonGlyph /> : <span>{initials(m.name)}</span>}
                          </div>
                          <h3 className={styles.name}>{m.name}</h3>
                          <p className={styles.role}>{m.role}</p>
                          <p className={`mono ${styles.team}`}>Equipe {m.team}</p>
                        </div>
                        <div className={styles.foot} aria-hidden="true">
                          <span className={`mono ${styles.idTag}`}>ID {id}</span>
                          <span className={styles.barcode} />
                        </div>
                      </div>
                      {/* Verso */}
                      <div className={`${styles.face} ${styles.back}`} inert={!flipped}>
                        <p className={`mono ${styles.backTeam}`}>{m.team} · ID {id}</p>
                        <p className={styles.backName}>{m.name}</p>
                        {m.bio ? <p className={styles.bio}>{m.bio}</p> : null}
                        {tags.length > 0 && (
                          <ul className={styles.chips}>
                            {tags.map((t) => <li key={t} className="mono">{t}</li>)}
                          </ul>
                        )}
                        {links.length > 0 && (
                          <ul className={styles.links}>
                            {links.map((l) => (
                              <li key={l.href + l.label}>
                                <a
                                  href={l.href}
                                  {...(isExternal(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                >
                                  {l.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className={`mono ${styles.caption}`} aria-live="polite">{live}</p>
    </div>
  );
}
