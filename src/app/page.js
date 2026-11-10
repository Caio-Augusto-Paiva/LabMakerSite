import Image from "next/image";
import Link from "next/link";
import HoloCard from "@/components/HoloCard";
import Placeholder from "@/components/Placeholder";
import ProjectFolders from "@/components/ProjectFolders";
import { SITE, areas } from "@/data/areas";
import { placeholderProjects } from "@/data/projects";
import styles from "./home.module.css";

export default function HomePage() {
  const total = String(areas.length).padStart(2, "0");
  return (
    <>
      {/* ================= HERO ================= */}
      <section className={`${styles.hero} grain`}>
        <div className="wrap">
          <div className={`${styles.heroMeta} mono`}>
            <span>LabMaker / {SITE.year}</span>
            <span>Projeto de extensão · Impressão 3D</span>
          </div>

          <div className={styles.stage}>
            <h1 className={`${styles.mega} display`}>
              Lab<span>Maker</span>
            </h1>

            <div className={`${styles.card} plate`}>
              <span className="screw screw--tl" />
              <span className="screw screw--tr" />
              <span className="screw screw--bl" />
              <span className="screw screw--br" />
              <div className={`${styles.cardHead} mono`}>
                <span>LabMaker</span>
                <span>Projeto universitário</span>
              </div>
              <div className={styles.cardBody}>
                <Image
                  src="/areas/logo.jpg"
                  alt="Logo do LabMaker: bico de impressora 3D sobre um robô"
                  width={176}
                  height={176}
                  className={styles.avatar}
                  preload
                />
                <div>
                  <p className={`${styles.cardTitle} display`}>
                    Impressão 3D
                    <br />
                    feita por estudantes
                  </p>
                  <p className={`${styles.cardSub} mono`}>{total} equipes · 01 laboratório</p>
                </div>
              </div>
              <div className={`${styles.cardFoot} mono`}>
                <span>Educação</span>
                <span>Sustentabilidade</span>
                <span>Escritório 3D</span>
                <span>Saúde</span>
                <span>Marketing</span>
              </div>
            </div>

            <div className={`${styles.tag} ${styles.tagOrange}`}>
              <span className="screw screw--tl" />
              <span className="screw screw--br" />
              <span className="mono">Áreas</span>
              <strong>{total} equipes</strong>
              <span className={`${styles.tagList} mono`}>Ensino · Acesso · Produção · Saúde · Voz</span>
            </div>

            <div className={`${styles.tag} ${styles.tagBlue}`}>
              <span className="screw screw--tr" />
              <span className="screw screw--bl" />
              <span className="mono">Projeto / {SITE.year}</span>
              <strong>Extensão universitária</strong>
              <span className={`${styles.tagList} mono`}>Feito por estudantes</span>
            </div>

            <a href="#areas" className={styles.chip}>
              <span className="mono">Próximo passo?</span>
              <strong>Conheça as áreas</strong>
              <span className={styles.chipArrow} aria-hidden="true">↘</span>
            </a>

            <div className={styles.barcode} aria-hidden="true">
              <i />
              <span className="mono">{SITE.year}</span>
            </div>
          </div>

          <div className={styles.scope}>
            <div>
              <h2 className={`${styles.scopeTitle} display`}>
                O projeto<span>.</span>
              </h2>
            </div>
            <p className={styles.scopeText}>
              O LabMaker é um projeto universitário formado por estudantes, voltado à impressão
              3D e à atuação extensionista junto à faculdade e à comunidade. Cinco equipes
              projetam, imprimem e levam tecnologia para dentro e para fora da sala de aula.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 01 — O PROJETO ================= */}
      <section className={styles.intro} id="projeto">
        <div className="wrap">
          <div className={styles.introGrid}>
            <div className={styles.introHead}>
              <span className={`${styles.secNo} mono`}>01</span>
              <h2 className={`${styles.h2} display`}>
                De estudantes
                <br />
                para a faculdade.
              </h2>
            </div>

            <div className={styles.introText}>
              <p>
                O LabMaker nasce dentro da universidade, com estudantes que usam a impressão 3D para
                resolver problemas reais: da sala de aula ao cuidado em saúde, da acessibilidade à
                produção de peças para outros projetos.
              </p>
              <p>
                Cada equipe cuida de uma frente, e todas dividem o mesmo laboratório, as mesmas
                máquinas e o mesmo objetivo: levar a tecnologia para perto de quem precisa.
              </p>
              <p className={`${styles.note} mono`}>Texto provisório — será substituído pelo texto oficial.</p>
            </div>

            <div className={styles.collage}>
              <div className={`${styles.frame} ${styles.frameMain} plate`}>
                <span className="screw screw--tl" />
                <span className="screw screw--tr" />
                <Placeholder label="Foto do laboratório" ratio="16 / 10" tone="paper" />
              </div>
              <div className={`${styles.frame} ${styles.framePhoneA} plate`}>
                <Placeholder label="Foto da peça" ratio="9 / 16" tone="paper" />
              </div>
              <div className={`${styles.frame} ${styles.framePhoneB} plate`}>
                <Placeholder label="Foto de um projeto" ratio="9 / 16" tone="paper" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 02 — AS ÁREAS ================= */}
      <section id="areas" className={`${styles.areas} blueprint`}>
        <div className="wrap">
          <header className={styles.areasHead}>
            <span className={`${styles.secNoLight} mono`}>02</span>
            <h2 className={`${styles.h2} ${styles.h2Light} display`}>
              As áreas
              <br />
              do laboratório.
            </h2>
            <p className={styles.areasLead}>
              Cinco equipes, um mesmo laboratório. Clique em um card para virá-lo, leia o resumo e use o
              botão para entrar na página da área.
            </p>
          </header>

          <div className={styles.diagram}>
            <svg
              className={styles.wires}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M50 25 H16.7" />
              <path d="M50 25 H83.3" />
              <path d="M50 25 V75" />
              <path d="M50 50 H16.7 V75" />
              <path d="M50 50 H83.3 V75" />
            </svg>
            <span className={styles.junction} aria-hidden="true" />

            {areas.slice(0, 2).map((a, i) => (
              <AreaNode key={a.slug} area={a} slot={i === 0 ? "a1" : "a2"} />
            ))}

            <article className={`${styles.node} ${styles.core} plate plate--dark`} style={{ gridArea: "core" }}>
              <span className="screw screw--tl" />
              <span className="screw screw--tr" />
              <span className="screw screw--bl" />
              <span className="screw screw--br" />
              <p className={`${styles.nodeTag} mono`}>Núcleo</p>
              <Image
                src="/areas/logo.jpg"
                alt=""
                width={120}
                height={120}
                className={styles.coreLogo}
              />
              <h3 className={`${styles.coreName} display`}>LabMaker</h3>
              <dl className={`${styles.coreData} mono`}>
                <div><dt>Áreas</dt><dd>{total}</dd></div>
                <div><dt>Laboratório</dt><dd>01</dd></div>
                <div><dt>Foco</dt><dd>Impressão 3D</dd></div>
                <div><dt>Tipo</dt><dd>Extensão</dd></div>
                <div><dt>Status</dt><dd><i className={styles.live} /> Ativo</dd></div>
              </dl>
            </article>

            {areas.slice(2).map((a, i) => (
              <AreaNode key={a.slug} area={a} slot={["a3", "a4", "a5"][i]} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= 03 — PROJETOS EM DESTAQUE ================= */}
      <section className={`${styles.featured} grain`} id="destaques">
        <div className="wrap">
          <div className={styles.featHead}>
            <span className={`${styles.secNo} mono`}>03</span>
            <h2 className={`${styles.h2} display`}>
              Projetos em <span className={styles.mark}>destaque</span>.
            </h2>
            <p className={styles.featLead}>
              Aqui entram as peças e os trabalhos mais marcantes de cada equipe. Passe o mouse (ou
              toque) para abrir uma pasta e clique numa imagem para ampliar. Os arquivos estão
              reservados para as imagens.
            </p>
          </div>

          <ProjectFolders projects={placeholderProjects(3)} tone="paper" />
        </div>
      </section>
    </>
  );
}

function AreaNode({ area, slot }) {
  return (
    <article
      className={`${styles.node} plate plate--dark`}
      style={{ gridArea: slot }}
      data-slot={slot}
    >
      <span className="screw screw--tl" />
      <span className="screw screw--tr" />
      <span className="screw screw--bl" />
      <span className="screw screw--br" />
      <p className={`${styles.nodeTag} mono`}>
        <span>Área {area.number}</span>
        <span>Equipe</span>
      </p>
      <h3 className={`${styles.nodeName} display`}>{area.name}</h3>
      <div className={styles.nodeCard}>
        <HoloCard
          href={`/areas/${area.slug}`}
          image={area.logo}
          number={area.number}
          title={area.name}
          summary={area.summary}
          effect={area.effect}
        />
      </div>
      <p className={styles.nodeText}>{area.summary}</p>
      {/* mesmo destino do card acima: fora da ordem de Tab e do leitor de tela para não duplicar */}
      <Link
        href={`/areas/${area.slug}`}
        className={`${styles.nodeLink} mono`}
        tabIndex={-1}
        aria-hidden="true"
      >
        Acessar página <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
