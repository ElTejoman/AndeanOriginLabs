/** Datos generales de la marca y del sitio. */
export const SITE = {
  name: "Andean Origin Labs",
  title: "Andean Origin Labs · Fórmulas de plantas del Ande y la Amazonía",
  description:
    "Cuatro fórmulas con plantas del Ande y la Amazonía, en extracto hidroalcohólico o seco en gránulos. De cada planta, lo que dice la tradición, lo que muestran los estudios y lo que aún no se sabe.",
  locale: "es_PE",
  lang: "es-PE",
  location: "Lima, Perú",
  tagline: "Plantas del Ande y la Amazonía",
  themeColor: "#0b1810",
  ogImage: "/og-image.jpg",
} as const;

/** Navegación principal: cada enlace apunta al id de una sección de la página. */
export const NAV_LINKS = [
  { href: "#formulas", label: "Fórmulas" },
  { href: "#hierbas", label: "Plantas" },
  { href: "#origen", label: "Origen" },
  { href: "#proceso", label: "Proceso" },
  { href: "#aliados", label: "Profesionales" },
  { href: "#preguntas", label: "Preguntas" },
] as const;

/** Ancla del formulario de preventa, destino de todos los CTA de reserva. */
export const WAITLIST_ANCHOR = "#lista";

/** Ancla de la sección para médicos y clínicas, destino del banner B2B. */
export const PARTNERS_ANCHOR = "#aliados";
