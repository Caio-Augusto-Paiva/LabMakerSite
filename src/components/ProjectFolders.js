"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { isScrolling } from "@/lib/scrollState";
import Placeholder from "./Placeholder";
import styles from "./ProjectFolders.module.css";

/**
 * Pastas de vidro (inspiradas no "Glassmorphism Folder Cards" do 21st.dev):
 *  - montam ao entrar na tela (escalonado)
 *  - inclinam em direção ao ponteiro
 *  - abrem (hover / foco / clique) e abrem em leque os arquivos (imagens do projeto)
 *  - clicar num arquivo abre um visualizador (<dialog>) com navegação
 *
 * projects: [{ id, title, category, year, files: [{ label, src?, alt? }] }]
 * Arquivo sem `src` aparece como espaço reservado hachurado.
 * tone: "dark" (sobre azul/blueprint) | "paper" (sobre papel)
 */
export default function ProjectFolders({ projects, tone = "dark" }) {
  const [viewer, setViewer] = useState(null); // { p: índice do projeto, f: índice do arquivo }
  const dialogRef = useRef(null);
  const lastFocus = useRef(null);

  const openViewer = (p, f, trigger) => {
    lastFocus.current = trigger;
    setViewer({ p, f });
  };

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (viewer && !d.open) d.showModal();
    if (!viewer && d.open) d.close();
  }, [viewer]);

  // fecha o <dialog>; o foco volta ao arquivo que abriu o visualizador no evento onClose
  const closeViewer = () => {
    dialogRef.current?.close();
  };

  const project = viewer ? projects[viewer.p] : null;
  const file = project ? project.files[viewer.f] : null;
  const step = (dir) => {
    if (!project) return;
    const n = project.files.length;
    setViewer((v) => ({ ...v, f: (v.f + dir + n) % n }));
  };

  return (
    <>
      <ul className={`${styles.grid} ${tone === "paper" ? styles.paper : ""}`}>
        {projects.map((proj, i) => (
          <li key={proj.id}>
            <Folder
              project={proj}
              index={i}
              onOpenFile={(f, el) => openViewer(i, f, el)}
            />
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.viewer}
        onClose={() => {
          setViewer(null);
          lastFocus.current?.focus?.();
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeViewer();
        }}
        aria-label={project ? `Imagens do projeto ${project.title}` : "Visualizador de imagens"}
      >
        {project && file && (
          <div className={styles.viewerBody}>
            <div className={styles.viewerHead}>
              <p className="mono">
                {project.title} · {project.category} · {project.year}
              </p>
              <button type="button" className={styles.vBtn} onClick={closeViewer}>
                Fechar ✕
              </button>
            </div>

            <div className={styles.viewerStage}>
              {file.src ? (
                <Image
                  src={file.src}
                  alt={file.alt ?? `${project.title}: ${file.label}`}
                  fill
                  sizes="(max-width: 900px) 92vw, 860px"
                  className={styles.viewerImg}
                />
              ) : (
                <Placeholder
                  label={`Imagem — ${project.title} · ${file.label}`}
                  ratio="4 / 3"
                  className={styles.viewerPh}
                />
              )}
            </div>

            <div className={styles.viewerFoot}>
              <span className="mono" aria-live="polite">
                {file.label} · {viewer.f + 1} / {project.files.length}
              </span>
              <span className={styles.vNav}>
                <button type="button" className={styles.vBtn} onClick={() => step(-1)} aria-label="Imagem anterior">
                  ◀
                </button>
                <button type="button" className={styles.vBtn} onClick={() => step(1)} aria-label="Próxima imagem">
                  ▶
                </button>
              </span>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function Folder({ project, index, onOpenFile }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [pinned, setPinned] = useState(false);

  // monta ao entrar na tela
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // inclina em direção ao ponteiro
  const onMove = (e) => {
    if (e.pointerType === "touch" || isScrolling()) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const n = project.files.length;
  const rot = n === 1 ? [0] : n === 2 ? [-6, 6] : [-9, 0, 9];

  return (
    <div
      ref={ref}
      className={styles.folder}
      data-in={inView}
      data-open={pinned}
      style={{ "--i": index }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className={styles.stage}>
        <span className={styles.tab} aria-hidden="true" />
        <span className={styles.back} aria-hidden="true" />

        {/* frente: botão que abre/fecha a pasta (fica antes dos arquivos na ordem de Tab) */}
        <button
          type="button"
          className={styles.front}
          aria-expanded={pinned}
          onClick={() => setPinned((v) => !v)}
        >
          <span className={`${styles.no} mono`}>{String(index + 1).padStart(2, "0")}</span>
          <span className={`${styles.title} display`}>{project.title}</span>
          <span className={`${styles.meta} mono`}>
            {project.category} · {project.year} · {n} {n === 1 ? "imagem" : "imagens"}
          </span>
          <span className={`${styles.hint} mono`} aria-hidden="true">
            {pinned ? "Fechar pasta" : "Abrir pasta"}
          </span>
        </button>

        <div className={styles.files}>
          {project.files.map((f, k) => (
            <button
              key={f.label + k}
              type="button"
              className={styles.file}
              style={{ "--r": `${rot[k] ?? 0}deg`, "--k": k, "--n": n }}
              onClick={(e) => onOpenFile(k, e.currentTarget)}
              aria-label={`Abrir imagem: ${project.title}, ${f.label}`}
            >
              {f.src ? (
                <Image
                  src={f.src}
                  alt=""
                  fill
                  sizes="220px"
                  className={styles.fileImg}
                />
              ) : (
                <Placeholder label={f.label} ratio="4 / 3" tone="paper" hint=" " />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
