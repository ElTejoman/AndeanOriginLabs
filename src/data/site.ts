/** Datos generales de la marca y del sitio. */
export const SITE = {
  name: "Andean Origin Labs",
  title: "Andean Origin Labs · Extractos hidroalcohólicos y secos de hierbas peruanas",
  description:
    "Hierbas medicinales del Ande y la Amazonía en extracto hidroalcohólico y extracto seco en gránulos. En cada etiqueta, dos saberes: lo que la ciencia ha estudiado y lo que nuestras comunidades han sabido siempre.",
  locale: "es_PE",
  lang: "es-PE",
  location: "Lima, Perú",
  tagline: "Hierbas del Ande y la Amazonía",
  themeColor: "#0b1810",
  ogImage: "/og-image.jpg",
} as const;

/** Navegación principal: cada enlace apunta al id de una sección de la página. */
export const NAV_LINKS = [
  { href: "#producto", label: "El frasco" },
  { href: "#hierbas", label: "Colección" },
  { href: "#altitud", label: "Origen" },
  { href: "#proceso", label: "Proceso" },
  { href: "#aliados", label: "Profesionales" },
  { href: "#preguntas", label: "Preguntas" },
] as const;

/** Ancla del formulario de preventa, destino de todos los CTA de reserva. */
export const WAITLIST_ANCHOR = "#lista";

/** Ancla de la sección para médicos y clínicas, destino del banner B2B. */
export const PARTNERS_ANCHOR = "#aliados";
