/**
 * Contenido editorial de las secciones que no depende de cada planta.
 * Lo científico sale del dossier (reference/dossier) y de sus referencias verificadas.
 */
import type { EvidenceLevel } from "@/lib/herbs";

export type Knowledge = "ciencia" | "tradicion" | "ambos";

export const KNOWLEDGE_LABELS: Record<Knowledge, string> = {
  ciencia: "Ciencia",
  tradicion: "Tradición",
  ambos: "Ciencia + tradición",
};

export const TWO_KNOWLEDGES = {
  science: {
    eyebrow: "Base científica",
    title: "Lo que dice la ciencia",
    text: "Identificamos cada planta por su nombre botánico, revisamos los estudios publicados y te decimos qué está probado y qué todavía se investiga.",
    items: [
      { label: "Compuestos activos", note: "moléculas" },
      { label: "Estudios citados", note: "fuente" },
      { label: "Lo que aún no se sabe", note: "sin rodeos" },
    ],
  },
  tradition: {
    eyebrow: "Saber ancestral",
    title: "Lo que dice la tradición",
    text: "Cada planta tiene un origen y un uso tradicional: las cortezas de San Martín, la chancapiedra de Tingo María, el tocosh de los Andes.",
    items: [
      { label: "Uso tradicional", note: "historia" },
      { label: "Origen y abastecimiento", note: "región" },
      { label: "Nombres locales", note: "kion · mucura" },
    ],
  },
} as const;

export const PRODUCT_SPECS = [
  { term: "Líquido", detail: "Extracto hidroalcohólico, en frasco gotero" },
  { term: "Seco", detail: "Extracto en gránulos, con cucharita medidora" },
  { term: "Se mezcla con", detail: "Agua tibia, jugo, emoliente, avena o batido" },
] as const;

/** Lo que conserva cada lote, como mínimo, según el dossier (trazabilidad de origen). */
export const LOT_RECORD = [
  "Nombre científico validado y nombre local",
  "Parte de la planta",
  "Localidad, fecha de cosecha y proveedor",
  "Voucher botánico o certificado de identificación",
  "Método de secado, almacenamiento y extracción",
  "Controles microbiológicos, de metales pesados, pesticidas y adulteración",
  "Huella química, cuando sea técnicamente viable",
] as const;

export const RITUAL_STEPS = [
  { title: "Gotas o gránulos", text: "Las gotas del gotero o una cucharita de gránulos, según la etiqueta." },
  { title: "Mézclala a tu manera", text: "Agua tibia como un mate, jugo, emoliente o batido." },
  { title: "Hazlo costumbre", text: "Las plantas se toman con constancia, como en casa." },
] as const;

/** Pasos del proceso. `html` admite <em class="sci"> para nombres científicos. */
export const PROCESS_STEPS: ReadonlyArray<{ title: string; html: string; knowledge: Knowledge }> = [
  {
    title: "Origen documentado",
    html: "Cada planta se abastece en su zona: San Martín, Tingo María, la selva central, los Andes. Cada lote conserva proveedor, localidad y fecha de cosecha.",
    knowledge: "tradicion",
  },
  {
    title: "Identificación botánica",
    html: "Cada especie se autentica con un voucher botánico, porque nombres comunes como «matico», «chancapiedra» u «orégano» no bastan: designan a más de una planta.",
    knowledge: "ciencia",
  },
  {
    title: "Parte y método definidos",
    html: "Se fija la parte exacta de la planta y el método de extracción, porque muchos estudios usan una preparación distinta a la de un extracto.",
    knowledge: "ambos",
  },
  {
    title: "Lote trazable",
    html: "Controles microbiológicos, de metales pesados, pesticidas y adulteración, y una huella química cuando sea técnicamente viable.",
    knowledge: "ciencia",
  },
];

/**
 * Cómo leer la evidencia: qué puede y qué no puede respaldar cada tipo de estudio.
 * `level` da el color, el mismo de la etiqueta de evidencia en las fichas.
 */
export const EVIDENCE_GUIDE: ReadonlyArray<{ level: EvidenceLevel; title: string; supports: string; limits: string }> = [
  {
    level: "humanos",
    title: "Estudios en personas",
    supports: "Lo que se observó con esa preparación, esa dosis y ese grupo de personas.",
    limits: "Que lo mismo pase con otro extracto, otra parte de la planta u otra combinación.",
  },
  {
    level: "preclinica",
    title: "En animales",
    supports: "Que el efecto es biológicamente posible y vale la pena estudiarlo en personas.",
    limits: "Que el beneficio está probado en personas.",
  },
  {
    level: "preclinica",
    title: "En laboratorio",
    supports: "Qué compuestos tiene la planta y cómo actúan sobre células o microbios.",
    limits: "Que el producto trata una enfermedad en el cuerpo.",
  },
  {
    level: "tradicional",
    title: "Uso tradicional",
    supports: "La historia de la planta: quién la usa, dónde y cómo se prepara.",
    limits: "Su eficacia o su seguridad según la ciencia de hoy.",
  },
];

/** Cuidado que acompaña a todas las fórmulas, además de los propios de cada una (del dossier). */
export const FORMULA_CAUTION =
  "La seguridad de cada planta por separado no establece por sí sola la de un extracto concentrado que las combina: la combinación requiere sus propios estudios de seguridad y estabilidad.";

/**
 * Zonas de abastecimiento del dossier, para el perfil de origen, en orden de la Amazonía a los Andes.
 * `supplierPending`: la zona está definida pero el proveedor no.
 */
