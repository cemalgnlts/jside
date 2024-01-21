import { ExtensionHostKind, IExtensionManifest, registerExtension } from "vscode/extensions";

const manifest: IExtensionManifest = {
	name: "esbuild",
	publisher: __APP_NAME,
	version: "1.0.0",
	browser: "/worker.js",
	engines: {
		vscode: "*"
	},
	contributes: {
		commands: [
			{
				command: "esbuild.init",
				title: "Init Esbuild"
			}
		],
		menus: {
			commandPalette: [
				{
					command: "esbuild.init",
					when: "false"
				}
			]
		},
		jsonValidation: [
			{
				fileMatch: "esbuild.config.json",
				url: "./esbuildConfigSchema.json"
			}
		]
	},
	activationEvents: [
		// "workspaceContains:esbuild.config.json",
		"command:esbuild.init"
	]
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalWebWorker);
registerFileUrl("/worker.js", new URL("./worker.ts", import.meta.url).toString());
registerFileUrl("./esbuildConfigSchema.json", new URL("./esbuildConfigSchema.json", import.meta.url).toString());
