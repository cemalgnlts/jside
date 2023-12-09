import { initialize as initializeServices } from "vscode/services";

// services
import getDialogsServiceOverride from "@codingame/monaco-vscode-dialogs-service-override";
import getStorageServiceOverrride from "@codingame/monaco-vscode-storage-service-override";
import getViewsServiceOverride, {
	Parts,
	attachPart,
	isEditorPartVisible,
	isPartVisibile,
	onPartVisibilityChange,
	setPartVisibility
} from "@codingame/monaco-vscode-views-service-override";
import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";
import getConfigurationServiceOverride, {
	initUserConfiguration
} from "@codingame/monaco-vscode-configuration-service-override";
import { createIndexedDBProviders, registerFileSystemOverlay } from "@codingame/monaco-vscode-files-service-override";
import getExtensionsServiceOverride, { WorkerConfig } from "@codingame/monaco-vscode-extensions-service-override";
import getStatusBarServiceOverride from "@codingame/monaco-vscode-view-status-bar-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getNotificationsServiceOverride from "@codingame/monaco-vscode-notifications-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getSnippetsServiceOverride from "@codingame/monaco-vscode-snippets-service-override";
import getQuickAccessServiceOverride from "@codingame/monaco-vscode-quickaccess-service-override";
import getOutputServiceOverride from "@codingame/monaco-vscode-output-service-override";
import getMarkersServiceOverride from "@codingame/monaco-vscode-markers-service-override";
import getLifecycleServiceOverride from "@codingame/monaco-vscode-lifecycle-service-override";
import getAccessibilityServiceOverride from "@codingame/monaco-vscode-accessibility-service-override";
import getLogServiceOverride from "@codingame/monaco-vscode-log-service-override";
import getEnvironmentServiceOverride from "@codingame/monaco-vscode-environment-service-override";
import getWorkingCopyServiceOverride from "@codingame/monaco-vscode-working-copy-service-override";

// Languages
import "@codingame/monaco-vscode-html-default-extension";
import "@codingame/monaco-vscode-css-default-extension";
import "@codingame/monaco-vscode-javascript-default-extension";
import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "@codingame/monaco-vscode-json-default-extension";
import "@codingame/monaco-vscode-typescript-language-features-default-extension";
import "monaco-editor/esm/vs/editor/contrib/format/browser/formatActions.js";

// Themes
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-theme-seti-default-extension";
import "../../extensions/vsc-material-theme";

// Workers
import EditorWorkerUrl from "monaco-editor/esm/vs/editor/editor.worker.js?url";
import TextMateWorkerUrl from "@codingame/monaco-vscode-textmate-service-override/worker?url";
import OutputLinkComputerWorkerUrl from "@codingame/monaco-vscode-output-service-override/worker?url";

import { Uri, workspace } from "vscode";

import "vscode/localExtensionHost";

import { openNewCodeEditor } from "./openNewEditor";

import userConfig from "./userConfiguration.json?raw";
import WebFileSystem from "../WebFileSystem";

type Panels = Array<{
	panel: Parts;
	element: HTMLDivElement;
}>;

const workspaceUri = Uri.file("/workspace.code-workspace");

window.MonacoEnvironment = {
	getWorker(moduleId, label) {
		let url = "";

		switch (label) {
			case "editorWorkerService":
				url = EditorWorkerUrl;
				break;
			case "textMateWorker":
				url = TextMateWorkerUrl;
				break;
			case "outputLinkComputer":
				url = OutputLinkComputerWorkerUrl;
				break;
			default:
				throw new Error(`Unimplemented worker ${label} (${moduleId})`);
		}

		return new CrossOriginWorker(new URL(url, import.meta.url), { type: "module" });
	}
};

export async function init() {
	const fakeWorker = new FakeWorker(new URL("vscode/workers/extensionHost.worker", import.meta.url), {
		type: "module"
	});

	const workerConfig: WorkerConfig = {
		url: fakeWorker.url.toString(),
		options: fakeWorker.options
	};

	await createIndexedDBProviders();
	await initUserConfiguration(userConfig);

	await initializeServices(
		{
			...getExtensionsServiceOverride(workerConfig),
			...getWorkingCopyServiceOverride(),
			...getStorageServiceOverrride(),
			...getConfigurationServiceOverride(),
			...getLogServiceOverride(),
			...getEnvironmentServiceOverride(),
			...getStatusBarServiceOverride(),
			...getViewsServiceOverride(openNewCodeEditor, undefined, (state) => ({
				...state,
				editor: {
					...state.editor,
					restoreEditors: true
				}
			})),
			...getAccessibilityServiceOverride(),
			...getModelServiceOverride(),
			...getLanguagesServiceOverride(),
			...getTextmateServiceOverride(),
			...getSnippetsServiceOverride(),
			...getQuickAccessServiceOverride({
				isKeybindingConfigurationVisible: () => false,
				shouldUseGlobalPicker: (_, isStandalone) => !isStandalone && isEditorPartVisible()
			}),
			...getNotificationsServiceOverride(),
			...getDialogsServiceOverride(),
			...getThemeServiceOverride(),
			...getOutputServiceOverride(),
			...getMarkersServiceOverride(),
			...getLifecycleServiceOverride()
		},
		document.body,
		{
			workspaceProvider: {
				trusted: true,
				open: async () => false,
				workspace: { workspaceUri }
			}
		}
	);

	await initFS();
}

async function initFS() {
	const rootDirHandle = await navigator.storage.getDirectory();
	const projectsDirHandle = await rootDirHandle.getDirectoryHandle("projects");

	const webFS = new WebFileSystem();
	await webFS.mount(projectsDirHandle);

	registerFileSystemOverlay(1, webFS);

	workspace.updateWorkspaceFolders(0, 0, { uri: Uri.file(projectsDirHandle.name) });
}

export function attachPanels(panels: Panels) {
	for (const { panel, element } of panels) {
		attachPart(panel, element);

		if (!isPartVisibile(panel)) element.style.display = "none";

		onPartVisibilityChange(panel, (visible) => (element.style.display = visible ? "" : "none"));
	}

	setPartVisibility(Parts.PANEL_PART, false);
}

/**
 * Cross origin workers don't work
 * The workaround used by vscode is to start a worker on a blob url containing a short script calling 'importScripts'
 * importScripts accepts to load the code inside the blob worker
 */
class CrossOriginWorker extends Worker {
	constructor(url: string | URL, options: WorkerOptions = {}) {
		const fullUrl = new URL(url, window.location.href).href;
		const js = options.type === "module" ? `import '${fullUrl}';` : `importScripts('${fullUrl}');`;
		const blob = new Blob([js], { type: "application/javascript" });
		super(URL.createObjectURL(blob), options);
	}
}

class FakeWorker {
	constructor(public url: string | URL, public options?: WorkerOptions) {}
}
