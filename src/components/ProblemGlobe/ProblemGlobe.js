'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LAND, isLand } from '../../data/landMask';
import styles from './ProblemGlobe.module.css';

const RAD = Math.PI / 180;
const MAX_SIZE = 560;
const AUTOPLAY_MS = 6000;
const IDLE_MS = 4000;
const DEFAULT_TILT = 16;
// inclinação máxima ao arrastar para cima/baixo (graus de latitude no centro da vista)
const TILT_LIMIT = 85;
const clampTilt = (t) => Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, t));

// Pontos de terra pré-calculados (uma vez, no carregamento do módulo).
const LAND_POINTS = (() => {
  const pts = [];
  for (let r = 0; r < LAND.rows; r++) {
    const lat = (90 - ((r + 0.5) * 180) / LAND.rows) * RAD;
    // densidade uniforme na esfera: perto dos polos usa só 1 a cada `step` colunas
    // (evita as faixas de pontos amontoados) e alterna o deslocamento entre linhas
    const step = Math.max(1, Math.round(1 / Math.max(Math.cos(lat), 0.05)));
    const offset = r % 2 ? Math.floor(step / 2) : 0;
    for (let c = offset; c < LAND.cols; c += step) {
      if (!isLand(c, r)) continue;
      const lon = (-180 + ((c + 0.5) * 360) / LAND.cols) * RAD;
      pts.push({ sinLat: Math.sin(lat), cosLat: Math.cos(lat), lon });
    }
  }
  return pts;
})();

function normLon(d) {
  return ((((d + 180) % 360) + 360) % 360) - 180;
}

function project(latDeg, lonDeg, lon0Deg, tiltDeg) {
  const phi = latDeg * RAD;
  const dl = (lonDeg - lon0Deg) * RAD;
  const t = tiltDeg * RAD;
  const cosc = Math.sin(t) * Math.sin(phi) + Math.cos(t) * Math.cos(phi) * Math.cos(dl);
  const x = Math.cos(phi) * Math.sin(dl);
  const y = Math.cos(t) * Math.sin(phi) - Math.sin(t) * Math.cos(phi) * Math.cos(dl);
  return { x, y, cosc };
}

function ThemeIcon({ theme }) {
  if (theme === 'acessibilidade') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <circle cx="12" cy="4.6" r="2.1" fill="currentColor" />
        <path d="M5 8.6h14M12 8.6v5.2M12 13.8l-3.6 6.2M12 13.8l3.6 6.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M20 4C10 4 5 8.5 5 14c0 1.3.3 2.4.8 3.3C7.6 14.5 10 12.5 13 11c-2.6 2-4.6 4.3-5.9 7.2.9.5 2 .8 3.2.8 5.5 0 9.7-5 9.7-15z" fill="currentColor" />
    </svg>
  );
}

