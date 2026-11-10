/* ==========================================================================
   EQUIPE exibida nos crachás (sem fotos).

   Para cadastrar membros reais de uma área, adicione `team` ao objeto da área em
   src/data/areas.js:

     team: [
       {
         id: "ana",
         name: "Ana Souza",
         role: "Modelagem 3D",
         tone: "brand",            // "brand" | "accent" | "mint" | "ink"
         bio: "Estuda Engenharia e cuida da modelagem das peças.",
         tags: ["Engenharia", "CAD"],
         links: [{ label: "LinkedIn", href: "https://..." }],
       },
     ]

   Sem `team`, aparecem 6 crachás de exemplo ("Nome do membro 01"…).
   ========================================================================== */

const TONES = ["brand", "accent", "mint", "ink"];

export function teamFor(area, count = 6) {
  if (area?.team?.length) {
    return area.team.map((m, i) => ({
      team: area.short,
      tone: TONES[i % TONES.length],
      tags: [],
      links: [],
      ...m,
    }));
  }
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `membro-${n}`,
      name: `Nome do membro ${n}`,
      role: "Função na equipe",
      team: area.short,
      tone: TONES[i % TONES.length],
      bio: "Bio curta do membro: o que faz na equipe e o que mais gosta de fazer no laboratório.",
      tags: ["Curso", "Interesse"],
      links: [],
    };
  });
}
