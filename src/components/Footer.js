import Image from "next/image";
import Link from "next/link";
import { SITE, areas } from "@/data/areas";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.footer} blueprint`}>
      <div className={`${styles.inner} wrap`}>
        <div className={`${styles.brand} plate plate--dark`}>
          <span className="screw screw--tl" />
          <span className="screw screw--tr" />
          <span className="screw screw--bl" />
          <span className="screw screw--br" />
          <Image src="/areas/logo.jpg" alt="" width={96} height={96} className={styles.logo} />
          <div>
            <p className={`${styles.name} display`}>LabMaker</p>
            <p className={`${styles.sub} mono`}>Projeto de extensão universitária</p>
          </div>
        </div>

        <nav className={styles.col} aria-label="Áreas no rodapé">
          <p className={`${styles.head} mono`}>Áreas</p>
          <ul>
            {areas.map((a) => (
              <li key={a.slug}>
                <Link href={`/areas/${a.slug}`}>
                  <span className="mono">{a.number}</span>
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <p className={`${styles.head} mono`}>Siga o LabMaker</p>
          {SITE.socials.length > 0 ? (
            <ul>
              {SITE.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.soon}>Redes sociais em breve.</p>
          )}
          {SITE.university && (
            <>
              <p className={`${styles.head} mono`} style={{ marginTop: "2.49vh" }}>
                Instituição
              </p>
              <p className={styles.soon}>{SITE.university}</p>
            </>
          )}
        </div>
      </div>

      <div className={`${styles.bottom} wrap mono`}>
        <span>© {SITE.year} LabMaker. Todos os direitos reservados.</span>
        <span>Impressão 3D · Extensão · Estudantes</span>
      </div>
    </footer>
  );
}
