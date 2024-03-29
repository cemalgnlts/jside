const VERSION = "0.0.0"; // It will be updated automatically in the build process.
const files = []; // It will be updated automatically in the build process.
const isProduction = location.hostname === "jside.vercel.app";

// @ts-check
/// <reference lib="webworker"/>

const CACHE_NAME = `file-${VERSION}`;

self.addEventListener("message", console.log);

self.addEventListener("install", (ev) => {
  self.skipWaiting();

  const handle = async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(files);
  };

  if (isProduction) ev.waitUntil(handle());
});

self.addEventListener("activate", (ev) => {
  self.clients.claim();

  const handle = async () => {
    const keys = await caches.keys();
    const oldCaches = keys.filter((key) => key.startsWith("file-") && key !== CACHE_NAME);

    if (oldCaches.length !== 0) await Promise.all(oldCaches.map((key) => caches.delete(key)));
  };

  if (isProduction) ev.waitUntil(handle());
});

self.addEventListener("fetch", (ev) => {
  const reqUrl = new URL(ev.request.url);

  if (reqUrl.pathname.startsWith("/preview")) {
    ev.respondWith(getFileFromOPFS(reqUrl));
  } else if (reqUrl.hostname === "jside.vercel.app" && isProduction) {
    ev.respondWith(cacheFirstRequest(ev.request));
  }
});

async function cacheFirstRequest(request) {
  const resFromCache = await caches.match(request, { ignoreSearch: true });

  if (resFromCache) return resFromCache;

  const [res, cache] = await Promise.all([fetch(request), caches.open(CACHE_NAME)]);

  await cache.put(request, res.clone());

  return res;
}

async function getFileFromOPFS(reqUrl) {
  let path = `/JSIDE/${reqUrl.pathname.replace("/preview", "dist")}`;
  if (path.endsWith("/")) path = path.slice(0, -1);

  if (path === "/JSIDE/dist") path += "/index.html";

  let parentDirHandle = await navigator.storage.getDirectory();
  let fileHandle = null;

  const dirNames = path.split("/");
  dirNames.shift();

  const fileName = dirNames.pop();

  for (const name of dirNames) {
    parentDirHandle = await parentDirHandle.getDirectoryHandle(name);
  }

  /** @type {FileSystemFileHandle} */
  fileHandle = await parentDirHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();

  return new Response(file);
}
