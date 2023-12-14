import { registerExtension, ExtensionHostKind } from "vscode/extensions";
import { IExtensionManifest } from "vscode/vscode/vs/platform/extensions/common/extensions";

const extension: IExtensionManifest = {
	name: "vsc-material-theme",
	publisher: "Philipp Kief",
	version: "4.32.0",
	engines: {
		vscode: "*"
	},
	contributes: {
		iconThemes: [
			{
				/* @ts-ignore */
				id: "material-icon-theme",
				label: "Material Icon Theme",
				path: "./material-icons.json"
			}
		]
	}
};

const { registerFileUrl } = registerExtension(extension, ExtensionHostKind.LocalProcess);

registerFileUrl(
	"/material-icons.json",
	new URL("./material-icons.json", import.meta.url).toString()
);

const icons = import.meta.glob("./icons/*.svg");

for (const path of Object.keys(icons)) {
	registerFileUrl(path, new URL(path, import.meta.url).toString())
}