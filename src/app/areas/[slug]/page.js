import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import HoloCard from "@/components/HoloCard";
import Placeholder from "@/components/Placeholder";
import PrintFactory from "@/components/PrintFactory/PrintFactory";
import AnatomyLab from "@/components/AnatomyLab/AnatomyLab";
import FitText from "@/components/FitText";
import ProblemGlobe from "@/components/ProblemGlobe/ProblemGlobe";
import ProjectFolders from "@/components/ProjectFolders";
import SectionRail from "@/components/SectionRail";
import TeamLanyard from "@/components/TeamLanyard/TeamLanyard";
import { SITE, areas, getArea, otherAreas } from "@/data/areas";
import { ORGANS, SYSTEMS } from "@/data/anatomy";
import { THEMES, problems } from "@/data/problems";
import { projectsFor } from "@/data/projects";
import { teamFor } from "@/data/team";
import styles from "./area.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) return {};
  return { title: area.name, description: area.summary };
}

export default async function AreaPage({ params }) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const hasFactory = slug === "escritorio-3d";
  const hasGlobe = slug === "sustentabilidade";
  const hasAnatomy = slug === "saude";
  const total = String(areas.length).padStart(2, "0");
  const maxLen = Math.max(...area.titleLines.map((l) => l.length));
  const aboutTitle = `SOMOS ${area.short}`.toUpperCase();

  // seções (alimentam o trilho lateral e a numeração)
  const sections = [
    { id: "topo", label: "Início" },
    { id: "sobre", label: "Sobre" },
    ...(hasGlobe ? [{ id: "mundo", label: "Mundo" }] : []),
    ...(hasAnatomy ? [{ id: "anatomia", label: "Anatomia" }] : []),
    ...(hasFactory ? [{ id: "esteira", label: "Esteira" }] : []),
    { id: "projetos", label: "Projetos" },
    { id: "galeria", label: "Galeria" },
    { id: "equipe", label: "Equipe" },
    { id: "outras", label: "Outras áreas" },
  ];
  const no = (id) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, "0");

  return (
    <>
      <SectionRail items={sections} />

      {/* ============ HERO (blueprint — referência 2) ============ */}
      <section id="topo" className={`${styles.hero} blueprint`}>
        <svg className={styles.deco} viewBox="0 0 600 600" fill="none" aria-hidden="true">
          <circle cx="300" cy="300" r="280" />
          <circle cx="300" cy="300" r="200" />
          <circle cx="300" cy="300" r="110" strokeDasharray="6 8" />
          <path d="M300 0V600M0 300H600" />
          <path d="M90 90L510 510M510 90L90 510" strokeDasharray="2 10" />
        </svg>

        <div className={`${styles.heroInner} wrap`}>
          <div>
            <p className={`${styles.crumb} mono`}>
              <Link href="/">LabMaker</Link> / Áreas / {area.number} de {total}
            </p>
            <h1 className={`${styles.title} display`} style={{ "--maxlen": maxLen }}>
              {area.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className={styles.tagline}>{area.tagline}</p>
          </div>

          <div className={`${styles.emblem} plate plate--dark`}>
            <span className="screw screw--tl" />
            <span className="screw screw--tr" />
            <span className="screw screw--bl" />
            <span className="screw screw--br" />
            <Image
              src={area.logo}
              alt={`Logo da área ${area.name}`}
              width={300}
              height={300}
              preload
              className={styles.emblemImg}
            />
            <p className="mono">Emblema · Área {area.number}/{total}</p>
          </div>
        </div>

        <div className={`${styles.feature} wrap`}>
          <div className={styles.featureText}>
            <h2 className={`${styles.featureTitle} display`}>
              Em
              <br />
              destaque
            </h2>
            <p>{area.summary}</p>
            <a href="#projetos" className="btn">
              <span>Ver projetos</span>
              <span aria-hidden="true">▸</span>
            </a>
          </div>
          <Placeholder label="Imagem ou vídeo de destaque da área" ratio="16 / 10" />
        </div>
      </section>

      {/* ============ SOBRE (diagonal + texto vertical — referência 1) ============ */}
      <section id="sobre" className={`${styles.about} grain`}>
        <p className={`${styles.aboutLabel} mono`}>
          {no("sobre")} — Sobre a equipe ↓
        </p>
        <div className={`${styles.aboutInner} wrap`}>
          <h2 className={`${styles.vertical} display`} style={{ "--len": aboutTitle.length }}>
            {aboutTitle}
          </h2>

          <div className={styles.aboutBody}>
            {area.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <ul className={styles.focus}>
              {area.focus.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a href="#projetos" className={`${styles.outline} mono`}>
              Conheça os projetos
            </a>
          </div>

          <div className={styles.aboutVisual}>
            <Placeholder label="Imagem — trabalho em destaque" ratio="4 / 5" />
          </div>
        </div>
      </section>

      {/* ============ GLOBO DE PROBLEMAS (só Sustentabilidade e Acessibilidade) ============ */}
      {hasGlobe && (
        <section id="mundo" className={`${styles.world} blueprint`}>
          <div className="wrap">
            <header className={styles.secHead}>
              <span className={`${styles.secNo} mono`}>{no("mundo")}</span>
              <h2 className={`${styles.h2} display`}>
                Problemas que
                <br />o mundo enfrenta
              </h2>
              <p>
                Acessibilidade e sustentabilidade são números reais, não temas distantes. Gire o
                globo, escolha um ponto e veja o problema, a fonte e onde o LabMaker pode atuar.
              </p>
            </header>
            <ProblemGlobe problems={problems} themes={THEMES} />
          </div>
        </section>
      )}

      {/* ============ LABORATÓRIO DE ANATOMIA (só Inovação em Saúde) ============ */}
      {hasAnatomy && (
        <section id="anatomia" className={`${styles.lab} blueprint`}>
          <div className="wrap">
            <header className={styles.secHead}>
              <span className={`${styles.secNo} mono`}>{no("anatomia")}</span>
              <h2 className={`${styles.h2} display`}>
                Laboratório
                <br />
                de anatomia
              </h2>
              <p>
                Separe os órgãos nos sistemas do corpo humano. Arraste cada órgão até o painel
                certo (ou clique no órgão e depois no painel). Quando os três painéis travarem,
                o modelo completo se revela.
              </p>
            </header>
            <AnatomyLab systems={SYSTEMS} organs={ORGANS} />
          </div>
        </section>
      )}

      {/* ============ ESTEIRA 3D (só Escritório 3D) ============ */}
      {hasFactory && (
        <section id="esteira" className={`${styles.factory} blueprint`}>
          <div className="wrap">
            <header className={styles.secHead}>
              <span className={`${styles.secNo} mono`}>{no("esteira")}</span>
              <h2 className={`${styles.h2} display`}>
                Esteira de
                <br />
                produção
              </h2>
              <p>
                Uma visão teórica de como uma peça percorre o Escritório 3D: do pedido à entrega.
                Escolha uma câmera, pause a esteira ou toque em uma estação para ver o que acontece
                nela.
              </p>
            </header>
            <PrintFactory />
          </div>
        </section>
      )}

      {/* ============ PROJETOS (pastas de vidro) ============ */}
      <section id="projetos" className={`${styles.projects} blueprint`}>
        <div className="wrap">
          <header className={styles.secHead}>
            <span className={`${styles.secNo} mono`}>{no("projetos")}</span>
            <h2 className={`${styles.h2} display`}>Projetos</h2>
            <p>
              Cada pasta guarda as imagens de um projeto. Passe o mouse (ou toque) para abrir e
              clique em uma imagem para ampliar. Os arquivos abaixo estão reservados para as
              imagens.
            </p>
          </header>
          <ProjectFolders projects={projectsFor(area)} />
        </div>
      </section>

      {/* ============ GALERIA (cards sobrepostos — referência 1) ============ */}
      <section id="galeria" className={`${styles.gallery} grain`}>
        <div className="wrap">
          <header className={styles.secHeadDark}>
            <span className={`${styles.secNo} mono`}>{no("galeria")}</span>
            <h2 className={`${styles.h2} ${styles.h2Ink} display`}>
              Galeria de
              <br />
              trabalhos
            </h2>
          </header>

          <div className={styles.collage}>
            {[
              { ratio: "9 / 16", w: "c1" },
              { ratio: "4 / 3", w: "c2" },
              { ratio: "4 / 5", w: "c3" },
              { ratio: "9 / 16", w: "c4" },
            ].map((c, i) => (
              <figure key={c.w} className={`${styles.shot} ${styles[c.w]}`}>
                <Placeholder
                  label={`Imagem ${String(i + 1).padStart(2, "0")}`}
                  ratio={c.ratio}
                  tone="paper"
                />
                <figcaption className="mono">
                  Trabalho {String(i + 1).padStart(2, "0")} · {SITE.year}
                </figcaption>
              </figure>
            ))}
          </div>

          {/* nome da área em letras gigantes: o FitText garante que a palavra inteira cabe em qualquer largura */}
          <div className={styles.bigWrap} aria-hidden="true">
            <FitText className={`${styles.bigWord} display`}>{area.short}</FitText>
          </div>
        </div>
      </section>

      {/* ============ EQUIPE (crachás em trilho — sem fotos) ============ */}
      <section id="equipe" className={`${styles.team} blueprint`}>
        <div className="wrap">
          <header className={styles.secHead}>
            <span className={`${styles.secNo} mono`}>{no("equipe")}</span>
            <h2 className={`${styles.h2} display`}>Equipe</h2>
            <p>
              Quem faz a área acontecer. Passe o mouse num crachá, arraste pelo trilho ou clique
              para virar e ler mais.
            </p>
          </header>
          <TeamLanyard
            members={teamFor(area)}
            caption="Crachás da equipe. Clique em um crachá para virar."
          />
        </div>
      </section>

      {/* ============ OUTRAS ÁREAS ============ */}
      <section id="outras" className={`${styles.others} grain`}>
        <div className="wrap">
          <header className={styles.secHeadDark}>
            <span className={`${styles.secNo} mono`}>{no("outras")}</span>
            <h2 className={`${styles.h2} ${styles.h2Ink} display`}>
              Conheça as
              <br />
              outras áreas
            </h2>
          </header>
          <div className={styles.othersGrid}>
            {otherAreas(slug).map((a) => (
              <HoloCard
                key={a.slug}
                href={`/areas/${a.slug}`}
                image={a.logo}
                number={a.number}
                title={a.name}
                summary={a.summary}
                effect={a.effect}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
