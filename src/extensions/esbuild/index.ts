import { ExtensionHostKind, IExtensionManifest, registerExtension } from "vscode/extensions";

const manifest: IExtensionManifest = {
	name: "esbuild",
	publisher: "JSIDE",
	version: "1.0.0",
	browser: "/worker.js",
	engines: {
		vscode: "*"
	},
	activationEvents: [
		"onStartupFinished"
	]
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalWebWorker);
registerFileUrl("/worker.js", new URL("./worker.ts", import.meta.url).toString());