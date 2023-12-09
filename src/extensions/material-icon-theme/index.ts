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

registerFileUrl(
    "./icons/folder-root.svg",
    new URL("./icons/folder-root.svg", import.meta.url).toString()
);

registerFileUrl(
    "./icons/folder-root-open.svg",
    new URL("./icons/folder-root-open.svg", import.meta.url).toString()
);

registerFileUrl(
    "./icons/folder.svg",
    new URL("./icons/folder.svg", import.meta.url).toString()
);

registerFileUrl(
    "./icons/folder-open.svg",
    new URL("./icons/folder-open.svg", import.meta.url).toString()
);

registerFileUrl(
    "./icons/file.svg",
    new URL("./icons/file.svg", import.meta.url).toString()
);

registerFileUrl(
    "./icons/javascript.svg",
    new URL("./icons/javascript.svg", import.meta.url).toString()
);

registerFileUrl(
    "./icons/typescript.svg",
    new URL("./icons/typescript.svg", import.meta.url).toString()
);