# WhatsApp Shop — Apparel & Garage Sale

Catálogo estático de ropa, calzado, accesorios y artículos de Garage Sale. El cliente revisa precio, disponibilidad y fotos, y abre WhatsApp con el producto y su talla en el mensaje. Los precios se muestran en pesos colombianos (COP).

Incluye inglés/español, selección persistente de idioma y tema claro/oscuro, galerías ampliables y diseño adaptable. El inventario se mantiene en archivos JSON y se convierte en HTML durante la compilación. No hay un backend de pedidos, pagos ni reserva automática de stock.

## Iniciar el proyecto

Requiere Node.js con el ejecutor `node --test` y npm; se recomienda Node.js 22. Instala las dependencias del lockfile:

```sh
git clone https://github.com/CepedaBrayan/startbootstrap-shop-homepage.git
cd startbootstrap-shop-homepage
npm ci
```

Copia `.env.example` a `.env` y configura el número de WhatsApp, incluyendo código de país y solo dígitos:

```dotenv
WPP_ID=573001234567
```

El número de ejemplo debe sustituirse por el del vendedor. `WPP_ID` se incorpora en los enlaces públicos al compilar; no es un secreto. `.env` y sus variantes locales se ignoran en Git; solo se versiona `.env.example`, con `WPP_ID` vacío. Eliminar `.env` de la rama no borra sus versiones históricas. No guardes credenciales en el frontend.

```sh
npm start
```

Este comando compila el sitio, inicia BrowserSync y observa las fuentes. Usa la URL `http://127.0.0.1:3000` que muestra la terminal (si el puerto está ocupado, consulta el puerto elegido). El servidor escucha exclusivamente en `127.0.0.1`; la interfaz de administración y los túneles están desactivados. La configuración compartida está en `scripts/browser-sync-config.js`. `npm run start:debug` mantiene el mismo aislamiento y limita el inspector a `127.0.0.1:9229`. Los cambios de productos, traducciones, fondos y componentes compartidos reconstruyen las páginas. Si cambias `.env`, reinicia el proceso para recompilar con el nuevo número.

## Comandos

| Comando | Resultado |
| --- | --- |
| `npm run build` | Limpia y genera todo el sitio en `dist/` |
| `npm start` | Compilación, servidor local y recarga automática |
| `npm run build:pug` | Genera HTML desde Pug y los datos JSON |
| `npm run build:scss` | Compila Bootstrap y los estilos propios |
| `npm run build:scripts` | Copia JavaScript del navegador |
| `npm run build:assets` | Copia imágenes y demás assets |
| `node --test tests/*.test.js` | Verifica traducciones y coherencia del catálogo/fondos |
| `git diff --check` | Comprueba errores de whitespace |

`dist/` es salida generada: modifica `src/` y reconstruye. Para alojar el sitio, publica el contenido completo de `dist/` en un servidor estático conservando su estructura de carpetas. Configura `WPP_ID` en el entorno de compilación. Bootstrap JS se carga desde jsDelivr; las fotos, estilos y scripts propios se sirven desde el sitio.

## Dónde modificar cada cosa

| Fuente | Responsabilidad |
| --- | --- |
| `src/data/products.json` | Productos agrupados en `apparel` y `garage` |
| `src/data/translations.json` | Idiomas, textos y nombres traducidos |
| `src/data/image-backgrounds.json` | Color de fondo por foto |
| `src/assets/img/` | Archivos originales de imágenes |
| `src/pug/index.pug` | Página de categorías |
| `src/pug/views/` | Apparel, Garage Sale y redirección antigua de Shoes |
| `src/pug/partials/catalog-mixins.pug` | Tarjetas, precio, enlaces y modales compartidos |
| `src/scss/styles.scss` | Estilos del sitio y presentación de fotos |
| `src/js/i18n.js` | Traducción y persistencia del idioma |
| `src/js/scripts.js` | Selección y persistencia del tema |
| `scripts/` | Compilación y observación de fuentes |

## Mantener productos y fotos

