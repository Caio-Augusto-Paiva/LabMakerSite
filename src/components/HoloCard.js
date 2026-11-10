"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { isScrolling } from "@/lib/scrollState";
import styles from "./HoloCard.module.css";

/**
 * Card holográfico de uma área.
 *  - inclina em direção ao ponteiro (tilt 3D) e levanta no hover
 *  - o clique VIRA o card e ele fica virado: o verso mostra o resumo da área e um botão
 *    "Acessar página" (link de verdade) — a navegação só acontece quando a pessoa clica nele
 *  - "Voltar", Esc ou clicar fora desvira
 *  - folha holográfica configurável: rainbow | aurora | shards | stars | gold
 */
export default function HoloCard({
  href,
  image,
  number,
  title,
  summary,
  effect = "rainbow",
  className = "",
}) {
  const cardRef = useRef(null);
  const frontRef = useRef(null);
  const goRef = useRef(null);
  const mounted = useRef(false);
  const restoreFocus = useRef(false);
  const [flipped, setFlipped] = useState(false);

  const setVars = (el, mx, my, rx, ry) => {
    el.style.setProperty("--mx", mx);
    el.style.setProperty("--my", my);
    el.style.setProperty("--rx", rx);
    el.style.setProperty("--ry", ry);
  };

  const onPointerMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el || e.pointerType === "touch" || isScrolling()) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
    setVars(
      el,
      x.toFixed(3),
      y.toFixed(3),
      `${((0.5 - y) * 24).toFixed(2)}deg`,
      `${((x - 0.5) * 28).toFixed(2)}deg`
    );
  }, []);

  const onPointerLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) setVars(el, "0.5", "0.5", "0deg", "0deg");
  }, []);

  // foco: ao virar vai para o botão "Acessar página"; ao desvirar por teclado/botão volta para a frente
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (flipped) {
      goRef.current?.focus({ preventScroll: true });
    } else if (restoreFocus.current) {
      frontRef.current?.focus({ preventScroll: true });
    }
    restoreFocus.current = false;
  }, [flipped]);

  // clicar fora do card desvira (sem roubar o foco de onde a pessoa clicou)
  useEffect(() => {
    if (!flipped) return;
    const onDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setFlipped(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [flipped]);

  const unflip = () => {
    restoreFocus.current = true;
    setFlipped(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape" && flipped) {
      e.stopPropagation();
      unflip();
    }
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${flipped ? styles.flipped : ""} ${className}`}
      data-effect={effect}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    >
      <span className={styles.shadow} aria-hidden="true" />
      <span className={styles.inner}>
        {/* frente: botão que vira o card */}
        <button
          ref={frontRef}
          type="button"
          className={`${styles.face} ${styles.front}`}
          aria-label={`${title}: virar o card para ver o resumo da área`}
          aria-expanded={flipped}
          inert={flipped}
          onClick={() => setFlipped(true)}
        >
          <span className={styles.art}>
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 420px) 280px, (max-width: 999px) 45vw, 300px"
              className={styles.img}
            />
          </span>
          <span className={styles.caption}>
            <span className={styles.no}>{number}</span>
            <span className={styles.title}>{title}</span>
            <span className={styles.arrow} aria-hidden="true">↻</span>
          </span>
          <span className={styles.foil} aria-hidden="true" />
          <span className={styles.glare} aria-hidden="true" />
        </button>

        {/* verso: resumo + botão que leva à página da área */}
        {/* clicar em qualquer ponto do verso (exceto no link) desvira o card */}
        <div
          className={`${styles.face} ${styles.back}`}
          inert={!flipped}
          onClick={(e) => {
            if (e.target.closest("a")) return;
            unflip();
          }}
        >
          <div className={styles.backTop}>
            <span className={styles.no}>{number}</span>
            <button type="button" className={styles.backBtn} onClick={unflip}>
              ← Voltar
            </button>
          </div>
          <p className={styles.backTitle}>{title}</p>
          <p className={styles.backText}>{summary}</p>
          <Link ref={goRef} href={href} className={styles.goBtn}>
            Acessar página <span aria-hidden="true">→</span>
          </Link>
          {/* sem folha holográfica no verso: ela atrapalharia a leitura do texto */}
          <span className={styles.glare} aria-hidden="true" />
        </div>
      </span>
    </div>
  );
}
