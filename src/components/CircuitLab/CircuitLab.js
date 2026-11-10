"use client";

import SortLab from "@/components/SortLab/SortLab";
import { CIRCUIT_CLASSES, CIRCUIT_COPY, CIRCUIT_ITEMS } from "@/data/circuits";
import { CIRCUIT_ART, CircuitBlueprint } from "./circuitArt";

/**
 * Laboratório de circuitos: o motor SortLab com os dados do minicurso de circuitos elétricos.
 * É um componente de cliente porque a arte e o desenho da vitória são componentes React
 * (funções não podem ser passadas de um componente de servidor para um de cliente).
 */
export default function CircuitLab({ className }) {
  return (
    <SortLab
      groups={CIRCUIT_CLASSES}
      items={CIRCUIT_ITEMS}
      art={CIRCUIT_ART}
      Victory={CircuitBlueprint}
      copy={CIRCUIT_COPY}
      className={className}
    />
  );
}
