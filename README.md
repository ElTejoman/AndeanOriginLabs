# Andean Origin Labs — sitio web

Sitio B2B de cuatro fórmulas de plantas del Ande y la Amazonía, en extracto hidroalcohólico o seco (gránulos), para médicos y clínicas. Incluye además una lista de espera de preventa.
Sitio **100 % estático** (sin backend): se compila a HTML, CSS y JS y se sube a GoDaddy.

## Stack

| Pieza | Versión | Para qué |
|---|---|---|
| [Astro](https://astro.build) | 7.3.8 | Generador estático, componentes `.astro`, colecciones de contenido |
| TypeScript | 6.0.3 (modo `strictest`) | Todo el código del cliente |
| three.js | 0.186.1 | Espécimen 3D del hero (hoja → molécula → frasco) |
| anime.js | 4.5.0 | Animaciones de entrada, contadores, perfil de origen |
| Fontsource | 5.3.0 | Fraunces, DM Sans y JetBrains Mono servidas desde el propio sitio |

Las versiones están fijadas con exactitud en `package.json`: se eligió la última versión estable de cada librería, no las betas.

Requisitos: Node.js 22.12 o superior.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor local en http://localhost:4321
npm run build      # verifica tipos y genera /dist
npm run preview    # sirve /dist localmente para revisarlo
```

## Estructura

```
src/
├── content/
│   ├── formulas/*.json       ← una fórmula por archivo: el producto
│   └── herbs/*.json          ← una planta por archivo: su ficha científica
├── content.config.ts         ← esquemas de fórmulas y plantas (validados con Zod)
├── data/
│   ├── site.ts               ← nombre, SEO, navegación
│   └── content.ts            ← textos de secciones: evidencia, origen, proceso, glosario, FAQ, avisos legales
├── lib/                      ← lógica pura que corre en build (plantas, fórmulas, formato es-PE, geometría del perfil)
├── styles/
│   ├── tokens.css            ← paleta, tipografías y formas de la marca (tema claro/oscuro)
│   ├── base.css              ← reset y utilidades (.wrap, .eyebrow, .night, .lab-grid)
│   └── motion.css            ← estados iniciales de las animaciones
├── components/
│   ├── ui/                   ← piezas reutilizables: Logo, Button, Jar (frasco CSS), EvidenceBadge, PartGlyph…
│   ├── layout/               ← cabecera y pie
│   ├── formulas/             ← tarjeta de fórmula
│   ├── collection/           ← tarjeta y ficha de planta (herbario)
│   └── sections/             ← una sección de la página por archivo
├── scripts/                  ← TypeScript del navegador
│   ├── core/                 ← utilidades DOM, bus de eventos y acciones declarativas (data-*)
│   ├── motion/               ← anime.js: intro del hero, revelado al hacer scroll, proceso
│   ├── specimen/             ← three.js: formas de partículas y escena
│   ├── collection/           ← filtro y ficha del herbario, perfil de origen
│   └── waitlist/             ← validación y envío del formulario a n8n
├── layouts/BaseLayout.astro  ← <head>, SEO, fuentes
└── pages/index.astro         ← la página: compone las secciones
public/                       ← favicon, imagen para redes, .htaccess, robots.txt
reference/                    ← prototipo original v5, wireframes y logo fuente (no se publica)
reference/dossier/            ← dossier científico interno y referencias verificadas (fuera de git)
```

### De dónde sale el contenido científico

Las fórmulas, las plantas, su evidencia y su abastecimiento salen del **dossier científico** de la marca. Como el repositorio es público, el dossier no se sube: va en `reference/dossier/`, que está en `.gitignore`. Pide el dossier al equipo. Ahí también está `referencias-verificadas.md`, con cada estudio comprobado (DOI, autores y hallazgos). Cuando el dossier y la verificación no coinciden, manda la verificación.

Reglas para escribir sobre una planta:

- El sitio vende: cada ficha muestra lo que dice la tradición, lo que muestran los estudios y, si los hay, los cuidados. No se escriben vacíos ni "lo que falta estudiar".
- Cada hecho se dice en neutro y tal como lo dice el estudio, sin coletillas ("pero", "solo", "débil"); tampoco se exagera. Un estudio cuyo único hallazgo es negativo no se cita.
- Siempre se dice de qué tipo es la evidencia (`evidence.level`): estudios en personas, laboratorio y animales, o uso tradicional.
- Nunca "previene", "cura" ni "trata", ni se insinúa que una fórmula está probada clínicamente: los estudios son de cada planta. Sí "ha sido investigado por…", "en ratones…" o "tradicionalmente se usa para…".

### Cómo fluye la información

- **Todo el contenido se renderiza en el HTML** al compilar: las fórmulas, las 12 fichas, las tarjetas y el perfil de origen. El JavaScript solo decide qué se muestra. Así Google indexa toda la información de las plantas.
- Las secciones no se conocen entre sí. Se comunican con eventos tipados (`scripts/core/events.ts`), que disparan atributos en el HTML (`scripts/core/actions.ts`):
  - `data-select-herb="<id>"` → `herb:select`: una planta de una fórmula o del perfil de origen abre su ficha en el herbario.
  - `data-choose-formula="<id>"` → `formula:choose`: el botón "Solicitar X" de una fórmula o de una ficha lleva a Profesionales y preselecciona esa fórmula en el formulario.
- three.js se carga con import dinámico, en un archivo aparte, para no frenar el resto de la página. Si el navegador no tiene WebGL, se muestra el frasco dibujado en CSS.
- Si el usuario pidió reducir el movimiento (`prefers-reduced-motion`), no hay animaciones y el espécimen solo cambia de figura al hacer clic.

## Agregar o editar una planta o una fórmula

1. Crea `src/content/herbs/<id>.json`, copiando uno existente. El `id` es el nombre del archivo. Completa los campos con la información del dossier y enlaza cada estudio con su DOI o PubMed.
2. Agrega su `id` a la lista `herbs` de la fórmula que la lleva, en `src/content/formulas/<fórmula>.json`. Cada planta pertenece a una sola fórmula.
   En `rationale` ("Por qué juntas"), cada razón puede citar los estudios que la respaldan con `{ "herb": "<id>", "study": <n> }`, donde `n` es la posición del estudio en la lista `studies` de esa planta (1 = el primero). Cada cita se muestra como un botón al estudio. Si reordenas los estudios de una planta, revisa estas citas.
3. Ubícala en el perfil de origen: en `src/data/content.ts`, agrégala a su zona en `SOURCING_ZONES` (con `supplierPending` si la zona está definida pero el proveedor no), o a `SOURCING_PENDING` si el dossier no indica zona.
4. Si algo falta o está mal (una fórmula molecular inválida, una URL mal escrita, una planta que no existe, un estudio citado que no existe o que es de una planta que la fórmula no lleva), el build falla con un mensaje claro.

La planta aparece sola en la cinta, su fórmula, el herbario y el perfil de origen. Una fórmula nueva aparece sola en la sección de fórmulas, en el filtro del herbario y en el formulario.

## Formulario de preventa → n8n

El formulario envía un `POST` con JSON al webhook definido en `PUBLIC_WAITLIST_WEBHOOK_URL`:

```json
{
  "nombre": "Rosa",
  "correo": "rosa@correo.pe",
  "formula": "tri-kaspi",
  "formulaNombre": "Tri-Kaspi",
  "origen": "web",
  "pagina": "https://andeanoriginlabs.com/",
  "enviadoEn": "2026-10-23T15:04:05.000Z"
}
```

Configuración:

1. En n8n, crea un nodo **Webhook** con método `POST` y "Respond: Immediately" (o un nodo Respond to Webhook con código 200).
2. En las opciones del Webhook, en **Allowed Origins (CORS)**, pon el dominio del sitio (`https://andeanoriginlabs.com`). Sin esto, el navegador bloquea el envío.
3. Copia `.env.example` a `.env` y pega la URL **de producción** del webhook (no la de test).
4. Vuelve a ejecutar `npm run build`: la URL queda incrustada en el sitio.

Sin la variable, el formulario funciona en **modo demostración**: valida y agradece, pero no envía nada, y muestra un aviso.
El formulario incluye un campo trampa invisible (`empresa`) para filtrar bots.

## Publicar en GoDaddy

1. Configura `.env` con `SITE_URL` (dominio final) y `PUBLIC_WAITLIST_WEBHOOK_URL`.
2. Ejecuta `npm run build`.
3. En cPanel → **Administrador de archivos**, entra a `public_html` y sube **el contenido** de `dist/` (no la carpeta en sí), incluido el archivo oculto `.htaccess`. También puedes subirlo por FTP.
4. El `.htaccess` fuerza HTTPS, comprime los archivos y guarda en caché los recursos con hash.

Para actualizar el sitio, repite los pasos 2 y 3 reemplazando los archivos. Puedes borrar la carpeta `_astro` vieja antes de subir.

## Diseño

- Concepto: un "laboratorio en la selva". Las bandas nocturnas tienen retícula de laboratorio y las secciones claras parecen papel milimetrado de libreta de campo.
- El tema claro u oscuro sigue la configuración del sistema. Las bandas nocturnas y el frasco se ven igual en ambos temas.
- El logo (`components/ui/LogoMark.astro`) es una versión vectorial de `reference/Logo_AOL.jpeg`. Para piezas impresas o en gran tamaño conviene pedir el vector original al diseñador.
