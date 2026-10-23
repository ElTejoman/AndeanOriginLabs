# Andean Origin Labs — sitio web

Landing de preventa de extractos en polvo de hierbas del Ande y la Amazonía.
Sitio **100 % estático** (sin backend): se compila a HTML, CSS y JS y se sube a GoDaddy.

## Stack

| Pieza | Versión | Para qué |
|---|---|---|
| [Astro](https://astro.build) | 7.3.8 | Generador estático, componentes `.astro`, colecciones de contenido |
| TypeScript | 6.0.3 (modo `strictest`) | Todo el código del cliente |
| three.js | 0.186.1 | Espécimen 3D del hero (hoja → molécula → frasco) |
| anime.js | 4.5.0 | Animaciones de entrada, contadores, perfil de altitud |
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
├── content/herbs/*.json      ← una hierba por archivo (validado con Zod)
├── content.config.ts         ← esquema de las hierbas
├── data/
│   ├── site.ts               ← nombre, SEO, navegación
│   └── content.ts            ← textos de secciones: proceso, glosario, FAQ, avisos legales
├── lib/                      ← lógica pura que corre en build (formato es-PE, geometría del perfil)
├── styles/
│   ├── tokens.css            ← paleta, tipografías y formas de la marca (tema claro/oscuro)
│   ├── base.css              ← reset y utilidades (.wrap, .eyebrow, .night, .lab-grid)
│   └── motion.css            ← estados iniciales de las animaciones
├── components/
│   ├── ui/                   ← piezas reutilizables: Logo, Button, Jar (frasco CSS), FormulaPill…
│   ├── layout/               ← cabecera y pie
│   ├── collection/           ← tarjeta y ficha de hierba
│   └── sections/             ← una sección de la página por archivo
├── scripts/                  ← TypeScript del navegador
│   ├── core/                 ← utilidades DOM y bus de eventos entre secciones
│   ├── motion/               ← anime.js: intro del hero, revelado al hacer scroll, proceso
│   ├── specimen/             ← three.js: formas de partículas y escena
│   ├── collection/           ← filtro, ficha y perfil de altitud
│   └── waitlist/             ← validación y envío del formulario a n8n
├── layouts/BaseLayout.astro  ← <head>, SEO, fuentes
└── pages/index.astro         ← la página: compone las secciones
public/                       ← favicon, imagen para redes, .htaccess, robots.txt
reference/                    ← prototipo original v5, wireframes y logo fuente (no se publica)
```

### Cómo fluye la información

- **Todo el contenido se renderiza en el HTML** al compilar: las 8 fichas, las tarjetas y el perfil de altitud. El JavaScript solo decide qué se muestra. Así Google indexa toda la información de las hierbas.
- Las secciones no se conocen entre sí: se comunican con eventos tipados (`scripts/core/events.ts`):
  - `herb:select`: un pin del perfil de altitud abre una ficha de la colección.
  - `herb:reserve`: el botón "Reservar X" de una ficha preselecciona esa hierba en el formulario.
- three.js se carga con import dinámico, en un archivo aparte, para no frenar el resto de la página. Si el navegador no tiene WebGL, se muestra el frasco dibujado en CSS.
- Si el usuario pidió reducir el movimiento (`prefers-reduced-motion`), no hay animaciones y el espécimen solo cambia de figura al hacer clic.

## Agregar o editar una hierba

1. Crea `src/content/herbs/<id>.json`, copiando uno existente. El `id` es el nombre del archivo.
2. Completa los campos. Si algo falta o está mal (por ejemplo, una fórmula inválida o una altitud fuera de rango), el build falla con un mensaje claro.
3. La hierba aparece sola en la cinta, la colección, el perfil de altitud y el formulario.
4. Opcional: en `src/lib/altitudeProfile.ts` (`LABEL_Y`) ajusta la altura de su etiqueta en el perfil si se superpone con otra.

## Formulario de preventa → n8n

El formulario envía un `POST` con JSON al webhook definido en `PUBLIC_WAITLIST_WEBHOOK_URL`:

```json
{
  "nombre": "Rosa",
  "correo": "rosa@correo.pe",
  "hierba": "maca",
  "hierbaNombre": "Maca",
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
