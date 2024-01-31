const CDN_HOST = "https://esm.sh";

async function fetchPackage(packageName: string) {
  const files = new Map<string, string>();

  const packageReq = await fetch(`${CDN_HOST}/${packageName}`);

  if (!packageReq.ok) throw new Error(`${packageReq.status}:${packageReq.statusText}`);

  const packageVersion = packageReq.url.slice(packageReq.url.lastIndexOf("@") + 1);

  if (packageReq.headers.has("x-typescript-types")) {
    const typeUrl = packageReq.headers.get("x-typescript-types")!;
    await fetchTypes(files, typeUrl, packageName);
  }

  const indexFile = await packageReq.text();

  // Convert: export * from "/v135/packageName.js" -> export * from "./packageName.js"
  const pathsModifiedIndexFile = indexFile.replace(/from ".+";/g, (line) => `from "./${line.split("/").pop()}`);
  files.set("index.js", pathsModifiedIndexFile);

  // Extra script files.
  let libs: Set<string> | Array<string> = new Set(
    [...indexFile.matchAll(/from "(.*)";/g)].map((match) => match[1])
  );

  libs = Array.from(libs, (lib) => `${CDN_HOST}${lib}`);

  let libRes = await Promise.all(libs.map((url) => fetch(url)));
  libRes = libRes.filter((res) => res.ok);

  for (const res of libRes) {
    const fileName = res.url.split("/").pop()!;
    files.set(fileName, await res.text());
  }

  return { files, packageVersion };
}

async function fetchTypes(files: Map<string, string>, baseUrl: string, packageName: string) {
  const typeReq = await fetch(baseUrl);

  if (!typeReq.ok) throw new Error(`${typeReq.status}:${typeReq.statusText}`);

  const indexTypeFile = await typeReq.text();

  files.set(`types/${packageName}/index.d.ts`, indexTypeFile);

  // const extraTypes = Array.from(indexTypeFile.matchAll(/from .(.+).;/g), (res) => new URL(res[1], baseUrl).href);

  // if (extraTypes.length === 0) return;

  // let typeReqs = await Promise.all(extraTypes.map((url) => fetch(url)));
  // typeReqs = typeReqs.filter((req) => req.ok);
}

export { fetchPackage };
