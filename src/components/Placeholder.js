import styles from "./Placeholder.module.css";

/**
 * Espaço reservado para imagens que serão preenchidas depois.
 * Hachurado (como nos blueprints de referência) + legenda + proporção.
 *
 * Para trocar por uma imagem real: substitua o <Placeholder /> por
 * <Image src="/caminho.jpg" alt="..." width={..} height={..} />.
 *
 * tone: "blue" (sobre fundo azul) | "paper" (sobre papel/claro)
 */
export default function Placeholder({
  label,
  ratio = "4 / 3",
  tone = "blue",
  hint,
  className = "",
  style,
}) {
  const ratioLabel = hint ?? String(ratio).replace(/\s*\/\s*/, ":");
  return (
    <div
      className={`${styles.ph} ${tone === "paper" ? styles.paper : ""} ${className}`}
      style={{ aspectRatio: ratio, ...style }}
      role="img"
      aria-label={`Espaço reservado para imagem: ${label}`}
      data-placeholder
    >
      <span className={styles.corner} data-pos="tl" />
      <span className={styles.corner} data-pos="tr" />
      <span className={styles.corner} data-pos="bl" />
      <span className={styles.corner} data-pos="br" />
      <span className={styles.label}>{label}</span>
      <span className={styles.ratio}>{ratioLabel}</span>
    </div>
  );
}
