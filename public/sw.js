const VERSION = "0.0.1"; // It will be updated automatically in the build process.
const files = []; // It will be updated automatically in the build process.

const CACHE_NAME = `file-${VERSION}`;

self.addEventListener("install", (ev) => {
	self.skipWaiting();

	const handle = async () => {
		const cache = await caches.open(CACHE_NAME);
		await cache.addAll(files);
	};

	ev.waitUntil(handle());
});

self.addEventListener("activate", (ev) => {
	self.clients.claim();

	const handle = async () => {
		const keys = await caches.keys();
		const oldCaches = keys.filter((key) => key.startsWith("file-") && key !== CACHE_NAME);

		if (oldCaches.length !== 0) await Promise.all(oldCaches.map((key) => caches.delete(key)));
	};

	ev.waitUntil(handle());
});

self.addEventListener("fetch", (ev) => {
	const handle = async () => {
		const resFromCache = await caches.match(ev.request, { ignoreSearch: true });
		if (resFromCache) return resFromCache;

		const [res, cache] = Promise.all([fetch(ev.request), cahces.open(CACHE_NAME)]);

		// const res = await fetch(ev.request);
		// const cache = await caches.open(CACHE_NAME);
		await cache.put(ev.request, res.clone());

		return res;
	};

	ev.respondWith(handle());
});
