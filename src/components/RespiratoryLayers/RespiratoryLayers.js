'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { isScrolling } from '@/lib/scrollState';
import styles from './RespiratoryLayers.module.css';
import { LAYERS } from './respiratoryArt';

const COUNT = LAYERS.length;
const pad = (n) => `0${n}`;

export default function RespiratoryLayers({ className = '' }) {
  const [hovering, setHovering] = useState(false);
  const [touchOpen, setTouchOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [focusIdx, setFocusIdx] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [forceOpen, setForceOpen] = useState(false);
  const [breathOn, setBreathOn] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [scale, setScale] = useState(0.8);
  const [announce, setAnnounce] = useState('');

  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const closeTimer = useRef(null);
  const sayTimer = useRef(null);
  const btnRefs = useRef([]);
  const openRef = useRef(false);
  const lastPointer = useRef('mouse');
  const sceneId = useId();

  const isOpen = forceOpen || hovering || touchOpen || pinned !== null || focusIdx !== null;
  openRef.current = isOpen;
  const current = hoverIdx ?? focusIdx ?? pinned ?? 0;
  const breathing = breathOn && !reduced;

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // escala da pilha conforme o palco
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) setScale(Math.max(0.3, Math.min(r.width / 440, r.height / 430)));
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // limpeza de timeouts
  useEffect(
    () => () => {
      clearTimeout(closeTimer.current);
      clearTimeout(sayTimer.current);
    },
    []
  );

  const say = useCallback((msg) => {
    clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setAnnounce(msg), 250);
  }, []);

  const setTilt = (deg) => {
    sceneRef.current?.style.setProperty('--rz', `${deg}deg`);
  };

  const onPointerEnter = (e) => {
    if (e.pointerType === 'touch') return;
    clearTimeout(closeTimer.current);
    setHovering(true);
  };

  const onPointerMove = (e) => {
    if (e.pointerType === 'touch' || isScrolling()) return;
    clearTimeout(closeTimer.current);
    const r = stageRef.current.getBoundingClientRect();
    if (!r.height || !r.width) return;
    const yf = Math.min(0.999, Math.max(0, (e.clientY - r.top) / r.height));
    const xf = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHovering(true);
    setHoverIdx(Math.floor(yf * COUNT));
    if (!reduced) setTilt(((xf - 0.5) * 12).toFixed(2));
  };

  const onPointerLeave = (e) => {
    if (e.pointerType === 'touch') return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setHovering(false);
      setHoverIdx(null);
      setTilt(0);
    }, 400);
  };

  const onPointerDown = (e) => {
    lastPointer.current = e.pointerType;
  };

  const togglePin = (i) => {
    const next = pinned === i ? null : i;
    setPinned(next);
    const l = LAYERS[i];
    say(next === null ? `Camada solta: ${l.name}.` : `Camada fixada: ${l.name}. ${l.text}`);
  };

  // As placas se sobrepõem no espaço 3D, então o clique no palco usa a mesma faixa de Y do hover.
  // No toque: o 1º toque só abre; os seguintes fixam a camada da altura tocada.
  const onStageClick = (e) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r || !r.height) return;
    if (lastPointer.current === 'touch' && !openRef.current) {
      setTouchOpen(true);
      return;
    }
    const yf = Math.min(0.999, Math.max(0, (e.clientY - r.top) / r.height));
    togglePin(Math.floor(yf * COUNT));
  };

  // Esc solta a camada fixada e fecha a pilha
  const onRootKeyDown = (e) => {
    if (e.key !== 'Escape') return;
    setPinned(null);
    setForceOpen(false);
    setTouchOpen(false);
    setHovering(false);
    setHoverIdx(null);
    setTilt(0);
  };

  const toggleOpen = () => {
    if (isOpen) {
      setForceOpen(false);
      setTouchOpen(false);
      setHovering(false);
      setHoverIdx(null);
      setPinned(null);
      setTilt(0);
    } else {
      setForceOpen(true);
    }
  };

  const onListKey = (e, i) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowDown' ? 1 : COUNT - 1)) % COUNT;
    btnRefs.current[n]?.focus();
  };

  const onListFocus = (i) => {
    setFocusIdx(i);
    const l = LAYERS[i];
    say(`Camada ${l.number} de ${COUNT}: ${l.name}. ${l.text}`);
  };

  const onListBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocusIdx(null);
  };

  const info = LAYERS[current];
  const cls = [
    styles.root,
    isOpen ? styles.open : '',
    breathing ? styles.breathing : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} onKeyDown={onRootKeyDown}>
      <div
        ref={stageRef}
        id={sceneId}
        className={styles.stage}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onClick={onStageClick}
      >
        <div
          ref={sceneRef}
          className={styles.scene}
          style={{ '--s': scale.toFixed(3) }}
          aria-hidden="true"
        >
          {LAYERS.map((l, i) => {
            const active = isOpen && current === i;
            const dim = isOpen && !active;
            const slabCls = [
              styles.slab,
              active ? styles.active : '',
              dim ? styles.dim : '',
              pinned === i ? styles.pinned : '',
              l.id === 'pulmoes' ? styles.lungsSlab : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div key={l.id} className={slabCls} style={{ '--i': i }}>
                <l.Art className={styles.art} />
              </div>
            );
          })}
        </div>
        {isOpen ? (
          <div
            className={styles.callout}
            style={{ top: `${((current + 0.5) / COUNT) * 100}%` }}
            aria-hidden="true"
          >
            <span className={styles.calloutDot} />
          </div>
        ) : null}
        <span className={`${styles.phase} mono`} aria-hidden="true">
          <span className={styles.phaseIn}>INSPIRAÇÃO</span>
          <span className={styles.phaseOut}>EXPIRAÇÃO</span>
        </span>
      </div>

      <div className={styles.side}>
        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.ctrl} mono`}
            aria-expanded={isOpen}
            aria-controls={sceneId}
            onClick={toggleOpen}
          >
            {isOpen ? 'Fechar camadas' : 'Abrir camadas'}
          </button>
          <button
            type="button"
            className={`${styles.ctrl} mono`}
            aria-pressed={breathing}
            disabled={reduced}
            title={reduced ? 'Desativado: movimento reduzido' : undefined}
            onClick={() => setBreathOn((v) => !v)}
          >
            Respirar
          </button>
        </div>

        <ol className={styles.list} aria-label="Camadas do sistema respiratório" onBlur={onListBlur}>
          {LAYERS.map((l, i) => (
            <li key={l.id}>
              <button
                type="button"
                ref={(el) => {
                  btnRefs.current[i] = el;
                }}
                className={styles.item}
                aria-current={isOpen && current === i ? 'true' : undefined}
                aria-pressed={pinned === i}
                onClick={() => togglePin(i)}
                onFocus={() => onListFocus(i)}
                onKeyDown={(e) => onListKey(e, i)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== 'touch') setHoverIdx(i);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType !== 'touch') setHoverIdx(null);
                }}
              >
                <span className={`${styles.itemNum} mono`}>{pad(l.number)}</span>
                <span className={styles.itemName}>{l.name}</span>
                <span className={`${styles.itemShort} mono`}>{l.short}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.info}>
          <p className={`${styles.infoNum} display`}>
            {pad(info.number)}/{pad(COUNT)}
          </p>
          <h3 className={`${styles.infoName} display`}>{info.name}</h3>
          <p className={styles.infoText}>{info.text}</p>
        </div>

        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>
    </div>
  );
}
