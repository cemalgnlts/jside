import { ExtensionHostKind, IExtensionManifest, registerExtension } from "vscode/extensions";

import workerUrl from "./worker.js?url";

const manifest: IExtensionManifest = {
	name: "esbuild",
	publisher: "JSIDE",
	version: "1.0.0",
	browser: "/worker.js",
	engines: {
		vscode: "*"
	}
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalWebWorker);
registerFileUrl("/worker.js", new URL(workerUrl, import.meta.url).toString());