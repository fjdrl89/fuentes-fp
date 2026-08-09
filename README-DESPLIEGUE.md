# Cómo se publica y se mantiene

## Archivos que van al repositorio

| Archivo | Para qué |
|---|---|
| `index.html` | El sitio completo, autocontenido |
| `manifest.webmanifest` | Lo hace instalable como app |
| `sw.js` | Service worker: permite abrirlo sin conexión |
| `icono.svg`, `icono-192.png`, `icono-512.png` | Ícono de la app |
| `README.md`, `GUIA.md` | Documentación |
| `.github/workflows/verificar-enlaces.yml` | Revisión semanal de enlaces |
| `scripts/verificar_enlaces.mjs` | El verificador que usa esa revisión |
| `data.js` | Lo lee el verificador para saber qué URLs comprobar |

Sube todo con **Add file → Upload files**. Los dos últimos van en sus carpetas
(`scripts/` y `.github/workflows/`); al arrastrarlos, escribe la ruta con
diagonal en el nombre y GitHub crea la carpeta.

## Instalarlo como app

Una vez publicado sobre HTTPS, al abrir el sitio el navegador ofrece instalarlo.
En Chrome de escritorio aparece un ícono en la barra de direcciones; en Android,
"Agregar a pantalla principal"; en iPhone, desde el botón de compartir de Safari.
Instalado abre a pantalla completa y funciona sin conexión con la última versión
que hayas visitado.

Al publicar una versión nueva, sube también `sw.js` con `CACHE_VERSION` incrementado
(`fuentes-fp-v1` → `v2`). Si no, quien ya lo tenga instalado seguirá viendo la copia
guardada.

## Verificación automática de enlaces

Corre cada lunes por la mañana y también a mano desde la pestaña **Actions**.
Comprueba las 365 URLs y, si encuentra alguna rota, abre un issue titulado
"Enlaces rotos en el catálogo" con la tabla de qué corregir. Si en una revisión
posterior ya no hay rotos, cierra el issue solo.

Distingue tres cosas y solo reporta la primera:

- **Roto**: 404, 410 o el dominio dejó de existir. Hay que arreglarlo.
- **Bloqueado**: 403 o 429. El sitio rechaza peticiones automáticas — le pasa a las
  calificadoras, a Pemex y a CFE. No significa que esté caído.
- **Lento**: no respondió a tiempo.

Para probarlo en tu equipo:

```
node scripts/verificar_enlaces.mjs          # todas
node scripts/verificar_enlaces.mjs --ronda  # solo el recorrido fijo
```

## Contador de visitas

Está listo pero apagado. Para encenderlo:

1. Crea una cuenta gratuita en <https://www.goatcounter.com> y elige un subdominio.
2. Abre `scripts/generar_version_publica.mjs` y pon ese subdominio en
   `const GOATCOUNTER = ""`.
3. Vuelve a generar y sube el `index.html`.

GoatCounter no usa cookies ni requiere aviso de consentimiento, y el panel te dice
visitas por día y qué enlaces se abren más. Esa segunda métrica es la interesante:
te va a decir qué fuentes del catálogo sobran.

## Calendario de guardias

Se publica junto con el resto. Si algún día prefieres que no salga, pon
`PUBLICAR_CALENDARIO = false` en `scripts/generar_version_publica.mjs` y el
generador retira la pestaña, la sección y el rol del código.
