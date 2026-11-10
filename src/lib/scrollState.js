// Estado de rolagem compartilhado: enquanto a página rola com a roda do mouse, o navegador dispara
// "pointermove" falsos nos cards sob o cursor; atualizar inclinação/estado a cada quadro pesa na rolagem.
// Os componentes interativos consultam isScrolling() e ignoram esses eventos.
let scrolling = false;
let timer = 0;

if (typeof window !== "undefined") {
  window.addEventListener(
    "scroll",
    () => {
      scrolling = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        scrolling = false;
      }, 140);
    },
    { passive: true }
  );
}

export const isScrolling = () => scrolling;
