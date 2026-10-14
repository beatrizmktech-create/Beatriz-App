/* Modo offline: guarda o app no celular. Mostra a versão guardada na hora
 * e busca a nova em segundo plano; a atualização aparece na próxima abertura.
 * Ao mudar arquivos do app, suba o número da VERSAO. */
const VERSAO = "rotina-v1";
const ARQUIVOS = [
  "./", "index.html", "styles.css", "app.js", "plano.js", "manifest.webmanifest",
  "icones/icone-192.png", "icones/icone-512.png", "icones/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fonte = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !fonte) return;
  if (url.pathname.endsWith(".ics")) return; // calendário sempre da rede
  e.respondWith(
    caches.open(VERSAO).then(async (cache) => {
      const guardado = await cache.match(req, { ignoreSearch: true });
      const rede = fetch(req).then((resp) => {
        if (resp && (resp.ok || resp.type === "opaque")) cache.put(req, resp.clone());
        return resp;
      }).catch(() => guardado);
      return guardado || rede;
    })
  );
});
