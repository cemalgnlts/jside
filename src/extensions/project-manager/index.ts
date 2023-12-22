import { registerExtension, ExtensionHostKind } from "vscode/extensions";
import ProjectTreeDataProvider from "./projectTreeDataProvider";

import { IRelaxedExtensionManifest } from "vscode/vscode/vs/platform/extensions/common/extensions";
import { Uri, ViewColumn, WebviewPanel, MarkdownString, Hover } from "vscode";

const manifest: IRelaxedExtensionManifest = {
	name: "project-manager",
	displayName: "Project Manager",
	version: "0.0.1",
	publisher: "jside",
	engines: {
		vscode: "*"
	},
	contributes: {
		commands: [
			{
				command: "projectManager.refresh",
				title: "Refresh",
				// @ts-expect-error Missing type
				icon: "$(refresh)"
			},
			{
				command: "projectManager.add",
				title: "New Project",
				// @ts-expect-error Missing type
				icon: "$(add)"
			}
		],
		views: {
			explorer: [
				{
					id: "deviceFileSystem",
					name: "Device File System Projects"
				},
				{
					id: "originPrivateFileSystem",
					name: "Origin Private File System Projects"
				}
			]
		},
		menus: {
			"view/title": [
				{
					command: "projectManager.refresh",
					group: "navigation",
					when: "view == deviceFileSystem || view == originPrivateFileSystem"
				},
				{
					command: "projectManager.add",
					group: "navigation",
					when: "view == deviceFileSystem || view == originPrivateFileSystem"
				}
			],
			commandPalette: [
				{
					command: "projectManager.add",
					when: "false"
				},
				{
					command: "projectManager.refresh",
					when: "false"
				}
			]
		},
		viewsWelcome: [
			{
				view: "deviceFileSystem",
				contents: "Hello World"
			}
		]
	}
};

const { getApi } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

async function activate() {
	const api = await getApi();
	let currentNewProjectPanel: WebviewPanel | null = null;

	api.window.registerTreeDataProvider("originPrivateFileSystem", new ProjectTreeDataProvider());
	// api.window.createTreeView("originPrivateFileSystem", {
	// 	treeDataProvider: new ProjectTreeDataProvider()
	// });

	// api.window.registerTreeDataProvider("deviceFileSystem", new ProjectTreeDataProvider());
	api.window.createTreeView("deviceFileSystem", {
		treeDataProvider: new ProjectTreeDataProvider()
	});

	api.commands.registerCommand("projectManager.add", () => {
		// renderWelcomeView();
	});

	api.commands.registerCommand("projectManager.refresh", () => {
		if (currentNewProjectPanel !== null) {
			currentNewProjectPanel.reveal(api.window.activeTextEditor ? api.window.activeTextEditor.viewColumn : undefined);

			return;
		}

		currentNewProjectPanel = api.window.createWebviewPanel(
			"projectManager.newProject",
			"New Project",
			ViewColumn.Active,
			{
				enableScripts: true
			}
		);

		currentNewProjectPanel.webview.html = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Cat Coding</title>
		</head>
		<body>
			<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
		</body>
		</html>`;

		currentNewProjectPanel.onDidDispose(() => (currentNewProjectPanel = null));
	});
}

// function renderWelcomeView() {
// 	const pane = (document.querySelector("[aria-label='Device File System Projects Section']") as HTMLDivElement)
// 		.parentElement as HTMLDivElement;
// 	pane.querySelector(".pane-body")!.classList.add("welcome");
// 	const welcomeView = pane.parentElement!.querySelector(".welcome-view");

// 	welcomeView!.querySelector(".welcome-view-content")!.innerHTML = "ok";
// }

export default activate;
