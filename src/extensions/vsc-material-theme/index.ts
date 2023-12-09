import { registerExtension, ExtensionHostKind } from "vscode/extensions";

const extension = {
	name: "vsc-material-theme",
	publisher: "Equinusocio",
	version: "34.3.0",
	engines: {
		vscode: "*"
	},
	contributes: {
		themes: [
			{
				label: "Material Theme Ocean High Contrast",
				path: "/Material-Theme-Ocean-High-Contrast.json",
				uiTheme: "vs-dark"
			}
		]
	}
};

const { registerFileUrl } = registerExtension(extension, ExtensionHostKind.LocalProcess);

registerFileUrl(
	"/Material-Theme-Ocean-High-Contrast.json",
	new URL("./Material-Theme-Ocean-High-Contrast.json", import.meta.url)
);
