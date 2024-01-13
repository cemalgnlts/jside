import { registerExtension, ExtensionHostKind } from "vscode/extensions";
import { ProjectTreeDataProvider, ProjectTreeItem } from "./projectTreeDataProvider";

import { IRelaxedExtensionManifest } from "vscode/vscode/vs/platform/extensions/common/extensions";
import { getTemplate, templateMeta } from "../../libs/templates";
import { ProgressLocation, Uri, window, commands } from "vscode";
import { reinitializeWorkspace } from "@codingame/monaco-vscode-configuration-service-override";
import WebFileSystem, { WebFileSystemType } from "../../libs/webFileSystem";
import { requestOPFSPersistentPermission } from "../../utils/utils";
import { registerFileSystemOverlay } from "@codingame/monaco-vscode-files-service-override";

const manifest: IRelaxedExtensionManifest = {
	name: "project-manager",
	displayName: "Project Manager",
	version: "0.0.1",
	publisher: "jside",
	engines: {
		vscode: "*"
	},
	contributes: {
		viewsContainers: {
			activitybar: [
				{
					id: "project-manager",
					title: "Project Manager",
					// @ts-expect-error Missing type
					icon: "$(home)"
				}
			]
		},
		commands: [
			{
				command: "projectManager.refresh.opfs",
				title: "Refresh",
				// @ts-expect-error Missing type
				icon: "$(refresh)"
			},
			{
				command: "projectManager.refresh.dfs",
				title: "Refresh",
				// @ts-expect-error Missing type
				icon: "$(refresh)"
			},
			{
				command: "projectManager.add.opfs",
				title: "New Project",
				// @ts-expect-error Missing type
				icon: "$(add)"
			},
			{
				command: "projectManager.add.dfs",
				title: "New Project",
				// @ts-expect-error Missing type
				icon: "$(add)"
			},
			{
				command: "projectManager.rename",
				title: "Rename",
				// @ts-expect-error Missing type
				icon: "$(edit)"
			},
			{
				command: "projectManager.delete",
				title: "Delete",
				// @ts-expect-error Missing type
				icon: "$(trash)"
			}
		],
		views: {
			"project-manager": [
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
					command: "projectManager.refresh.dfs",
					group: "navigation",
					when: "view == deviceFileSystem"
				},
				{
					command: "projectManager.add.dfs",
					group: "navigation",
					when: "view == deviceFileSystem"
				},
				{
					command: "projectManager.refresh.opfs",
					group: "navigation",
					when: "view == originPrivateFileSystem"
				},
				{
					command: "projectManager.add.opfs",
					group: "navigation",
					when: "view == originPrivateFileSystem"
				}
			],
			"view/item/context": [
				{
					command: "projectManager.rename",
					when: "view == deviceFileSystem || view == originPrivateFileSystem",
					group: "inline"
				},
				{
					command: "projectManager.delete",
					when: "view == deviceFileSystem || view == originPrivateFileSystem",
					group: "inline@2"
				}
			],
			commandPalette: [
				{
					command: "projectManager.add.dfs",
					when: "false"
				},
				{
					command: "projectManager.add.opfs",
					when: "false"
				},
				{
					command: "projectManager.refresh.opfs",
					when: "false"
				},
				{
					command: "projectManager.refresh.dfs",
					when: "false"
				},
				{
					command: "projectManager.rename",
					when: "false"
				},
				{
					command: "projectManager.delete",
					when: "false"
				}
			]
		},
		viewsWelcome: [
			{
				view: "deviceFileSystem",
				contents:
					"You must grant permission to perform write/read operations on your device.\n[$(shield) Request Permission](command:projectManager.dfsPermissionRequest)"
			}
		]
	}
};

const { getApi, setAsDefaultApi } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

async function activate() {
	await setAsDefaultApi();

	const api = await getApi();

	try {
		await requestOPFSPersistentPermission();
	} catch (err) {
		if (err instanceof Error) api.window.showWarningMessage(err.message);
		else console.error(err);
	}

	// File systems.
	const opfs = new WebFileSystem("opfs");
	await opfs.initFS();

	const dfs = new WebFileSystem("dfs");

	// Data providers
	const opfsTreeDataProvider = new ProjectTreeDataProvider(opfs);
	const dfsTreeDataProvider = new ProjectTreeDataProvider(null);

	// Tree views
	api.window.createTreeView("deviceFileSystem", {
		treeDataProvider: dfsTreeDataProvider
	});

	api.window.createTreeView("originPrivateFileSystem", {
		treeDataProvider: opfsTreeDataProvider
	});

	// Commands
	api.commands.registerCommand(
		"projectManager.new",
		async (projectName: string, projectType: string, fsType: WebFileSystemType) => {
			const provider = fsType === "opfs" ? opfsTreeDataProvider : dfsTreeDataProvider;
			const options = {
				cancellable: false,
				title: "Project creating...",
				location: ProgressLocation.Window
			};

			const task = async () => {
				try {
					await createProjectTemplate(projectName, projectType, provider);
				} catch (err) {
					window.showErrorMessage((err as Error).toString());
				}
			};

			window.withProgress(options, task);
		}
	);

	api.commands.registerCommand("projectManager.open", async (fsType, projectName) => {
		const fs = fsType === "opfs" ? opfs : dfs;

		registerFileSystemOverlay(1, fs);

		const projectFolderUri = Uri.file(`/JSIDE/projects/${projectName}`);

		await reinitializeWorkspace({
			uri: projectFolderUri,
			id: projectFolderUri.toString()
		});

		await commands.executeCommand("workbench.view.explorer");
		await commands.executeCommand("esbuild.init");
	});

	api.commands.registerCommand("projectManager.rename", async (item: ProjectTreeItem) => {
		const [fsType, projectName] = item.command!.arguments as [WebFileSystemType, string];
		const provider = fsType === "opfs" ? opfsTreeDataProvider : dfsTreeDataProvider;
		const fs = provider.fs!;

		// await removeProject(projectName, provider);
		const newName = await showFileNamePrompt({ title: "Rename project", value: projectName });

		if (!newName || projectName === newName) return;

		const projectsUri = Uri.file("/JSIDE/projects");

		await fs.rename(Uri.joinPath(projectsUri, projectName), Uri.joinPath(projectsUri, newName), {
			overwrite: false
		});

		provider.refresh();
	});

	api.commands.registerCommand("projectManager.delete", async (item: ProjectTreeItem) => {
		const [fsType, projectName] = item.command!.arguments as [WebFileSystemType, string];
		const provider = fsType === "opfs" ? opfsTreeDataProvider : dfsTreeDataProvider;

		await removeProject(projectName, provider);
	});

	api.commands.registerCommand("projectManager.dfsPermissionRequest", async () => {
		try {
			await dfs.initFS();
			dfsTreeDataProvider.fs = dfs;
			dfsTreeDataProvider.refresh();
		} catch (err) {
			window.showErrorMessage((err as Error).toString());
		}
	});

	api.commands.registerCommand("projectManager.add.opfs", () => showCreateProjectQuickPick("opfs"));
	api.commands.registerCommand("projectManager.add.dfs", () => showCreateProjectQuickPick("dfs"));

	api.commands.registerCommand("projectManager.refresh.opfs", () => opfsTreeDataProvider.refresh());
	api.commands.registerCommand("projectManager.refresh.dfs", () => dfsTreeDataProvider.refresh());
}