export const SOURCING_ZONES: ReadonlyArray<{ place: string; herbs: readonly string[]; supplierPending?: boolean }> = [
  { place: "Amazonía peruana", herbs: ["ajo-sacha"], supplierPending: true },
  { place: "San Martín", herbs: ["chuchuhuasi", "ubos", "icoja", "matico"] },
  { place: "Tingo María, Huánuco", herbs: ["chancapiedra"] },
  { place: "Selva central", herbs: ["jengibre"], supplierPending: true },
  { place: "Andes peruanos", herbs: ["tocosh"] },
];

/** Plantas sin zona ni proveedor definidos todavía. */
export const SOURCING_PENDING = ["naranja", "oregano", "menta", "malva"] as const;

export const GLOSSARY = [
  { word: "Hampi", glyph: "hampi", origin: "Quechua", meaning: "Medicina, remedio. La planta que cura." },
  { word: "Rao", glyph: "rao", origin: "Shipibo-Konibo", meaning: "Planta medicinal, remedio. El hampi de la selva." },
  { word: "Chacra", glyph: "chacra", origin: "Del quechua chakra", meaning: "La tierra que se cultiva. De ahí viene todo lo que hacemos." },
  { word: "Nugkui", glyph: "nugkui", origin: "Awajún", meaning: "La madre de las chacras. Vive bajo la tierra y hace crecer la yuca." },
  { word: "Iwishin", glyph: "iwishin", origin: "Awajún", meaning: "Quien cura con plantas. Guarda el saber del monte." },
  { word: "Kené", glyph: "kene", origin: "Shipibo-Konibo", meaning: "Los diseños que pintan y bordan las mujeres shipibo. Patrimonio Cultural de la Nación." },
] as const;

export const FAQ = [
  {
    question: "¿Trabajan con médicos y clínicas?",
    answer:
      "Sí, es nuestro canal principal. Médicos y clínicas pueden asociarse para recibir nuestras fórmulas y recetarlas a sus pacientes, con la ficha científica de cada planta y la trazabilidad de cada lote. Escríbenos desde la sección Profesionales.",
  },
  {
    question: "¿Las fórmulas están probadas clínicamente?",
    answer:
      "Todavía no. No existe un estudio clínico de ninguna de las cuatro combinaciones. Lo que hay son estudios de cada planta por separado, en personas, en animales o en laboratorio según el caso, y su uso tradicional. En cada ficha indicamos de qué tipo es cada estudio y qué falta demostrar.",
  },
  {
    question: "¿Qué diferencia hay entre un extracto y la hierba molida?",
    answer:
      "La hierba molida es la planta seca triturada. El extracto concentra los compuestos de la planta: por eso una porción pequeña rinde más y se disuelve mejor.",
  },
  {
    question: "¿Qué es un extracto hidroalcohólico?",
    answer:
      "Es la planta macerada en una mezcla de agua y alcohol, el mismo principio de las maceraciones en aguardiente de la Amazonía. El agua extrae unos compuestos y el alcohol otros que el agua sola no alcanza, y además conserva el extracto sin aditivos. En cada fórmula indicamos en qué formato viene.",
  },
  {
    question: "¿Cómo lo tomo?",
    answer: "Las gotas o una cucharita de gránulos en agua tibia, jugo, emoliente, avena o batido. Cada frasco indica la porción recomendada para esa fórmula.",
  },
  {
    question: "¿Cuándo sale a la venta?",
    answer:
      "Estamos terminando la primera línea. Las personas inscritas en la lista de espera se enteran primero y acceden al precio de preventa.",
  },
  {
    question: "¿Reemplaza un tratamiento médico?",
    answer:
      "No. Son productos naturales de uso tradicional con información científica, no medicamentos. Si estás embarazada, das de lactar o tomas medicamentos, consulta con tu médico antes de usarlos.",
  },
] as const;

/** Programa para médicos y clínicas: lo que reciben al asociarse. */
export const PARTNER_BENEFITS = [
  {
    title: "Ficha científica por planta",
    text: "Especie verificada, tipo de evidencia y estudios enlazados, para recetar con respaldo.",
  },
  {
    title: "Lote trazable",
    text: "Proveedor, localidad, fecha de cosecha, identificación botánica y controles de calidad de cada lote.",
  },
  {
    title: "Suministro directo",
    text: "Recibe las fórmulas en tu consulta o clínica para tus pacientes.",
  },
] as const;

/** Opciones del campo "tipo" del formulario de asociación. */
export const PARTNER_KINDS = [
  "Médico/a",
  "Clínica o centro médico",
  "Consultorio de medicina integrativa",
  "Otro profesional de salud",
] as const;

/**
 * Médicos y clínicas asociados, tal como se muestran en la sección "Profesionales".
 * Solo alianzas confirmadas y con autorización para publicar su nombre.
 * Mientras la lista esté vacía, la sección muestra una invitación a sumarse.
 */
export const PARTNERS: ReadonlyArray<{ name: string; kind: string; city: string; specialty?: string }> = [];

export const LEGAL_NOTICE = [
  "La información de este sitio es educativa y no reemplaza la consulta con un profesional de salud. Nuestros productos no están destinados a diagnosticar, tratar ni curar enfermedades. Los estudios citados son de cada planta por separado, no de nuestras fórmulas. Si estás embarazada, das de lactar o tomas medicamentos, consulta antes de usar cualquier planta.",
  "Productos en desarrollo, sujetos a registro sanitario ante DIGEMID. La información científica de este sitio no sustituye ese expediente ni demuestra por sí sola la eficacia del producto terminado.",
] as const;
