import { registerExtension, ExtensionHostKind } from "vscode/extensions";
import { IExtensionManifest } from "vscode/vscode/vs/platform/extensions/common/extensions";

const manifest: IExtensionManifest = {
	name: "one-dark",
	version: "3.16.2",
	publisher: "zhuangtongfa",
	engines: {
		vscode: "*"
	},
	contributes: {
		themes: [
			{
				label: "One Dark",
				// @ts-ignore 
				path: "/one-dark.json",
				uiTheme: "vs-dark"
			}
		]
	}
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

registerFileUrl(
	"/one-dark.json",
	new URL("./one-dark.json", import.meta.url).toString()
);
