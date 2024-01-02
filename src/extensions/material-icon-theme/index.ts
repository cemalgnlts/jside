import { registerExtension, ExtensionHostKind } from "vscode/extensions";
import { IExtensionManifest } from "vscode/vscode/vs/platform/extensions/common/extensions";
import { encodeSVG } from "../../utils/utils";

const manifest: IExtensionManifest = {
	name: "vsc-material-theme",
	publisher: "Philipp Kief",
	version: "4.32.0",
	engines: {
		vscode: "*"
	},
	contributes: {
		iconThemes: [
			{
				// @ts-expect-error Unknown type.
				id: "material-icon-theme",
				label: "Material Icon Theme",
				path: "./material-icons.json"
			}
		]
	}
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

registerFileUrl("/material-icons.json", new URL("./material-icons.json", import.meta.url).toString());

const icons = import.meta.glob("./icons/*.svg", {
	as: "raw",
	eager: true
});

for (const [path, svg] of Object.entries(icons)) {
	registerFileUrl(path, encodeSVG(svg));
}
