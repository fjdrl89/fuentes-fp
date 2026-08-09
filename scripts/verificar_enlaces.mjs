/**
 * Comprueba que las URLs del catálogo sigan vivas.
 *
 * Uso:  node scripts/verificar_enlaces.mjs            (todas)
 *       node scripts/verificar_enlaces.mjs --ronda    (solo el recorrido fijo)
 *       node scripts/verificar_enlaces.mjs --json     (salida para automatizar)
 *
 * Cómo lee los resultados:
 *
 *   OK          respondió 2xx o 3xx.
 *   ROTO        404, 410 o el dominio ya no resuelve. Esto sí hay que arreglarlo.
 *   BLOQUEADO   403 o 429: el sitio rechaza peticiones automatizadas. Muy común en
 *               calificadoras, Pemex y CFE. No significa que esté caído; hay que
 *               abrirlo a mano para confirmarlo.
 *   LENTO       no respondió dentro del tiempo límite.
 *
 * Solo se reporta como problema lo que cae en ROTO, para no llenar de ruido el
 * informe con sitios que simplemente no quieren robots.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const dataFile = path.join(projectDir, "data.js");

const TIMEOUT_MS = 20000;
const CONCURRENCY = 8;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const soloRonda = process.argv.includes("--ronda");
const comoJson = process.argv.includes("--json");

function cargarCatalogo() {
  const source = fs.readFileSync(dataFile, "utf8");
  const match = source.match(/window\.FP_DATA = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error("No se pudo leer window.FP_DATA de data.js");
  return JSON.parse(match[1]);
}

async function probar(url) {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), TIMEOUT_MS);
  const opciones = {
    redirect: "follow",
    signal: control.signal,
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "es-MX,es;q=0.9,en;q=0.8" },
  };

  try {
    // Primero HEAD, que es más barato; si el servidor no lo admite, se reintenta con GET.
    let respuesta = await fetch(url, { ...opciones, method: "HEAD" });
    if (respuesta.status === 405 || respuesta.status === 501) {
      respuesta = await fetch(url, { ...opciones, method: "GET" });
    }
    clearTimeout(reloj);

    const codigo = respuesta.status;
    if (codigo >= 200 && codigo < 400) return { estado: "OK", codigo };
    if (codigo === 403 || codigo === 429) return { estado: "BLOQUEADO", codigo };
    if (codigo === 404 || codigo === 410) return { estado: "ROTO", codigo };
    return { estado: "BLOQUEADO", codigo };
  } catch (error) {
    clearTimeout(reloj);
    if (error.name === "AbortError") return { estado: "LENTO", codigo: 0 };
    const causa = String(error.cause?.code ?? error.message);
    // El dominio ya no existe: eso sí es un enlace muerto de verdad.
    if (/ENOTFOUND|EAI_AGAIN|ERR_NAME/.test(causa)) return { estado: "ROTO", codigo: 0, detalle: "el dominio no resuelve" };
    return { estado: "BLOQUEADO", codigo: 0, detalle: causa.slice(0, 60) };
  }
}

async function enTandas(items, limite, tarea) {
  const salida = [];
  let cursor = 0;
  const trabajadores = Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (cursor < items.length) {
      const indice = cursor;
      cursor += 1;
      salida[indice] = await tarea(items[indice]);
    }
  });
  await Promise.all(trabajadores);
  return salida;
}

async function main() {
  const catalogo = cargarCatalogo()
    .filter((registro) => /^https?:/i.test(registro.url))
    .filter((registro) => (soloRonda ? Number.isFinite(registro.roundOrder) : true));

  if (!comoJson) console.log(`Comprobando ${catalogo.length} enlaces…\n`);

  const resultados = await enTandas(catalogo, CONCURRENCY, async (registro) => {
    const resultado = await probar(registro.url);
    if (!comoJson) {
      const marca = { OK: "·", ROTO: "✗", BLOQUEADO: "?", LENTO: "…" }[resultado.estado];
      if (resultado.estado !== "OK") {
        console.log(`${marca} ${resultado.estado.padEnd(10)} ${registro.name} → ${registro.url}`);
      }
    }
    return { ...registro, ...resultado };
  });

  const porEstado = (estado) => resultados.filter((r) => r.estado === estado);
  const rotos = porEstado("ROTO");
  const resumen = {
    total: resultados.length,
    ok: porEstado("OK").length,
    rotos: rotos.length,
    bloqueados: porEstado("BLOQUEADO").length,
    lentos: porEstado("LENTO").length,
  };

  if (comoJson) {
    console.log(
      JSON.stringify(
        {
          resumen,
          rotos: rotos.map((r) => ({ nombre: r.name, url: r.url, seccion: r.section, codigo: r.codigo, detalle: r.detalle })),
          bloqueados: porEstado("BLOQUEADO").map((r) => ({ nombre: r.name, url: r.url, codigo: r.codigo })),
          lentos: porEstado("LENTO").map((r) => ({ nombre: r.name, url: r.url })),
        },
        null,
        2,
      ),
    );
  } else {
    console.log(
      `\nResumen: ${resumen.ok} OK · ${resumen.rotos} rotos · ${resumen.bloqueados} bloqueados o dudosos · ${resumen.lentos} lentos`,
    );
    if (rotos.length) {
      console.log("\nEnlaces rotos que hay que corregir en fuentes/catalogo_fp.md:");
      rotos.forEach((r) => console.log(`  - ${r.name}: ${r.url} (${r.codigo || r.detalle})`));
    }
  }

  // Solo los rotos hacen fallar la comprobación.
  process.exit(rotos.length ? 1 : 0);
}

main();
