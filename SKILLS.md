# Procedimientos de desarrollo asistido por IA

Este es el manual operativo del repositorio para agentes y desarrolladores. Complementa [AGENTS.md](AGENTS.md); no necesita instalar plugins ni ejecutar un modelo dentro del sitio. La IA se utiliza durante el desarrollo y el resultado sigue siendo un sitio estático.

## 1. Actualizar inventario

**Entrada:** lista aprobada de productos, precios unitarios, cantidades y tallas.

1. Localiza el producto por su ID en `src/data/products.json` y compara el estado actual con la entrada.
2. Mantén `id` estable. Usa un ID único para cada variante que deba mostrar stock, precio o fotos propios.
3. Guarda `price` como número en COP y `quantity` como entero. Usa `null` cuando la talla o su unidad no apliquen; no inventes valores.
4. Para productos vendidos por par, establece `saleUnit: "pair"`; tanto el precio como la cantidad corresponden a pares, no a paquetes fotografiados.
5. Actualiza `products.<id>` en cada idioma de `translations.json`. Un cambio de nombre comercial debe reflejarse también en WhatsApp.
6. Reconstruye y comprueba la tarjeta y el mensaje de compra en inglés y español.

**Resultado esperado:** inventario coherente, sin duplicados accidentales ni traducciones faltantes.

## 2. Incorporar imágenes y galerías

**Entrada:** originales adjuntos o un archivo ZIP con nombres que identifican productos.

1. Enumera los archivos y revisa sus dimensiones y contenido. Ignora metadatos de sistema del ZIP; evita extraer rutas fuera del directorio de trabajo.
2. Prepara la correspondencia archivo → ID de producto. Comprueba marca, color y variante antes de asignar.
3. Copia los originales a `src/assets/img/apparel/` o `src/assets/img/garage/` con nombres descriptivos y su formato real. Evita espacios; no recomprimas por comodidad.
4. Añade rutas relativas a `src/assets/img/` en `images`. La primera es la portada. Prefiere la imagen más nítida y representativa; la resolución por sí sola no valida la variante.
5. Conserva fotos útiles existentes, elimina duplicados y excluye fotos de otras variantes. Una galería debe corresponder a un único producto.
6. Define un color por cada ruta en `src/data/image-backgrounds.json`, por ejemplo:

```json
{
  "apparel/example-1.webp": "#ffffff",
  "apparel/example-2.jpg": "#ffffff"
}
```

Usa siempre `#ffffff` para todas las fotos. El catálogo utiliza un fondo blanco uniforme, independiente del producto, los colores de la foto y el tema. No hay detección automática en el navegador. Las tarjetas y los modales usan `object-fit: contain`; el fondo llena las bandas sobrantes sin recortar ni estirar la foto. Un color ausente o inválido usa blanco.

7. Reconstruye, comprueba la carga de cada foto y recorre los controles del modal. Revisa imágenes verticales y horizontales en ambos temas y tamaños de pantalla.
8. Compara hashes de los originales y las copias para confirmar que no cambiaron los bytes cuando se exige calidad original.

**Resultado esperado:** imágenes correctas, originales conservados y área de presentación completamente pintada.

## 3. Agregar idiomas o textos

1. Edita `src/data/translations.json`. Cada idioma tiene `name`, `locale` y `messages`.
2. Para francés, copia `languages.en` a `languages.fr`, cambia `name` a `Français`, `locale` a `fr-FR` y traduce los mensajes. El botón descubre los idiomas del JSON.
3. Conserva claves y placeholders como `{name}`, `{size}`, `{count}` y `{number}`. El respaldo usa `defaultLanguage`, actualmente `en`.
4. Conecta textos con `data-i18n` y atributos con `data-i18n-alt`, `data-i18n-aria-label` o `data-i18n-content`. Los parámetros van en `data-i18n-params` como JSON.
5. Ejecuta los tests y comprueba cambio de idioma, recarga, navegación y mensajes de WhatsApp. Los precios siguen en COP con formato colombiano.

**Resultado esperado:** traducción completa sin cambios de lógica al añadir un idioma. El respaldo tolera mensajes ausentes en ejecución; los tests exigen que los idiomas entregados estén completos.

## 4. Modificar interfaz o tema

1. Localiza la página Pug o el mixin compartido que genera el elemento.
2. Usa las variables `--shop-*` para superficies, texto y bordes del sitio. Los fondos `--product-image-background` de las fotos siempre son blancos y no cambian con el tema.
3. Conserva botones semánticos, nombres accesibles, foco visible y controles de cierre/navegación de modales.
4. Mantén la inicialización de idioma antes de `scripts.js`; el tema usa `shopI18n` y se aplica en el encabezado del documento para evitar un destello claro.
5. Revisa home, Apparel, Garage Sale y modales en ambos temas, con anchos de móvil y escritorio. Cambia idioma y tema por separado y comprueba la persistencia.

**Resultado esperado:** comportamiento consistente, sin desbordamiento horizontal ni pérdida de accesibilidad.

## 5. Preparar un PR revisable

1. Comprueba la rama y el PR autorizados; toma el estado remoto actual como base y conserva cambios ajenos.
2. Ejecuta build, tests y revisión de whitespace descritos en `AGENTS.md`. Para cambios de dependencias, ejecuta también `npm audit` y comprueba el arranque de desarrollo; el servidor debe escuchar solo en `127.0.0.1`, sin UI ni túneles.
3. Revisa los cambios de datos, rutas y traducciones además del código. No incluyas `dist/`, `node_modules`, archivos temporales, `.env` ni credenciales. La plantilla `.env.example` debe contener `WPP_ID=` sin valor.
4. Resume el resultado final y sus pruebas; señala cualquier comprobación bloqueada sin presentarla como aprobada.
5. Sube el commit a la rama del PR, verifica que contenga el cambio y deja la fusión para cuando esté solicitada.
6. El release automático corre únicamente al fusionar a `master`. Mantén el ZIP como código fuente sin archivos locales, el pin de acciones, la validación previa y la publicación desde borrador tras subir el asset. Los releases no sustituyen el deployment de Vercel.

**Resultado esperado:** un PR con alcance claro, evidencia verificable y documentación actualizada.