export default function ProblemGlobe({ problems = [], themes = {}, className = '' }) {
  const [filter, setFilter] = useState('todos');
  const [activeId, setActiveId] = useState(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  // texto anunciado ao leitor de tela: só muda por ação da pessoa (hover/foco/clique/botões), nunca no autoplay
  const [announce, setAnnounce] = useState('');

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const pinRefs = useRef(new Map());
  const stateRef = useRef({
    lon: 0,
    tilt: DEFAULT_TILT,
    targetLon: null,
    targetTilt: DEFAULT_TILT,
    vel: 0,
    velTilt: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    idleUntil: 0,
    lastAdvance: 0,
    size: 0,
    inView: true,
    raf: 0,
    visiblePins: new Set(),
    roving: null,
    shown: new Map(),
  });
  const liveRef = useRef({ filtered: [], activeId: null, paused: false, reduced: false, themes, holdPtr: false, holdFocus: false });

  const filtered = useMemo(
    () => problems.filter((p) => (filter === 'todos' || p.theme === filter) && p.lat != null && p.lon != null),
    [problems, filter],
  );
  const themeKeys = useMemo(() => Array.from(new Set(problems.map((p) => p.theme))), [problems]);
  const active = filtered.find((p) => p.id === activeId) || filtered[0] || null;

  liveRef.current.filtered = filtered;
  liveRef.current.activeId = active ? active.id : null;
  liveRef.current.paused = paused;
  liveRef.current.reduced = reduced;
  liveRef.current.themes = themes;

  const rotateTo = useCallback((p) => {
    const s = stateRef.current;
    const tilt = Math.max(-5, Math.min(35, DEFAULT_TILT + p.lat * 0.25));
    s.vel = 0;
    if (liveRef.current.reduced) {
      s.lon = p.lon;
      s.tilt = tilt;
      s.targetLon = null;
    } else {
      s.targetLon = p.lon;
      s.targetTilt = tilt;
    }
  }, []);

  const selectProblem = useCallback(
    (p, { pause = true } = {}) => {
      if (!p) return;
      setActiveId(p.id);
      setAnnounce(`${p.value} ${p.label}. ${p.scope}. Fonte: ${p.source}.`);
      liveRef.current.activeId = p.id;
      rotateTo(p);
      stateRef.current.lastAdvance = performance.now();
      if (pause) setPaused(true);
    },
    [rotateTo],
  );

  const step = useCallback(
    (dir) => {
      const list = liveRef.current.filtered;
      if (!list.length) return;
      const i = list.findIndex((p) => p.id === liveRef.current.activeId);
      const next = list[(i + dir + list.length * 2) % list.length];
      selectProblem(next, { pause: true });
    },
    [selectProblem],
  );

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const upd = () => setReduced(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);

  // Estado inicial de rotação e ajuste ao trocar filtro
  useEffect(() => {
    const first = filtered[0];
    if (!first) return;
    if (!filtered.some((p) => p.id === liveRef.current.activeId)) {
      setActiveId(first.id);
      liveRef.current.activeId = first.id;
      const s = stateRef.current;
      if (!s.initDone) {
        s.initDone = true;
        s.lon = first.lon;
        s.tilt = Math.max(-5, Math.min(35, DEFAULT_TILT + first.lat * 0.25));
        s.targetTilt = s.tilt;
        s.lastAdvance = performance.now();
      } else {
        rotateTo(first);
        s.lastAdvance = performance.now();
      }
    }
  }, [filtered, rotateTo]);

  // Canvas, loop e observers
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    let last = 0;
    let dpr = 1;
    let tabHidden = document.hidden;

    const resize = () => {
      const w = Math.min(MAX_SIZE, Math.floor(wrap.parentElement.clientWidth));
      if (w < 40) return;
      const nextDpr = Math.min(2, window.devicePixelRatio || 1);
      if (w === s.size && nextDpr === dpr && canvas.width) return;
      dpr = nextDpr;
      s.size = w;
      wrap.style.width = `${w}px`;
      wrap.style.height = `${w}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(w * dpr);
    };

    const draw = () => {
      const size = s.size;
      if (!size) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const R = size * 0.42;

      // halo
      const halo = ctx.createRadialGradient(cx, cx, R * 0.9, cx, cx, R * 1.22);
      halo.addColorStop(0, 'rgba(150,190,255,0.35)');
      halo.addColorStop(1, 'rgba(150,190,255,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cx, R * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // esfera
      const body = ctx.createRadialGradient(cx - R * 0.35, cx - R * 0.4, R * 0.1, cx, cx, R);
      body.addColorStop(0, 'rgba(120,165,255,0.55)');
      body.addColorStop(0.6, 'rgba(41,96,238,0.55)');
      body.addColorStop(1, 'rgba(15,39,128,0.85)');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cx, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,220,255,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // graticule
      ctx.strokeStyle = 'rgba(200,220,255,0.12)';
      ctx.lineWidth = 1;
      const line = (pts) => {
        ctx.beginPath();
        let pen = false;
        for (const [la, lo] of pts) {
          const p = project(la, lo, s.lon, s.tilt);
          if (p.cosc <= 0) {
            pen = false;
            continue;
          }
          const px = cx + R * p.x;
          const py = cx - R * p.y;
          if (pen) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
          pen = true;
        }
        ctx.stroke();
      };
      for (let la = -60; la <= 60; la += 30) {
        const pts = [];
        for (let lo = -180; lo <= 180; lo += 6) pts.push([la, lo]);
        line(pts);
      }
      for (let lo = -180; lo < 180; lo += 30) {
        const pts = [];
        for (let la = -90; la <= 90; la += 6) pts.push([la, lo]);
        line(pts);
      }

      // pontos de terra
      const sinT = Math.sin(s.tilt * RAD);
      const cosT = Math.cos(s.tilt * RAD);
      const lon0 = s.lon * RAD;
      const dotR = Math.max(0.8, R * 0.0436 * 0.42);
      ctx.fillStyle = '#eaf2ff';
      for (let i = 0; i < LAND_POINTS.length; i++) {
        const q = LAND_POINTS[i];
        const dl = q.lon - lon0;
        const cosDl = Math.cos(dl);
        const cosc = sinT * q.sinLat + cosT * q.cosLat * cosDl;
        if (cosc <= 0.02) continue;
        const x = q.cosLat * Math.sin(dl);
        const y = cosT * q.sinLat - sinT * q.cosLat * cosDl;
        ctx.globalAlpha = 0.18 + 0.82 * Math.pow(cosc, 0.7);
        const r = dotR * (0.55 + 0.45 * cosc);
        ctx.beginPath();
        ctx.arc(cx + R * x, cx - R * y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // pinos
      const { filtered: list } = liveRef.current;
      const inList = new Set();
      let firstVisible = null;
      for (const p of list) {
        inList.add(p.id);
        const el = pinRefs.current.get(p.id);
        if (!el) continue;
        const pr = project(p.lat, p.lon, s.lon, s.tilt);
        const vis = pr.cosc > 0.12;
        const px = cx + R * pr.x;
        const py = cx - R * pr.y;
        el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -50%)`;
        const was = s.shown.get(p.id);
        if (was !== vis) {
          s.shown.set(p.id, vis);
          el.style.opacity = vis ? '1' : '0';
          el.style.pointerEvents = vis ? 'auto' : 'none';
          el.tabIndex = -1;
        }
        if (vis) {
          s.visiblePins.add(p.id);
          if (firstVisible === null) firstVisible = p.id;
        } else {
          s.visiblePins.delete(p.id);
        }
      }
      for (const id of Array.from(s.visiblePins)) if (!inList.has(id)) s.visiblePins.delete(id);
      const rov = s.visiblePins.has(s.roving) ? s.roving : firstVisible;
      if (rov !== s.rovingApplied) {
        const prev = pinRefs.current.get(s.rovingApplied);
        if (prev) prev.tabIndex = -1;
        s.rovingApplied = rov;
      }
      const cur = pinRefs.current.get(rov);
      if (cur && cur.tabIndex !== 0) cur.tabIndex = 0;
    };

    const frame = (now) => {
      s.raf = 0;
      if (!s.inView || tabHidden) return;
      const dt = Math.min(50, last ? now - last : 16);
      last = now;
      const live = liveRef.current;

      if (!live.reduced) {
        if (s.targetLon !== null && !s.dragging) {
          const d = normLon(s.targetLon - s.lon);
          const k = 1 - Math.exp(-dt / 220);
          s.lon = normLon(s.lon + d * k);
          s.tilt += (s.targetTilt - s.tilt) * k;
          if (Math.abs(d) < 0.08) {
            s.lon = s.targetLon;
            s.tilt = s.targetTilt;
            s.targetLon = null;
          }
        } else if (!s.dragging && (Math.abs(s.vel) > 0.0005 || Math.abs(s.velTilt) > 0.0005)) {
          // inércia depois de soltar: horizontal (longitude) e vertical (inclinação)
          s.lon = normLon(s.lon + s.vel * dt);
          s.tilt = clampTilt(s.tilt + s.velTilt * dt);
          const decay = Math.exp(-dt / 400);
          s.vel *= decay;
          s.velTilt *= decay;
        }
        // autoplay
        if (!live.paused && !live.holdPtr && !live.holdFocus && !s.dragging && now > s.idleUntil && live.filtered.length > 1) {
          if (now - s.lastAdvance > AUTOPLAY_MS) {
            s.lastAdvance = now;
            const list = live.filtered;
            const i = list.findIndex((p) => p.id === live.activeId);
            const next = list[(i + 1) % list.length];
            setActiveId(next.id);
            live.activeId = next.id;
            s.targetLon = next.lon;
            s.targetTilt = Math.max(-5, Math.min(35, DEFAULT_TILT + next.lat * 0.25));
          }
        } else if (!live.paused) {
          s.lastAdvance = Math.max(s.lastAdvance, now - AUTOPLAY_MS + 1500);
        }
      }
      draw();
      s.raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!s.raf && s.inView && !tabHidden) {
        last = 0;
        s.raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(wrap.parentElement);
    const io = new IntersectionObserver(
      (entries) => {
        s.inView = entries[0].isIntersecting;
        if (s.inView) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(wrap);
    const onVis = () => {
      tabHidden = document.hidden;
      if (tabHidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVis);

    // arrastar
    const down = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      s.dragging = true;
      s.targetLon = null;
      s.vel = 0;
      s.velTilt = 0;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = performance.now();
      canvas.setPointerCapture?.(e.pointerId);
      canvas.classList.add(styles.grabbing);
    };
    const move = (e) => {
      if (!s.dragging) return;
      const now = performance.now();
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      const R = s.size * 0.42;
      // arrastar para a direita gira para o oeste; arrastar para baixo traz o norte para o centro
      const dLon = -(dx / R) / RAD;
      const dTilt = (dy / R) / RAD;
      s.lon = normLon(s.lon + dLon);
      const prevTilt = s.tilt;
      s.tilt = clampTilt(s.tilt + dTilt);
      const dtm = Math.max(1, now - s.lastT);
      s.vel = s.vel * 0.5 + (dLon / dtm) * 0.5;
      s.velTilt = s.velTilt * 0.5 + ((s.tilt - prevTilt) / dtm) * 0.5;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = now;
      s.idleUntil = now + IDLE_MS;
      if (!s.raf) draw();
    };
    const up = (e) => {
      if (!s.dragging) return;
      s.dragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
      canvas.classList.remove(styles.grabbing);
      s.idleUntil = performance.now() + IDLE_MS;
      if (liveRef.current.reduced || performance.now() - s.lastT > 80) {
        s.vel = 0;
        s.velTilt = 0;
      }
      s.vel = Math.max(-0.5, Math.min(0.5, s.vel));
      s.velTilt = Math.max(-0.3, Math.min(0.3, s.velTilt));
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);

    start();
    draw();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, []);

  // Redesenha quando o conjunto de pinos muda (e o loop está parado)
  useEffect(() => {
    stateRef.current.shown.clear();
  }, [filtered]);

  const idle = () => {
    stateRef.current.idleUntil = performance.now() + IDLE_MS;
  };

  const onPinKey = (e, id) => {
    const vis = liveRef.current.filtered.filter((p) => stateRef.current.visiblePins.has(p.id));
    if (!vis.length) return;
    const i = vis.findIndex((p) => p.id === id);
    let ni = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ni = (i + 1) % vis.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ni = (i - 1 + vis.length) % vis.length;
    else if (e.key === 'Home') ni = 0;
    else if (e.key === 'End') ni = vis.length - 1;
    if (ni === null) return;
    e.preventDefault();
    const target = vis[ni].id;
    const s = stateRef.current;
    s.roving = target;
    const prev = pinRefs.current.get(id);
    const el = pinRefs.current.get(target);
    if (prev) prev.tabIndex = -1;
    if (el) {
      el.tabIndex = 0;
      el.focus();
    }
    s.rovingApplied = target;
  };

  const themeCount = themeKeys.length;
  const mapped = problems.filter((p) => p.lat != null && p.lon != null).length;
  const filters = [{ key: 'todos', label: 'Todos' }, ...themeKeys.map((k) => ({ key: k, label: themes[k]?.label || k }))];
  const activeTheme = active ? themes[active.theme] : null;
  const activeColor = activeTheme?.color || '#ffffff';
  const activeText = activeTheme?.textColor || '#ffffff'; // tom claro para texto (contraste); a cor forte fica no pino/borda

  return (
    <div
      className={`${styles.root} ${className}`}
      onPointerEnter={() => {
        liveRef.current.holdPtr = true;
      }}
      onPointerLeave={() => {
        liveRef.current.holdPtr = false;
        idle();
      }}
      onFocus={() => {
        liveRef.current.holdFocus = true;
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          liveRef.current.holdFocus = false;
          idle();
        }
      }}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
      <header className={styles.head}>
        <p className={`${styles.counters} mono`}>
          {problems.length} problemas · {themeCount} temas · {mapped} pontos no mapa
        </p>
        <div className={styles.filters} role="group" aria-label="Filtrar por tema">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.chip} mono`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.stageCol}>
          <div className={styles.stage} ref={wrapRef}>
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
            <div className={styles.pins}>
              {filtered.map((p) => {
                const color = themes[p.theme]?.color || '#fff';
                return (
                  <button
                    key={p.id}
                    type="button"
                    ref={(el) => {
                      if (el) pinRefs.current.set(p.id, el);
                      else pinRefs.current.delete(p.id);
                    }}
                    className={`${styles.pin} ${active && active.id === p.id ? styles.pinActive : ''}`}
                    style={{ '--pin': color, opacity: 0, pointerEvents: 'none' }}
                    tabIndex={-1}
                    aria-label={`${p.value} ${p.label} — ${p.place}`}
                    onClick={() => selectProblem(p, { pause: true })}
                    onMouseEnter={() => {
                      setActiveId(p.id);
                      setAnnounce(`${p.value} ${p.label}. ${p.scope}. Fonte: ${p.source}.`);
                      liveRef.current.activeId = p.id;
                      idle();
                    }}
                    onFocus={() => {
                      stateRef.current.roving = p.id;
                      setActiveId(p.id);
                      setAnnounce(`${p.value} ${p.label}. ${p.scope}. Fonte: ${p.source}.`);
                      liveRef.current.activeId = p.id;
                      idle();
                    }}
                    onKeyDown={(e) => onPinKey(e, p.id)}
                  >
                    <span className={styles.pulse} aria-hidden="true" />
                    <span className={styles.pinDot} aria-hidden="true">
                      <ThemeIcon theme={p.theme} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className={styles.legend}>
            Os pontos no globo são ilustrativos; o alcance real de cada número está no cartão. Confira as fontes antes de citar.
          </p>
        </div>

        <div className={`${styles.card} plate plate--dark`}>
          <span className="screw screw--tl" aria-hidden="true" />
          <span className="screw screw--tr" aria-hidden="true" />
          <span className="screw screw--bl" aria-hidden="true" />
          <span className="screw screw--br" aria-hidden="true" />
          {active ? (
            <div className={styles.cardBody}>
              <div className={styles.tags}>
                <span className={`${styles.tag} mono`} style={{ '--c': activeColor, color: activeText }}>
                  <ThemeIcon theme={active.theme} />
                  {activeTheme?.label || active.theme}
                </span>
                <span className={`${styles.scope} mono`}>{active.scope}</span>
              </div>
              <p className={`${styles.value} display`} style={{ color: activeText }}>
                {active.value}
              </p>
              <h3 className={styles.label}>{active.label}</h3>
              <p className={styles.text}>{active.text}</p>
              <p className={`${styles.meta} mono`}>Fonte: {active.source}</p>
              <p className={`${styles.meta} mono`}>Local do ponto: {active.place} (ilustrativo)</p>
              <p className={styles.labmaker}>
                <strong>No LabMaker:</strong> {active.labmaker}
              </p>
            </div>
          ) : (
            <p className={styles.text}>Nenhum problema nesse filtro.</p>
          )}
          <div className={styles.controls}>
            <button type="button" className={`${styles.ctrl} mono`} onClick={() => step(-1)}>
              ← Anterior
            </button>
            {!reduced && (
              <button
                type="button"
                className={`${styles.ctrl} mono`}
                onClick={() => {
                  if (paused) stateRef.current.lastAdvance = performance.now();
                  setPaused(!paused);
                }}
              >
                {paused ? 'Retomar rotação' : 'Pausar rotação'}
              </button>
            )}
            <button type="button" className={`${styles.ctrl} mono`} onClick={() => step(1)}>
              Próximo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
