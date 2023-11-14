importScripts("./FileSystem.js");

const fileSystem = new FileSystem();

let baseUrl = self.location.href.split("/");
baseUrl.pop();
baseUrl.push("preview");
baseUrl = baseUrl.join("/");

self.addEventListener("fetch", (ev) => {
  if (ev.request.url.startsWith("https://esm.sh"))
    return ev.respondWith(fetch(ev.request));

  let path = ev.request.url.slice(baseUrl.length);
  if (path === "") path = "/index.html";

  ev.respondWith(
    (async () => {
      const blob = await fileSystem.readFile(path);

      return new Response(blob);
    })()
  );
});

self.addEventListener("install", (ev) => {
  console.log("Service worker ready!");
});
