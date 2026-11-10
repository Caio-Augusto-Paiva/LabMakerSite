'use client';

import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './SortLab.module.css';

/**
 * SortLab: jogo genérico de "separar em classes" (arrastar, clicar ou teclado), com painéis que travam
 * e um efeito especial de vitória em estilo blueprint. Usado nos laboratórios de circuitos e outros.
 *
 * Props:
 *   groups  [{ id, name, short, role, tone }]   as classes (um painel por classe)
 *   items   [{ id, name, group, fact, plural? }] os cartões
 *   art     { [itemId]: ({ className }) => <svg/> } arte hairline de cada cartão
 *   Victory ({ className, drawn }) => <svg/>      desenho da tela de vitória (desenha quando drawn = true)
 *   copy    { intro, unit, reportTag, scaleTag, stampTitle, bannerText, emptyTray, victoryShape, dims? }
 */
const SLOTS = 3; // itens por painel
const DRAG_THRESHOLD = 5; // px de movimento para virar arrasto

/* ---------- Estado do jogo (regras) ---------- */

/** Intercala itens de classes diferentes: antes do embaralhamento (1º render) a bandeja não agrupa as respostas. */
function interleave(organs) {
  const groups = new Map();
  organs.forEach((o) => {
    if (!groups.has(o.group)) groups.set(o.group, []);
    groups.get(o.group).push(o.id);
  });
  const lists = [...groups.values()];
  const out = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) lists.forEach((l) => { if (i < l.length) out.push(l[i]); });
  return out;
}

function makeInitial(organs, intro) {
  return {
    // Ordem inicial fixa (igual no servidor e no cliente); o embaralhamento real ocorre em useEffect
    order: interleave(organs),
    placed: {}, // { [systemId]: [organId, ...] }
    errors: 0,
    selected: null,
    feedback: { kind: 'idle', text: intro },
    flash: null, // { panelId, kind: 'ok' | 'err', n }
    overlay: false,
    won: false,
    n: 0,
  };
}

function reducer(state, action) {
  const { organs, systems, intro } = action.data || {};
  switch (action.type) {
    case 'SHUFFLE':
      return { ...state, order: action.order };
    case 'RESET':
      return { ...makeInitial(organs, intro), order: action.order };
    case 'SELECT':
      return { ...state, selected: state.selected === action.id ? null : action.id };
    case 'CLEAR_SELECT':
      return state.selected ? { ...state, selected: null } : state;
    case 'NOTICE':
      return { ...state, n: state.n + 1, feedback: { kind: 'idle', text: `${action.text}${state.n % 2 ? '' : '​'}` } };
    case 'OVERLAY':
      return { ...state, overlay: action.value };
    case 'PLACE': {
      const organ = organs.find((o) => o.id === action.organId);
      const system = systems.find((s) => s.id === action.panelId);
      if (!organ || !system) return state;
      const list = state.placed[system.id] || [];
      // Regra do relé: painel travado não aceita mais itens; item já colocado não volta
      if (list.length >= SLOTS) return state;
      if (Object.values(state.placed).some((l) => l.includes(organ.id))) return state;
      const n = state.n + 1;
      // ERRO: não revela o painel certo
      if (organ.group !== system.id) {
        return {
          ...state,
          selected: null,
          errors: state.errors + 1,
          n,
          flash: { panelId: system.id, kind: 'err', n },
          feedback: {
            kind: 'err',
            // o caractere invisível alterna para o leitor de tela reanunciar um erro repetido
            text: `${organ.name} ${organ.plural ? 'não pertencem' : 'não pertence'} à classe "${system.name}". Tente outro painel.${n % 2 ? '​' : ''}`,
          },
        };
      }
      // ACERTO
      const placed = { ...state.placed, [system.id]: [...list, organ.id] };
      const total = Object.values(placed).reduce((a, l) => a + l.length, 0);
      const won = total === organs.length;
      const locked = list.length + 1 >= SLOTS;
      return {
        ...state,
        placed,
        selected: null,
        n,
        flash: { panelId: system.id, kind: 'ok', n },
        won,
        overlay: won ? true : state.overlay,
        feedback: {
          kind: 'ok',
          text: won
            ? `Laboratório concluído! ${organ.name}: ${organ.fact}`
            : `${organ.name}: ${organ.fact}${locked ? ` Painel ${system.short.toLowerCase()} travado.` : ''}`,
        },
      };
    }
    default:
      return state;
  }
}

