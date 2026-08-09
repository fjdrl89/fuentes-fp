# Fuentes FP · Directorio de finanzas públicas de México

Directorio interactivo de **169 fuentes** en 99 dominios para el seguimiento de las
finanzas públicas mexicanas: dependencias federales, empresas productivas del Estado,
calificadoras, poder legislativo, prensa especializada, think tanks, organismos
internacionales y portales de datos abiertos.

Cada ficha incluye tipo de fuente, prioridad, tipo de acceso (abierto, con registro o
por suscripción), temas, región e idioma, además de una descripción de qué conviene
buscar en ella.

## Qué hace

- **Buscador y filtros** por categoría, prioridad, tipo, sección, tema, acceso, región e idioma.
- **Ronda de revisión**: 25 fuentes en orden fijo, con casillas de avance que se
  reinician solas cada día.
- **Bitácora del día**: notas por fuente más una valoración general, exportable en Markdown.
- **Incidencias**: registro de enlaces rotos o accesos restringidos, exportable en CSV.
- **Favoritos** y exportación del catálogo filtrado en CSV.

Todo el estado (ronda, bitácora, favoritos, incidencias) vive en el `localStorage` del
navegador de cada persona. No hay servidor, no hay cuentas y no se envía nada a ningún
lado. Quien abra el sitio tiene su propio avance.

## Cómo está hecho

Una sola página HTML autocontenida: el CSS, el JavaScript y los datos van incrustados
en `index.html`. Sin dependencias, sin build, sin framework. Funciona igual servida
desde internet que abierta como archivo local.

El catálogo se mantiene en un archivo Markdown con tablas y se compila a datos con un
script de Node. Una ruta distinta cuenta como una fuente distinta: si una institución
tiene varias secciones útiles, cada URL permanece como ficha independiente. Solo se
descartan URLs exactamente repetidas.

## Publicar los cambios

Sustituye `index.html` por la versión nueva y haz commit. GitHub Pages republica solo
en menos de un minuto.

Nota sobre Jekyll: GitHub procesa los sitios con Jekyll de forma predeterminada, pero
esta página no contiene sintaxis Liquid (`{{` o `{%`) ni archivos que empiecen con guion
bajo, así que pasa intacta. Si más adelante agregas contenido con esas características,
crea un archivo vacío llamado `.nojekyll` en la raíz del repositorio (desde GitHub:
Add file → Create new file, escribe `.nojekyll` como nombre y deja el contenido vacío).

## Aviso

Las URLs son de acceso público y se recopilaron con fines de consulta. Las
descripciones y el orden de revisión son criterio propio del autor, no de las
instituciones enlazadas. Los enlaces pueden cambiar o romperse sin aviso.