// Project creation help dialog.
function showCreateProjectQuickPick(fsType: WebFileSystemType) {
	const stepData = [
		{
			placeholder: "Select template",
			value: "",
			items: templateMeta
		},
		{
			placeholder: "Select language",
			value: "",
			items: [
				{ label: "JavaScript", detail: "Default" },
				{ label: "TypeScript", detail: "Extends JavaScript by adding types to the language" }
			]
		}
	];

	const quickPick = window.createQuickPick();
	quickPick.matchOnDescription = true;
	quickPick.title = "Create Project";
	quickPick.totalSteps = stepData.length + 1;
	quickPick.step = 1;

	quickPick.placeholder = stepData[quickPick.step - 1].placeholder;
	quickPick.items = stepData[quickPick.step - 1].items;

	const showProjectNameInputBox = async (template: string) => {
		const projectName = await showFileNamePrompt({ title: "Create Project (3/3)", prompt: "Project Folder Name" });

		if (!projectName) return;

		await commands.executeCommand("projectManager.new", projectName, template, fsType);
	};

	const onAccept = async () => {
		const step = quickPick.step!;

		stepData[step - 1].value = quickPick.activeItems[0].label;

		if (step < stepData.length) {
			quickPick.items = stepData[step].items;
			quickPick.placeholder = stepData[step].placeholder;
			quickPick.value = "";
		}

		quickPick.step! = step + 1;

		if (step >= quickPick.totalSteps! - 1) {
			quickPick.hide();

			const lang = stepData[1].value === "TypeScript" ? "-ts" : "";
			const template = `${stepData[0].value}${lang}`;

			showProjectNameInputBox(template.toLocaleLowerCase());
		}
	};

	quickPick.onDidHide(() => quickPick.dispose());
	quickPick.onDidAccept(onAccept);
	quickPick.show();
}

// Create the folder structure using the given information.
async function createProjectTemplate(projectName: string, projectType: string, provider: ProjectTreeDataProvider) {
	const files = await getTemplate(projectType);
	const fs = provider.fs!;
	const encoder = new TextEncoder();

	const projectFolderUri = Uri.file(`/JSIDE/projects/${projectName}`);

	await fs.createDirectory(projectFolderUri);

	for (const [path, contents] of files.entries()) {
		const splitted = path.split("/");

		const parentFolderUri =
			splitted.length === 1 ? projectFolderUri : Uri.joinPath(projectFolderUri, ...splitted.slice(0, -1));
		const fileUri = Uri.joinPath(parentFolderUri, splitted.pop() as string);

		await fs.createDirectory(parentFolderUri);
		await fs.writeFile(fileUri, encoder.encode(contents), {
			create: true,
			overwrite: false,
			unlock: false,
			atomic: false
		});
	}

	provider.refresh();
}

async function removeProject(projectName: string, provider: ProjectTreeDataProvider) {
	const res = await window.showWarningMessage(
		"Delete",
		{
			detail: `Do you want to delete the ${projectName} project?\nThis action is irreversible!`,
			modal: true
		},
		{ title: "Delete Project" }
	);

	if (res == undefined || res.title !== "Delete") return;

	const projectUri = Uri.file(`/JSIDE/projects/${projectName}`);

	const options = {
		cancellable: false,
		title: "Project deleting...",
		location: ProgressLocation.Window
	};

	const task = async () => {
		try {
			await provider.fs!.delete(projectUri, {
				recursive: true,
				useTrash: false,
				atomic: false
			});

			provider.refresh();
		} catch (err) {
			window.showErrorMessage((err as Error).toString());
		}
	};

	window.withProgress(options, task);
}

// To create a Unix-compatible project folder name.
function showFileNamePrompt(opts: { title: string; prompt?: string; value?: string }) {
	return window.showInputBox({
		...opts,
		validateInput(value) {
			if (value.length < 3) return "Minimum 3 character.";
			else if (!/^[\w\-. ]+$/.test(value.trim())) return "Please choose a valid folder name.";
		}
	});
}

export default activate;
