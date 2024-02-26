const CDN_HOST = "https://esm.sh";

let encoder: TextEncoder | null = null;

async function fetchPackage(pkgName: string) {
  const files: Map<string, Uint8Array> = new Map();
  encoder = new TextEncoder();

  await installPackage(pkgName, files);

  encoder = null;

  return files;
}

/**
 * /(?<name>(?:@\w+\/)?\w+)[@^]?(?<version>\d.\d.\d)?/
 * -> package              => name: package, version
 * -> package@1.0.0        => name: package, version: 1.0.0
 * -> @scope/package@1.0.0 => name: @scope/package, version: 1.0.0
 */

async function installPackage(pkg: string, files: Map<string, Uint8Array>) {
  const packageReq = await sendRequest(`/*${pkg}`);
  const { name: pkgName, version } = pkg.match(/(?<name>(?:@[\w-]+\/)?[\w-]+)@?(?<version>[\d.])?/)!.groups as {
    name: string;
    version: string;
  };

  const pkgVersion = version ?? packageReq.url.slice(packageReq.url.lastIndexOf("@") + 1);
  const hasTypes = packageReq.headers.has("x-typescript-types");

  const indexFileReq = await sendRequest(`/${packageReq.headers.get("x-esm-id")}`);
  files.set(`/${pkgName}/index.js`, new Uint8Array(await indexFileReq.arrayBuffer()));

  if (hasTypes) {
    const typeUrl = packageReq.headers.get("x-typescript-types")!;
    await fetchTypes(files, typeUrl, pkgName);
  }

  const deps = await listDependencies(pkgName);

  const pkgJSON = {
    name: pkgName,
    version: `^${pkgVersion}`,
    main: "./index.js",
    types: hasTypes ? "./index.d.ts" : undefined,
    type: "module",
    dependencies:
      deps.length > 0 ? Object.fromEntries(deps.map(([dep, ver]) => [dep, ver.replace("@", "^")])) : undefined
  };

  files.set(`/${pkgName}/package.json`, encoder!.encode(JSON.stringify(pkgJSON, null, 2)));

  if (deps.length === 0) return;

  for await (const dep of deps) {
    await installPackage(dep.join(""), files);
  }
}

async function listDependencies(pkgName: string) {
  const pkgJSON = await sendRequest(`/${pkgName}/package.json`);
  const res = JSON.parse(await pkgJSON.text());
  const pkgDeps = Object.entries((res.dependencies as [string, string]) ?? []);
  return pkgDeps.map(([name, ver]) => [name, ver.replace("^", "@")]);

  // const deps = new Set<string>(pkgDeps);
  // const found: string[] = [];

  // while (deps.size !== 0) {
  //   const name = deps.values().next().value;
  //   found.push(name);
  //   deps.delete(name);

  //   const pkgJSON = await sendRequest(`/${name}/package.json`);
  //   const res = JSON.parse(await pkgJSON.text());

  //   Object.entries(res.dependencies ?? []).forEach((pack) => deps.add(pack.join("").replace("^", "@")));
  // }

  // return found;
}

async function fetchTypes(files: Map<string, Uint8Array>, baseUrl: string, pkgName: string) {
  const typeReq = await sendRequest(baseUrl);

  const indexTypeFile = await typeReq.arrayBuffer();

  files.set(`/${pkgName}/index.d.ts`, new Uint8Array(indexTypeFile));

  // const extraTypes = Array.from(indexTypeFile.matchAll(/from .(.+).;/g), (res) => new URL(res[1], baseUrl).href);

  // if (extraTypes.length === 0) return;

  // let typeReqs = await Promise.all(extraTypes.map((url) => fetch(url)));
  // typeReqs = typeReqs.filter((req) => req.ok);
}

async function sendRequest(url: string) {
  const req = await fetch(url.startsWith("http") ? url : `${CDN_HOST}${url}`);

  if (!req.ok) throw new Error(`${req.status}:${req.statusText} ${url}`);

  return req;
}

export { fetchPackage };
