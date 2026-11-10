"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { areas } from "@/data/areas";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const toggleRef = useRef(null);
  const barRef = useRef(null);
  const restoreFocus = useRef(false);

  // fecha ao navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // trava rolagem + Esc + foco
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // prende o foco no diálogo: o resto da página fica inerte enquanto o índice está aberto
    const behind = [
      document.getElementById("conteudo"),
      document.querySelector("footer"),
      barRef.current,
    ].filter(Boolean);
    behind.forEach((el) => el.setAttribute("inert", ""));
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        restoreFocus.current = true;
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // devolve o foco ao botão "Índice" DEPOIS que a barra deixa de ser inerte (efeito roda após o cleanup acima)
  useEffect(() => {
    if (!open && restoreFocus.current) {
      restoreFocus.current = false;
      toggleRef.current?.focus();
    }
  }, [open]);

  const closeMenu = () => {
    restoreFocus.current = true;
    setOpen(false);
  };

  const isHome = pathname === "/";

  return (
    <>
      <a href="#conteudo" className={styles.skip}>
        Pular para o conteúdo
      </a>

      <header ref={barRef} className={`${styles.bar} plate`}>
        <span className="screw" style={{ left: 10, top: "50%", marginTop: -4.5 }} />
        <span className="screw" style={{ right: 10, top: "50%", marginTop: -4.5 }} />

        <Link href="/" className={styles.brand} aria-label="LabMaker — página inicial">
          <Image
            src="/areas/logo.jpg"
            alt=""
            width={72}
            height={72}
            className={styles.logo}
            preload
          />
          <span className={styles.word}>
            LAB<b>MAKER</b>
          </span>
          <span className={`${styles.kicker} mono`}>Extensão · Impressão 3D</span>
        </Link>

        <nav className={styles.links} aria-label="Áreas do laboratório">
          {areas.map((a) => {
            const href = `/areas/${a.slug}`;
            const current = pathname === href;
            return (
              <Link
                key={a.slug}
                href={href}
                className={styles.link}
                aria-current={current ? "page" : undefined}
                title={a.name}
                aria-label={a.name}
              >
                <span className={styles.n}>{a.number}</span>
                {a.name}
              </Link>
            );
          })}
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className={styles.index}
          aria-expanded={open}
          aria-controls="indice"
          onClick={() => setOpen((v) => !v)}
        >
          Índice
          <span className={styles.burger} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>

      {/* menu de tela cheia (índice) */}
      <div
        id="indice"
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""} blueprint`}
        role="dialog"
        aria-modal="true"
        aria-label="Índice do site"
        inert={!open}
      >
        <div className={`${styles.overlayTop} wrap`}>
          <span className="mono">Índice / LabMaker</span>
          <button ref={closeRef} type="button" className={styles.close} onClick={closeMenu}>
            Fechar ✕
          </button>
        </div>

        <ul className={`${styles.list} wrap`}>
          <li style={{ "--i": 0 }}>
            <Link
              href="/"
              className={styles.item}
              aria-current={isHome ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className={`${styles.itemNo} mono`}>00</span>
              <span className={`${styles.itemName} display`}>Início</span>
              <span className={`${styles.itemHint} mono`}>Todas as áreas</span>
            </Link>
          </li>
          {areas.map((a, i) => (
            <li key={a.slug} style={{ "--i": i + 1 }}>
              <Link
                href={`/areas/${a.slug}`}
                className={styles.item}
                aria-current={pathname === `/areas/${a.slug}` ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <span className={`${styles.itemNo} mono`}>{a.number}</span>
                <span className={`${styles.itemName} display`}>{a.name}</span>
                <span className={`${styles.itemHint} mono`}>{a.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
