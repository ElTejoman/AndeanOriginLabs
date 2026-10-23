/**
 * Divide el texto de un elemento en palabras (.split-word) y letras (.split-char)
 * conservando los elementos internos (por ejemplo <em>). Las palabras no se cortan entre líneas.
 * El elemento debe tener aria-label con el texto completo: las piezas quedan aria-hidden.
 */
export function splitText(el: HTMLElement): HTMLElement[] {
  const fragment = splitNode(el);
  el.replaceChildren(fragment);
  return Array.from(el.querySelectorAll<HTMLElement>(".split-char"));
}

function splitNode(node: Node): DocumentFragment {
  const out = document.createDocumentFragment();

  node.childNodes.forEach((child) => {
    if (child.nodeType !== Node.TEXT_NODE) {
      const clone = child.cloneNode(false);
      clone.appendChild(splitNode(child));
      out.appendChild(clone);
      return;
    }

    for (const part of (child.textContent ?? "").split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        out.appendChild(document.createTextNode(" "));
        continue;
      }
      const word = document.createElement("span");
      word.className = "split-word";
      word.setAttribute("aria-hidden", "true");
      for (const char of part) {
        const span = document.createElement("span");
        span.className = "split-char";
        span.textContent = char;
        word.appendChild(span);
      }
      out.appendChild(word);
    }
  });

  return out;
}
