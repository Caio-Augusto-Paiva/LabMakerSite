"use client";

import { useEffect, useState } from "react";
import styles from "./SectionRail.module.css";

/**
 * Trilho vertical de seções (como o índice lateral da referência 2).
 * items: [{ id, label }]
 */
export default function SectionRail({ items }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className={styles.rail} aria-label="Seções da página">
      <ol>
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "true" : undefined}
              title={it.label}
            >
              <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.label}>{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
