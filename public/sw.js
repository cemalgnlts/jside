const VERSION = "0.0.1"; // It will be updated automatically in the build process.
const files = []; // It will be updated automatically in the build process.

const CACHE_NAME = `file-${VERSION}`;

self.addEventListener("install", (ev) => {
	const handle = async () => {
		self.skipWaiting();

		const cache = await caches.open(CACHE_NAME);
		await cache.addAll(files);
	};

	ev.waitUntil(handle());
});

self.addEventListener("activate", (ev) => {
	const handle = async () => {
		clients.claim();
		
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

		const res = await fetch(ev.request);
		const cache = await caches.open(CACHE_NAME);
		await cache.put(ev.request, res.clone());

		return res;
	};

	ev.respondWith(handle());
});
