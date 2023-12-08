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

// Languages
import "@codingame/monaco-vscode-html-default-extension";
import "@codingame/monaco-vscode-css-default-extension";
import "@codingame/monaco-vscode-javascript-default-extension";
import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "@codingame/monaco-vscode-json-default-extension";
import "@codingame/monaco-vscode-typescript-language-features-default-extension";

// Themes
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-theme-seti-default-extension";

import { openNewCodeEditor } from "./openNewEditor";
import { Uri, workspace } from "vscode";

import "vscode/localExtensionHost";

import userConfig from "./userConfiguration.json?raw";
import WebFileSystem from "../WebFileSystem";
import { IWorkbenchLayoutService, Position } from "vscode/vscode/vs/workbench/services/layout/browser/layoutService";

type Panels = Array<{
	panel: Parts;
	element: HTMLDivElement;
}>;

const workspaceUri = Uri.file("/workspace.code-workspace");
let userDataProvider;

type WorkerLoader = () => Worker;
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
	editorWorkerService: () =>
		new CrossOriginWorker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), { type: "module" }),
	textMateWorker: () =>
		new CrossOriginWorker(new URL("@codingame/monaco-vscode-textmate-service-override/worker", import.meta.url), {
			type: "module"
		}),
	outputLinkComputer: () =>
		new CrossOriginWorker(new URL("@codingame/monaco-vscode-output-service-override/worker", import.meta.url), {
			type: "module"
		})
};

window.MonacoEnvironment = {
	getWorker: (moduleId, label) => {
		const workerFactory = workerLoaders[label];

		if (workerFactory != null) {
			return workerFactory();
		}

		throw new Error(`Unimplemented worker ${label} (${moduleId})`);
	}
};

export async function init() {
	userDataProvider = await createIndexedDBProviders();
	await initUserConfiguration(userConfig);

	await initializeServices(
		{
			...getExtensionsServiceOverride(workerConfig),
			...getStorageServiceOverrride(),
			...getConfigurationServiceOverride(),
			...getAccessibilityServiceOverride(),
			...getLogServiceOverride(),
			...getEnvironmentServiceOverride(),
			...getViewsServiceOverride(openNewCodeEditor, undefined, (state) => ({
				...state,
				editor: {
					...state.editor,
					restoreEditors: true
				}
			})),
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
			...getStatusBarServiceOverride(),
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

const fakeWorker = new FakeWorker(new URL("vscode/workers/extensionHost.worker", import.meta.url), { type: "module" });

const workerConfig: WorkerConfig = {
	url: fakeWorker.url.toString(),
	options: fakeWorker.options
};