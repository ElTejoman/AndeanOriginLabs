import { emit } from "@/scripts/core/events";

/**
 * Acciones declarativas en el HTML, para cualquier sección:
 * `data-select-herb="<id>"` abre la ficha de esa planta y `data-choose-formula="<id>"` preselecciona esa fórmula
 * en los formularios.
 */
export function initActions(root: Document | HTMLElement = document): void {
  root.addEventListener("click", (event) => {
    const target = event.target as Element;

    const herbLink = target.closest<HTMLElement>("[data-select-herb]");
    if (herbLink) {
      event.preventDefault();
      emit("herb:select", { id: herbLink.dataset["selectHerb"]!, scroll: true });
      return;
    }

    const formulaLink = target.closest<HTMLElement>("[data-choose-formula]");
    if (formulaLink) emit("formula:choose", { id: formulaLink.dataset["chooseFormula"]! });
  });
}
