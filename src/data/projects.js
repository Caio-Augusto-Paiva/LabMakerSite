/* ==========================================================================
   PROJETOS exibidos nas pastas de vidro (landing e páginas das áreas).

   Para cadastrar projetos reais de uma área, adicione `projects` ao objeto da área
   em src/data/areas.js:

     projects: [
       {
         id: "protese-mao",
         title: "Prótese de mão",
         category: "Tecnologia assistiva",
         year: 2026,
         files: [
           { label: "Peça impressa", src: "/projetos/protese-1.jpg", alt: "Prótese de mão impressa em 3D" },
           { label: "Teste de encaixe", src: "/projetos/protese-2.jpg", alt: "..." },
         ],
       },
     ]

   Sem `src`, o arquivo aparece como espaço reservado hachurado.
   ========================================================================== */

import { SITE } from "./areas";

/** Projetos de uma área; se ainda não houver, devolve espaços reservados. */
export function projectsFor(area, count = 4) {
  if (area?.projects?.length) return area.projects;
  return placeholderProjects(count);
}

export function placeholderProjects(count = 4) {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `projeto-${n}`,
      title: `Projeto ${n}`,
      category: "Categoria",
      year: SITE.year,
      files: [{ label: "Imagem 1" }, { label: "Imagem 2" }, { label: "Imagem 3" }],
    };
  });
}
