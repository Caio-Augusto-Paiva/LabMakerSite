import Link from "next/link";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <section
      className="blueprint"
      style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "8rem 1rem 4rem" }}
    >
      <div style={{ textAlign: "center" }}>
        <p className="mono">Erro 404</p>
        <h1 className="display" style={{ fontSize: "clamp(4rem, 14vw, 11rem)", margin: "0.6rem 0" }}>
          Peça não encontrada
        </h1>
        <p style={{ marginBottom: "2rem", opacity: 0.9 }}>
          Essa página não existe (ou ainda está na impressora).
        </p>
        <Link href="/" className="btn">
          <span>Voltar ao início</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