function shuffled(ids) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rankFor(errors) {
  if (errors === 0) return 'Precisão total';
  if (errors <= 3) return 'Boa leitura';
  return 'Continue treinando';
}

const pad2 = (n) => String(n).padStart(2, '0');

/* ---------- Componente ---------- */

export default function SortLab({ groups: systems = [], items: organs = [], art = {}, Victory = null, copy = {}, className = '' }) {
  const titleId = useId();
  const unit = copy.unit || 'itens';
  const data = useMemo(() => ({ systems, organs, intro: copy.intro }), [systems, organs, copy.intro]);
  const [state, rawDispatch] = useReducer(reducer, { organs, intro: copy.intro }, (a) => makeInitial(a.organs, a.intro));
  const dispatch = useCallback((a) => rawDispatch({ ...a, data }), [data]);

  const [drag, setDrag] = useState(null); // { organId, x, y, w, h, offX, offY, hover }
  const [backId, setBackId] = useState(null); // cartão voltando à bandeja
  const [reduced, setReduced] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [mounted, setMounted] = useState(false); // portais só existem no cliente

  const dragRef = useRef(null);
  const suppressClick = useRef(false);
  const placeRef = useRef(null);
  const wasOpen = useRef(false);
  const rootRef = useRef(null);
  const dialogRef = useRef(null);
  const bannerRef = useRef(null);
  const lastN = useRef(0);

  const organById = useMemo(() => Object.fromEntries(organs.map((o) => [o.id, o])), [organs]);
  const total = organs.length;
  const placedIds = useMemo(() => new Set(Object.values(state.placed).flat()), [state.placed]);
  const correct = placedIds.size;
  const lockedCount = systems.filter((s) => (state.placed[s.id] || []).length >= SLOTS).length;
  const tray = state.order.filter((id) => !placedIds.has(id));
  const selectedOrgan = state.selected ? organById[state.selected] : null;

  // Embaralha só no cliente, ao montar
  useEffect(() => {
    setMounted(true);
    dispatch({ type: 'SHUFFLE', order: shuffled(state.order) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const upd = () => setReduced(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);

  // Desenho do corpo no overlay (já desenhado se movimento reduzido)
  useEffect(() => {
    if (!state.overlay) {
      setDrawn(false);
      return undefined;
    }
    const t = setTimeout(() => setDrawn(true), reduced ? 0 : 80);
    return () => clearTimeout(t);
  }, [state.overlay, reduced]);

  // Diálogo de vitória (modal): o resto da página fica inerte e sem rolagem enquanto ele está aberto.
  useEffect(() => {
    if (!state.overlay) return undefined;
    const behind = [
      document.getElementById('conteudo'),
      document.querySelector('header'),
      document.querySelector('footer'),
    ].filter(Boolean);
    behind.forEach((el) => el.setAttribute('inert', ''));
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      behind.forEach((el) => el.removeAttribute('inert'));
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [state.overlay]);

  // Foco: ao abrir vai para o diálogo; ao fechar volta para "Rever resultado" (venceu) ou para o 1º cartão (reiniciou).
  useEffect(() => {
    if (state.overlay && !wasOpen.current) {
      wasOpen.current = true;
      const id = requestAnimationFrame(() => dialogRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    if (!state.overlay && wasOpen.current) {
      wasOpen.current = false;
      const id = requestAnimationFrame(() => {
        (bannerRef.current || rootRef.current?.querySelector('[data-card]'))?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [state.overlay, mounted]);

  // Depois de uma jogada, se o botão que tinha o foco saiu da bandeja, devolve o foco ao próximo cartão.
  useEffect(() => {
    if (state.n === lastN.current) return;
    lastN.current = state.n;
    if (state.overlay) return;
    const root = rootRef.current;
    const a = document.activeElement;
    if (root && (!a || a === document.body || !root.contains(a))) {
      (root.querySelector('[data-card]') || root.querySelector('[data-reset]'))?.focus({ preventScroll: true });
    }
  }, [state.n, state.overlay]);

  const place = useCallback(
    (organId, panelId) => dispatch({ type: 'PLACE', organId, panelId }),
    [dispatch],
  );
  placeRef.current = place;

  const restart = useCallback(() => {
    dispatch({ type: 'RESET', order: shuffled(organs.map((o) => o.id)) });
  }, [dispatch, organs]);

  /* ---------- Teclado global: Esc e teclas 1/2/3 ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t instanceof Element && t.closest('input, textarea, select, [contenteditable="true"]')) return;
      const inRoot = !!(rootRef.current && t instanceof Node && rootRef.current.contains(t));
      if (e.key === 'Escape') {
        if (dragRef.current) return; // o arrasto trata o próprio Esc
        if (state.overlay) dispatch({ type: 'OVERLAY', value: false });
        else if (state.selected && inRoot) dispatch({ type: 'CLEAR_SELECT' });
        return;
      }
      // teclas 1/2/3 só valem com o foco dentro do jogo
      if (state.selected && !state.overlay && inRoot && /^[1-9]$/.test(e.key)) {
        const sys = systems[Number(e.key) - 1];
        if (!sys) return;
        e.preventDefault();
        if ((state.placed[sys.id] || []).length < SLOTS) place(state.selected, sys.id);
        else dispatch({ type: 'NOTICE', text: `${sys.name} já está travado. Escolha outro painel.` });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.overlay, state.selected, state.placed, systems, place, dispatch]);

  /* ---------- Arrastar e soltar (Pointer Events) ---------- */

  // Limpa listeners de um arrasto em andamento ao desmontar
  useEffect(() => () => dragRef.current?.cleanup?.(), []);

  // Qual painel está sob o ponteiro? Em contextos 3D (preserve-3d + rotateX) o elementFromPoint
  // pode devolver só o contêiner e pular os filhos do painel; elementsFromPoint percorre todas as
  // camadas. Plano B: comparar com o retângulo de cada painel.
  const panelAt = (x, y) => {
    let el = null;
    for (const hit of document.elementsFromPoint(x, y)) {
      el = hit.closest('[data-panel]');
      if (el) break;
    }
    if (!el) {
      el =
        Array.from(rootRef.current?.querySelectorAll('[data-panel]') || []).find((p) => {
          const r = p.getBoundingClientRect();
          return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        }) || null;
    }
    if (!el || el.getAttribute('aria-disabled') === 'true') return null;
    return el.getAttribute('data-panel');
  };

  const onCardPointerDown = (e, organId) => {
    // toque: sem arrastar (a página precisa rolar com o dedo); use selecionar e escolher o painel
    if (e.pointerType === 'touch') return;
    if (e.button !== 0 || dragRef.current) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const d = {
      organId,
      startX: e.clientX,
      startY: e.clientY,
      offX: e.clientX - rect.left,
      offY: e.clientY - rect.top,
      w: rect.width,
      h: rect.height,
      active: false,
      hover: null,
      pointerId: e.pointerId,
    };
    dragRef.current = d;
    try { el.setPointerCapture(e.pointerId); } catch { /* ignora */ }

    // Impede rolagem da página enquanto o arrasto está ativo (listener não passivo)
    const onTouchMove = (ev) => { if (d.active) ev.preventDefault(); };

    const finish = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKeyDrag, true);
      window.removeEventListener('touchmove', onTouchMove);
      try { el.releasePointerCapture(d.pointerId); } catch { /* ignora */ }
      dragRef.current = null;
      setDrag(null);
    };
    d.cleanup = finish;

    // Cancelar: o cartão volta à bandeja com animação
    const abort = () => {
      const wasActive = d.active;
      finish();
      if (wasActive) {
        suppressClick.current = true;
        setTimeout(() => { suppressClick.current = false; }, 60);
        setBackId(organId);
        setTimeout(() => setBackId(null), 450);
      }
    };

    function onMove(ev) {
      if (ev.pointerId !== d.pointerId) return;
      if (!d.active) {
        if (Math.hypot(ev.clientX - d.startX, ev.clientY - d.startY) < DRAG_THRESHOLD) return;
        d.active = true;
        dispatch({ type: 'CLEAR_SELECT' });
      }
      d.hover = panelAt(ev.clientX, ev.clientY);
      setDrag({ organId, x: ev.clientX, y: ev.clientY, w: d.w, h: d.h, offX: d.offX, offY: d.offY, hover: d.hover });
    }

    function onUp(ev) {
      if (ev.pointerId !== d.pointerId) return;
      if (!d.active) { finish(); return; } // toque simples: o onClick seleciona
      const target = panelAt(ev.clientX, ev.clientY);
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 60);
      if (target) {
        finish();
        placeRef.current(organId, target); // solta no painel sob o ponteiro
      } else {
        abort(); // fora de painel: volta à bandeja
      }
    }

    function onCancel(ev) {
      if (ev.pointerId === d.pointerId) abort();
    }

    function onKeyDrag(ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); abort(); }
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKeyDrag, true);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
  };

  /* ---------- Clique em dois passos / teclado ---------- */

  const onCardClick = (id) => {
    if (suppressClick.current) return;
    dispatch({ type: 'SELECT', id });
  };

  const onPanelActivate = (sys) => {
    if ((state.placed[sys.id] || []).length >= SLOTS) {
      dispatch({ type: 'NOTICE', text: `${sys.name} já está travado. Escolha outro painel.` });
      return;
    }
    if (state.selected) place(state.selected, sys.id);
    else dispatch({ type: 'NOTICE', text: 'Selecione um cartão da bandeja primeiro.' });
  };

  const onPanelKey = (e, sys) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPanelActivate(sys);
    }
  };

  /* ---------- Render ---------- */

  const toneVars = Object.fromEntries(systems.map((s) => [`--tone-${s.id}`, s.tone]));
  const rank = rankFor(state.errors);
  const errLabel = `${state.errors} ${state.errors === 1 ? 'erro' : 'erros'}`;

  const renderArt = (id, cls) => {
    const Art = art[id];
    return Art ? <Art className={cls} /> : null;
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${className}`}
      style={toneVars}
      data-open={state.overlay ? 'true' : 'false'}
      data-reduced={reduced ? 'true' : 'false'}
    >
      {/* 1) Placar */}
      <div className={styles.score} role="group" aria-label="Placar">
        <div className={styles.cell}>
          <span className={`mono ${styles.cellLabel}`}>ACERTOS</span>
          <span className={`mono ${styles.digits}`}>
            {pad2(correct)}<i>/{pad2(total)}</i>
          </span>
        </div>
        <div className={styles.cell}>
          <span className={`mono ${styles.cellLabel}`}>ERROS</span>
          <span className={`mono ${styles.digits} ${state.errors ? styles.digitsErr : ''}`}>{pad2(state.errors)}</span>
        </div>
        <div className={styles.cell}>
          <span className={`mono ${styles.cellLabel}`}>PAINÉIS TRAVADOS</span>
          <span className={`mono ${styles.digits}`}>
            {lockedCount}<i>/{systems.length}</i>
          </span>
        </div>
        <button type="button" data-reset className={`mono ${styles.reset}`} onClick={restart}>
          Reiniciar
        </button>
      </div>

      {/* 2) Cena com os painéis */}
      <div className={styles.scene}>
        {systems.map((sys, idx) => {
          const list = state.placed[sys.id] || [];
          const locked = list.length >= SLOTS;
          const flash = state.flash && state.flash.panelId === sys.id ? state.flash : null;
          const par = flash ? flash.n % 2 : 0; // alterna A/B para reiniciar animações CSS
          const hover = drag?.hover === sys.id;
          const label = locked
            ? `${sys.name}: travado, ${SLOTS} de ${SLOTS} ${unit}`
            : selectedOrgan
              ? `Colocar ${selectedOrgan.name} em ${sys.name}`
              : `${sys.name}: ${list.length} de ${SLOTS} ${unit}`;
          return (
            <div key={sys.id} className={styles.panelWrap} style={{ '--tone': sys.tone }}>
              <div
                className={`${styles.panel} ${flash?.kind === 'err' ? styles[`shake${par}`] : ''}`}
                data-panel={sys.id}
                data-hover={hover ? 'true' : 'false'}
                data-locked={locked ? 'true' : 'false'}
                data-armed={selectedOrgan && !locked ? 'true' : 'false'}
                role="button"
                tabIndex={0}
                aria-disabled={locked ? 'true' : 'false'}
                aria-label={label}
                aria-keyshortcuts={String(idx + 1)}
                onClick={() => onPanelActivate(sys)}
                onKeyDown={(e) => onPanelKey(e, sys)}
              >
                <span className={`mono ${styles.num}`} aria-hidden="true">0{idx + 1}</span>

                {/* Buzzer */}
                <span className={styles.buzzer} aria-hidden="true">
                  <span
                    className={`${styles.lamp} ${locked ? styles.lampOn : ''} ${
                      flash ? styles[`${flash.kind === 'ok' ? 'buzzOk' : 'buzzErr'}${par}`] : ''
                    }`}
                  />
                  {flash?.kind === 'err' && <span key={flash.n} className={styles.ring} />}
                </span>

                <h3 className={`display ${styles.name}`}>{sys.name}</h3>
                <p className={styles.role}>{sys.role}</p>

                {/* Slots */}
                <div className={styles.slots}>
                  {Array.from({ length: SLOTS }).map((_, i) => {
                    const o = organById[list[i]];
                    return (
                      <div key={i} className={styles.slot} data-filled={o ? 'true' : 'false'}>
                        {o ? (
                          <div key={o.id} className={styles.slotItem}>
                            {renderArt(o.id, styles.slotArt)}
                            <span className={styles.slotName}>{o.name}</span>
                            <span className={styles.trace} aria-hidden="true" />
                          </div>
                        ) : (
                          <span className={`mono ${styles.slotIdx}`} aria-hidden="true">{i + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Relé de bloqueio */}
                <div className={styles.relay} aria-hidden="true">
                  <span className={styles.relayTrack}><span className={styles.relayBar} /></span>
                  <span className={`mono ${styles.lockTag}`}>
                    {locked ? (
                      <>
                        <svg viewBox="0 0 16 16" className={styles.check} aria-hidden="true">
                          <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                        TRAVADO
                      </>
                    ) : (
                      `${list.length}/${SLOTS}`
                    )}
                  </span>
                </div>
              </div>

              {/* Base isométrica */}
              <svg className={styles.platform} viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true">
                <polygon points="40,6 290,6 260,60 10,60" fill="rgba(255,255,255,.05)" stroke="var(--tone)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <polyline points="10,60 10,67 260,67 260,60" fill="none" stroke="var(--tone)" strokeOpacity=".6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <polyline points="260,67 290,13 290,6" fill="none" stroke="var(--tone)" strokeOpacity=".6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* 3) Bandeja */}
      <div className={styles.tray}>
        <div className={`mono ${styles.trayHead}`}>
          <span>BANDEJA · {tray.length} {tray.length === 1 ? 'peça' : 'peças'}</span>
          <span className={styles.hint}>Arraste · ou selecione e escolha a classe</span>
        </div>
        <div className={styles.cards}>
          {tray.map((id) => {
            const o = organById[id];
            if (!o) return null;
            const isSel = state.selected === id;
            const isDrag = drag?.organId === id;
            return (
              <button
                key={id}
                type="button"
                className={`${styles.card} ${backId === id ? styles.back : ''}`}
                aria-pressed={isSel}
                data-card
                data-dragging={isDrag ? 'true' : 'false'}
                onPointerDown={(e) => onCardPointerDown(e, id)}
                onClick={() => onCardClick(id)}
              >
                {renderArt(id, styles.cardArt)}
                <span className={styles.cardName}>{o.name}</span>
              </button>
            );
          })}
          {tray.length === 0 && <p className={`mono ${styles.empty}`}>{copy.emptyTray || 'Bandeja vazia'}</p>}
        </div>
      </div>

      {/* 3b) Escolha do sistema: alternativa ao arrastar (essencial no toque) */}
      {selectedOrgan && !state.overlay && (
        <div
          className={styles.picker}
          role="group"
          aria-label={`Escolher a classe de ${selectedOrgan.name}`}
        >
          <span className={`mono ${styles.pickerText}`}>Colocar {selectedOrgan.name} em:</span>
          {systems.map((sys, idx) => {
            const full = (state.placed[sys.id] || []).length >= SLOTS;
            return (
              <button
                key={sys.id}
                type="button"
                className={`mono ${styles.pickerBtn}`}
                style={{ '--tone': sys.tone }}
                disabled={full}
                aria-keyshortcuts={String(idx + 1)}
                onClick={() => place(selectedOrgan.id, sys.id)}
              >
                {sys.short}
                {full ? ' · travado' : ''}
              </button>
            );
          })}
        </div>
      )}

      {/* 4) Legenda / feedback */}
      <p className={styles.feedback} data-kind={state.feedback.kind} aria-live="polite">
        {state.won
          ? `Vitória: ${(copy.stampTitle || 'concluído').toLowerCase()}, ${correct} de ${total} acertos e ${errLabel}. ${rank}.`
          : state.feedback.text}
      </p>

      {state.won && !state.overlay && (
        <div className={styles.banner}>
          <span className={`mono ${styles.bannerText}`}>{copy.bannerText || 'Concluído'} · {rank}</span>
          <button ref={bannerRef} type="button" className={`mono ${styles.bannerBtn}`} onClick={() => dispatch({ type: 'OVERLAY', value: true })}>
            Rever resultado
          </button>
        </div>
      )}

      {/* Fantasma do arrasto */}
      {mounted && drag && organById[drag.organId] && createPortal(
        <div
          className={`${styles.card} ${styles.ghost}`}
          style={{ left: drag.x - drag.offX, top: drag.y - drag.offY, width: drag.w, height: drag.h }}
          aria-hidden="true"
        >
          {renderArt(drag.organId, styles.cardArt)}
          <span className={styles.cardName}>{organById[drag.organId].name}</span>
        </div>,
        document.body,
      )}

      {/* E) Vitória */}
      {mounted && state.overlay && createPortal(
        <div
          ref={dialogRef}
          className={styles.overlay}
          style={toneVars}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <span className={`${styles.bracket} ${styles.brTL}`} aria-hidden="true" />
          <span className={`${styles.bracket} ${styles.brTR}`} aria-hidden="true" />
          <span className={`${styles.bracket} ${styles.brBL}`} aria-hidden="true" />
          <span className={`${styles.bracket} ${styles.brBR}`} aria-hidden="true" />
          <span className={`mono ${styles.ovTag} ${styles.ovTagL}`}>{copy.reportTag} · REL. {pad2(total)}/{pad2(total)}</span>
          <span className={`mono ${styles.ovTag} ${styles.ovTagR}`}>{copy.scaleTag}</span>

          <div className={styles.stage}>
            <svg className={styles.reg} viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M20 2v36M2 20h36" stroke="currentColor" strokeWidth="1" />
            </svg>
            <div
              className={styles.bodyBox}
              style={copy.victoryShape === 'landscape' ? { width: 'min(88vw, 620px, 77vh)', height: 'auto', aspectRatio: '4 / 3' } : undefined}
            >
              {Victory && <Victory className={styles.body} drawn={drawn} />}
              {!reduced && <span className={styles.beam} aria-hidden="true" />}
              {copy.dims && (
                <>
                  <span className={`mono ${styles.dimV}`} aria-hidden="true"><i>{copy.dims.v}</i></span>
                  <span className={`mono ${styles.dimH}`} aria-hidden="true"><i>{copy.dims.h}</i></span>
                </>
              )}
            </div>

            <div className={styles.stamp}>
              <span id={titleId} className={`display ${styles.stampTitle}`}>{copy.stampTitle}</span>
              <span className={`mono ${styles.stampScore}`}>{correct}/{total} · {errLabel}</span>
              <span className={`mono ${styles.stampRank}`}>{rank}</span>
            </div>
          </div>

          <ul className={`mono ${styles.legend}`}>
            {systems.map((s) => (
              <li key={s.id}><i style={{ background: s.tone }} />{s.short}</li>
            ))}
          </ul>

          <div className={styles.ovActions}>
            <button type="button" className={`mono ${styles.ovPrimary}`} onClick={restart}>
              Jogar de novo
            </button>
            <button type="button" className={`mono ${styles.ovGhost}`} onClick={() => dispatch({ type: 'OVERLAY', value: false })}>
              Fechar
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
