import { registerExtension, ExtensionHostKind } from "vscode/extensions";
import { IExtensionManifest } from "vscode/vscode/vs/platform/extensions/common/extensions";

const extension: IExtensionManifest = {
	name: "vsc-material-theme",
	publisher: "Equinusocio",
	version: "34.3.0",
	engines: {
		vscode: "*"
	},
	contributes: {
		themes: [
			{
				label: "Material Theme Darker High Contrast",
				/* @ts-ignore */
				path: "/Material-Theme-Darker-High-Contrast.json",
				uiTheme: "vs-dark"
			}
		]
	}
};

const { registerFileUrl } = registerExtension(extension, ExtensionHostKind.LocalProcess);

registerFileUrl(
	"/Material-Theme-Darker-High-Contrast.json",
	new URL("./Material-Theme-Darker-High-Contrast.json", import.meta.url).toString()
);
