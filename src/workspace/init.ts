import { INotificationService, getService, initialize as initializeServices } from "vscode/services";

// Services
import getDialogsServiceOverride from "@codingame/monaco-vscode-dialogs-service-override";
import getStorageServiceOverrride from "@codingame/monaco-vscode-storage-service-override";
import getViewsServiceOverride, { isEditorPartVisible } from "@codingame/monaco-vscode-views-service-override";
import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";
import getConfigurationServiceOverride, {
	initUserConfiguration
} from "@codingame/monaco-vscode-configuration-service-override";
import { initFile } from "@codingame/monaco-vscode-files-service-override";
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
import getTitleBarServiceOverride from "@codingame/monaco-vscode-view-title-bar-service-override";
import getSearchServiceOverride from "@codingame/monaco-vscode-search-service-override";

// Extensions
import "./extensions.ts";

// Workers
import ExtensionHostWorkerUrl from "vscode/workers/extensionHost.worker?worker&url";
import EditorWorkerServiceUrl from "monaco-editor/esm/vs/editor/editor.worker.js?worker&url";
import TextMateWorkerUrl from "@codingame/monaco-vscode-textmate-service-override/worker?worker&url";
import OutputLinkComputerWorkerUrl from "@codingame/monaco-vscode-output-service-override/worker?worker&url";

import { StatusBarAlignment, Uri, window } from "vscode";

import "vscode/localExtensionHost";

import userConfig from "./userConfiguration.json?raw";

import { activateDefaultExtensions } from "./extensions.ts";
import { createIndexedDBProviders } from "./fileSystem.ts";
import { CrossOriginWorker, FakeWorker } from "./workers.ts";

self.MonacoEnvironment = {
	getWorker(moduleId: string, label: string) {
		let url = "";

		switch (label) {
			case "editorWorkerService":
				url = EditorWorkerServiceUrl;
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
	const workspaceUri = Uri.file("/project.code-workspace");
	const fakeWorker = new FakeWorker(new URL(ExtensionHostWorkerUrl, import.meta.url), { type: "module" });

	const workerConfig: WorkerConfig = {
		url: fakeWorker.url.toString(),
		options: fakeWorker.options
	};

	await createIndexedDBProviders();
	await initFile(workspaceUri, JSON.stringify({ folders: [] }, null, 2));
	await initUserConfiguration(userConfig);

	await initializeServices(
		{
			...getLogServiceOverride(),
			...getExtensionsServiceOverride(workerConfig),
			...getModelServiceOverride(),
			...getNotificationsServiceOverride(),
			...getDialogsServiceOverride(),
			...getConfigurationServiceOverride(),
			...getTextmateServiceOverride(),
			...getThemeServiceOverride(),
			...getViewsServiceOverride(undefined, undefined, (state) => ({ ...state })),
			...getStatusBarServiceOverride(),
			...getSnippetsServiceOverride(),
			...getQuickAccessServiceOverride({
				isKeybindingConfigurationVisible: () => false,
				shouldUseGlobalPicker: (_, isStandalone) => !isStandalone && isEditorPartVisible()
			}),
			...getOutputServiceOverride(),
			...getMarkersServiceOverride(),
			...getAccessibilityServiceOverride(),
			...getStorageServiceOverrride(),
			...getLifecycleServiceOverride(),
			...getEnvironmentServiceOverride(),
			...getWorkingCopyServiceOverride(),
			...getLanguagesServiceOverride(),
			...getTitleBarServiceOverride(),
			...getSearchServiceOverride()
		},
		document.body,
		{
			workspaceProvider: {
				trusted: true,
				open: async () => false,
				workspace: { workspaceUri }
			},
			productConfiguration: {
				nameLong: "JSIDE",
				enableTelemetry: false
			}
		}
	);

	await extras();

	await activateDefaultExtensions();
}

async function extras() {
	// Notification status bar item.
	const notifyService = await getService(INotificationService);

	const getIcon = () => `$(bell${notifyService.doNotDisturbMode ? "-slash" : ""})`;

	const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 0);
	statusBarItem.command = "notifications.showList";
	statusBarItem.name = "Notifications";
	statusBarItem.text = getIcon();

	notifyService.onDidChangeDoNotDisturbMode(() => (statusBarItem.text = getIcon()));
	notifyService.onDidRemoveNotification(() => (statusBarItem.text = getIcon()));
	notifyService.onDidAddNotification(() => {
		const afterIcon = notifyService.doNotDisturbMode ? "-slash" : "";
		statusBarItem.text = `$(bell${afterIcon}-dot)`;
	});

	statusBarItem.show();
}
