# Instrucciones para agentes de desarrollo

Este archivo aplica a todo el repositorio. Lee primero [README.md](README.md) para entender el producto y [SKILLS.md](SKILLS.md) para ejecutar los procedimientos. Las instrucciones explícitas del usuario tienen prioridad.

## Objetivo y arquitectura

Mantén un catálogo estático para comprar por WhatsApp, con Apparel y Garage Sale, traducciones y temas persistentes. El desarrollo se apoya en IA: el agente inspecciona fuentes, implementa cambios acotados y presenta evidencia; el responsable del catálogo decide inventario, precios y publicación.

- `src/data/products.json`: fuente de productos, cantidades, precios COP y rutas de fotos.
- `src/data/translations.json`: mensajes por idioma y nombres por ID de producto.
- `src/data/image-backgrounds.json`: fondo blanco uniforme por ruta de imagen.
- `src/pug/`: páginas y componentes compartidos; `partials/catalog-mixins.pug` genera tarjetas y modales.
- `src/scss/styles.scss`: estilos Bootstrap y superficies del sitio.
- `src/js/i18n.js` y `src/js/scripts.js`: idioma y tema, respectivamente.
- `scripts/`: compilación y desarrollo. `dist/` es salida generada e ignorada por Git.

## Antes de cambiar código

1. Revisa `git status`, la rama de trabajo y el destino del PR. Conserva los cambios previos del usuario y del agente.
2. Lee los archivos que determinan el comportamiento solicitado. Usa el estado actual del repositorio como evidencia.
3. Define resultados verificables: productos afectados, idioma, tema, vista móvil y navegación cuando aplique.
4. Si una foto o dato tiene una correspondencia ambigua que puede alterar una venta, resuelve esa duda antes de asignarlo. Los nombres de archivos son pistas; comprueba también el contenido.

## Reglas de implementación

- Edita las fuentes y reconstruye. Nunca corrijas una página exclusivamente en `dist/`.
- Conserva IDs estables al cambiar nombres. Sincroniza `products.<id>` en todos los idiomas.
- No inventes precios, tallas, cantidades, garantías ni atributos del producto. Respeta el precio unitario y distingue pares de paquetes.
- Conserva los archivos de fotos originales, su resolución y sus bytes salvo que se solicite una transformación. No amplíes artificialmente imágenes pequeñas para aparentar calidad.
- Las fotos deben verse completas, con sus proporciones. El área sobrante siempre usa blanco, independiente del producto y del tema del sitio. Configura cada ruta en `image-backgrounds.json`; el valor de respaldo es blanco.
- Añade textos visibles y etiquetas accesibles al diccionario. Conserva los placeholders y el idioma de los mensajes de WhatsApp.
- Mantén tema e idioma independientes y persistentes; conserva los enlaces relativos y el redireccionamiento de `shoes.html`.
- Reutiliza los mixins y los estilos existentes. Evita añadir frameworks, servicios o dependencias sin necesidad concreta.
- `WPP_ID` se incorpora en enlaces públicos durante la compilación. Nunca uses variables del frontend para guardar secretos ni expongas credenciales en logs, commits o documentación.

## Validación y entrega

Ejecuta desde la raíz:

```sh
npm run build
node --test tests/*.test.js
git diff --check
```

Para cambios visuales, revisa en navegador tarjetas y modales en móvil y escritorio, con ambos temas. Para cambios de catálogo o traducciones, comprueba disponibilidad, precio, unidades y mensajes de WhatsApp. Los tests de Node no sustituyen la revisión visual.

Revisa el diff completo y confirma que los archivos requeridos estén incluidos. Actualiza el PR autorizado con un resumen del comportamiento final y las verificaciones efectivamente ejecutadas. No declares una prueba como realizada si estuvo bloqueada. No fusiones ni publiques por el solo hecho de haber actualizado el PR: esas acciones requieren que formen parte de la solicitud del usuario. Evita sobrescribir la rama remota con un push forzado.

## Criterio de finalización

La tarea está completa cuando el cambio solicitado está implementado, las verificaciones pertinentes pasan, la documentación coincide con el código y la rama/PR autorizados contienen el resultado. Comunica cualquier limitación real pendiente.