Cada producto tiene `id`, `name`, `quantity`, `size`, `sizeUnit`, `price` e `images`. `price` es un número en COP; `images` contiene rutas relativas a `src/assets/img/`. `size` y `sizeUnit` pueden ser `null`. Para venta por par, usa `saleUnit: "pair"`: cantidad y precio representan pares individuales.

Mantén IDs estables al renombrar productos. Añade o actualiza `products.<id>` en todos los idiomas. Separa variantes con stock y fotos propios: las medias Adidas blancas, Puma blancas y Puma negras son productos distintos.

La primera foto de `images` es la portada; las demás aparecen en el modal. Conserva formato y resolución originales. Las fotos se muestran completas y proporcionadas. El fondo del espacio sobrante se configura por ruta en `image-backgrounds.json`, con un color hexadecimal de seis dígitos: usa siempre `#ffffff` en todas las rutas para mantener un fondo blanco uniforme. El fondo permanece blanco al cambiar de tema. El respaldo para una ruta ausente o un color inválido es blanco. No se detectan colores automáticamente en el navegador.

## Idiomas y tema

`translations.json` contiene `defaultLanguage` y `languages`. Cada idioma define `name`, `locale` y `messages`. Para añadir francés, copia `en` a `fr`, usa `Français` y `fr-FR`, y traduce todas las entradas conservando claves y placeholders. No hace falta cambiar JavaScript: el botón recorre los idiomas del diccionario.

En la primera visita se usa un idioma compatible del navegador o el idioma predeterminado; los mensajes ausentes usan el respaldo configurado. El tema sigue la preferencia del sistema hasta que se elige otro. Las selecciones explícitas se guardan en el navegador y se conservan al navegar. Idioma y tema funcionan de forma independiente. El diccionario se integra en el HTML durante el build; editarlo exige reconstruir.

## Desarrollo dirigido por IA

El repositorio está preparado para que un agente pueda continuar el trabajo con contexto explícito, fuentes identificadas y verificaciones reproducibles:

- [AGENTS.md](AGENTS.md): instrucciones generales, límites de edición y criterio de finalización.
- [SKILLS.md](SKILLS.md): procedimientos para inventario, fotos, idiomas, interfaz y entrega de PRs.

El ciclo de trabajo es **inspeccionar → implementar → validar → revisar el diff → actualizar el PR**. La IA ayuda a ejecutar los cambios; los datos comerciales provienen del responsable del catálogo. El sitio generado funciona sin servicios de IA.

Para revisar dependencias sin cambiar el lockfile, ejecuta `npm audit`; mantén sus correcciones verificadas mediante build y tests.

La revisión del 15 de octubre de 2026 redujo los paquetes con alertas de 29 a 6. Las seis alertas restantes derivan de `braces` (GHSA-vfj7-8cjw-p6xm), que no tiene una versión corregida publicada. Afectan al árbol de desarrollo de BrowserSync/Chokidar/ShellJS; los patrones usados por el proyecto son fijos y el servidor queda limitado a loopback. `npm audit --omit=dev` reportó cero alertas. Esto no convierte las alertas de desarrollo en resueltas: deben reevaluarse cuando los mantenedores publiquen correcciones. No fuerces downgrades o exclusiones de auditoría para ocultarlas. Publica solo `dist/`: `npm start` y `start:debug` son herramientas de desarrollo local.

Antes de entregar un cambio:

```sh
npm run build
node --test tests/*.test.js
git diff --check
```

Para cambios visuales, comprueba tarjetas y galerías en móvil/escritorio y en ambos temas. Para cambios de inventario o textos, verifica también cantidades, unidades y mensajes de WhatsApp en cada idioma. Informa las pruebas realmente ejecutadas y cualquier limitación pendiente.

## Licencia y origen

Proyecto adaptado de **Start Bootstrap — Shop Homepage**, con Bootstrap 5.2.3. Se conserva la licencia [MIT](LICENSE) y la atribución del proyecto original. Las fotografías y marcas de productos corresponden a sus respectivos titulares; la licencia del código no implica derechos sobre esos materiales.
