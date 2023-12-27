import { editor } from "monaco-editor";
import { ProviderResult, Uri } from "vscode";
import { ExtensionHostKind, registerExtension } from "vscode/extensions";

const manifest = {
	name: "search-provider",
	publisher: "JSIDE",
	version: "1.0.0",
	engines: {
		vscode: "*"
	},
	enabledApiProposals: ["fileSearchProvider"]
};

const { getApi, setAsDefaultApi } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

async function activate() {
	await setAsDefaultApi();
	
	const api = await getApi();

	api.workspace.registerFileSearchProvider("file", {
		provideFileSearchResults: function (): ProviderResult<Uri[]> {
			return editor
				.getModels()
				.map((model) => model.uri)
				.filter((uri) => uri.scheme === "file");
		}
	});
}

export default activate;
