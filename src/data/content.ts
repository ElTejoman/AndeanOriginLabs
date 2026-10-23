/** Contenido editorial de las secciones que no depende de cada hierba. */

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
    text: "Cada hierba tiene un pueblo, una región y una forma de prepararse: la puna de Junín, los valles del Cusco, las comunidades de la Amazonía.",
    items: [
      { label: "Pueblos y regiones", note: "origen" },
      { label: "Preparaciones", note: "receta" },
      { label: "Nombres propios", note: "quechua · amazónico" },
    ],
  },
} as const;

export const PRODUCT_SPECS = [
  { term: "Forma", detail: "Extracto seco en polvo" },
  { term: "Porción", detail: "Una cucharita medidora, según la etiqueta" },
  { term: "Se mezcla con", detail: "Agua tibia, jugo, emoliente, avena o batido" },
] as const;

export const RITUAL_STEPS = [
  { title: "Una cucharita", text: "Con la medida del frasco y la porción de la etiqueta." },
  { title: "Mézclala a tu manera", text: "Agua tibia como un mate, jugo, emoliente o batido." },
  { title: "Hazlo costumbre", text: "Las plantas se toman con constancia, como en casa." },
] as const;

/** Pasos del proceso. `html` admite <em class="sci"> para nombres científicos. */
export const PROCESS_STEPS: ReadonlyArray<{ title: string; html: string; knowledge: Knowledge }> = [
  {
    title: "Recolección con comunidades",
    html: "Con productores de cada región, respetando las épocas de cosecha y sin depredar el bosque.",
    knowledge: "tradicion",
  },
  {
    title: "Identificación botánica",
    html: 'Verificamos la especie con muestra de herbario. Nuestra uña de gato es <em class="sci">Uncaria tomentosa</em>, no una parecida.',
    knowledge: "ciencia",
  },
  {
    title: "Extracción a la antigua, medida en laboratorio",
    html: "Partimos de la preparación tradicional y la estandarizamos para que cada lote sea igual.",
    knowledge: "ambos",
  },
  {
    title: "Lote trazable",
    html: "Cada frasco dice de qué región viene, cuándo se cosechó y qué controles pasó.",
    knowledge: "ciencia",
  },
];

export const GLOSSARY = [
  { word: "Hampi", origin: "Quechua", meaning: "Medicina, remedio. La planta que cura." },
  { word: "Hampiq", origin: "Quechua", meaning: "Quien cura con plantas. Un saber que pasa de generación en generación." },
  { word: "Chacra", origin: "Del quechua chakra", meaning: "La tierra que se cultiva. De ahí viene todo lo que hacemos." },
  { word: "Soroche", origin: "Quechua andino", meaning: "El mal de altura. Para eso, un mate de muña." },
] as const;

export const FAQ = [
  {
    question: "¿Qué diferencia hay entre un extracto en polvo y la hierba molida?",
    answer:
      "La hierba molida es la planta seca triturada. El extracto se obtiene sacando los compuestos de la planta con agua o alcohol, como en un cocimiento o una maceración, y luego secándolos hasta quedar en polvo. Por eso se disuelve mejor y una porción pequeña rinde más.",
  },
  {
    question: "¿Cómo lo tomo?",
    answer: "Una cucharita en agua tibia, jugo, emoliente, avena o batido. Cada frasco indica la porción recomendada para esa hierba.",
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

export const LEGAL_NOTICE = [
  "La información de este sitio es educativa y no reemplaza la consulta con un profesional de salud. Nuestros productos no están destinados a diagnosticar, tratar ni curar enfermedades. Si estás embarazada, das de lactar o tomas medicamentos, consulta antes de usar cualquier hierba.",
  "Productos en desarrollo, sujetos a registro sanitario.",
] as const;
