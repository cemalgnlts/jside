
export async function loadMonaco(loadParts: (parts: import("@codingame/monaco-vscode-views-service-override").Parts[]) => void) {
	const { commands } = await import("vscode");

	const { Parts, } = await  import("@codingame/monaco-vscode-views-service-override");

	const { init } = await import("./workspace/init");
	const { renderProjectManagerWelcomeView } = await import("./extensions/project-manager/index.ts");

	await init();

	const parts = [Parts.EDITOR_PART, Parts.SIDEBAR_PART, Parts.PANEL_PART, Parts.STATUSBAR_PART];

	loadParts(parts)

	await commands.executeCommand("workbench.view.extension.project-manager");
	renderProjectManagerWelcomeView();

	document.querySelector<HTMLDivElement>(".splash")?.style.setProperty("display", "none");
}

