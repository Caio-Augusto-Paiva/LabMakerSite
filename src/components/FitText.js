"use client";

import { useEffect, useRef } from "react";
import styles from "./FitText.module.css";

/**
 * Faz o texto ocupar exatamente a largura do contêiner, em qualquer tela,
 * sem nunca cortar letras.
 *
 * A largura do texto é proporcional ao font-size, então uma única medição basta:
 * novo = atual × (largura do contêiner ÷ largura medida). Re-medimos quando o contêiner
 * muda, quando a fonte web termina de carregar e quando o próprio texto muda de tamanho
 * (por exemplo, troca da fonte reserva pela fonte final). Só aplica se a diferença passar
 * de 0,5px, então o ciclo converge e não entra em loop.
 */
export default function FitText({ children, className = "", min = 24, max = 700 }) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;

    const fit = () => {
      const avail = wrap.clientWidth;
      const current = parseFloat(getComputedStyle(text).fontSize);
      const w = text.getBoundingClientRect().width;
      if (!avail || !w || !current) return;
      const next = Math.max(min, Math.min(max, (current * avail) / w));
      if (Math.abs(next - current) > 0.5) text.style.fontSize = `${next}px`;
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    ro.observe(text);

    const onFonts = () => fit();
    document.fonts?.addEventListener?.("loadingdone", onFonts);
    document.fonts?.ready.then(fit);
    // rede de segurança para navegadores que atrasam o carregamento da fonte
    const t1 = setTimeout(fit, 400);
    const t2 = setTimeout(fit, 1500);

    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", onFonts);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [children, min, max]);

  return (
    <span ref={wrapRef} className={styles.wrap}>
      <span ref={textRef} className={`${styles.text} ${className}`}>
        {children}
      </span>
    </span>
  );
}
