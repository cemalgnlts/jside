import { StatusBarAlignment, Uri, commands, window, workspace } from "vscode";
import type { StatusBarItem, TextDocument } from "vscode";

import esbuild from "esbuild-wasm/lib/browser.js";
import esbuildWasmURL from "esbuild-wasm/esbuild.wasm?url";

import { logger } from "./logger.ts";

import "./esbuildFSBinding.ts";

let esbuildCtx: esbuild.BuildContext;
let statusBarItem: StatusBarItem;
let projectFolderUri: Uri;
let outputFolderUri: Uri;

async function activate() {
	logger.info("Activating...");
	addStatusBarItem();

	await esbuild.initialize({
		wasmURL: esbuildWasmURL,
		worker: false
	});

	// Warm up.
	await esbuild.transform("let a=1;");

	commands.registerCommand("esbuild.init", init);
	commands.registerCommand("esbuild.build", build);
	commands.registerCommand("esbuild.showLogger", () => logger.show());

	workspace.onDidSaveTextDocument(onSaveFile);
}

async function init() {
	projectFolderUri = workspace.workspaceFolders![0].uri;

	let userChoices: esbuild.BuildOptions;

	try {
		const configFileUi8 = await workspace.fs.readFile(Uri.joinPath(projectFolderUri, "esbuild.config.json"));
		userChoices = JSON.parse(new TextDecoder().decode(configFileUi8));
	} catch (err) {
		logger.error((err as Error).toString());
		logger.error("Error in esbuild.config.json file!");
		return;
	}

	const opts: esbuild.BuildOptions = {
		outdir: "./dist",
		platform: "browser",
		charset: "utf8",

		// Overrides defaults.
		...userChoices!,

		// Overrides user choices.
		absWorkingDir: projectFolderUri.path
	};

	if (userChoices.outdir && userChoices.outdir.startsWith("/")) {
		logger.warn("'outdir' should not be the absolute path!");
		opts.outdir = "./dist";
	}

	outputFolderUri = Uri.joinPath(projectFolderUri, opts.outdir!);

	if (esbuildCtx) await esbuildCtx.dispose();

	esbuildCtx = await esbuild.context(opts);

	logger.info("Active.");
	statusBarItem.text = "$(zap) Build";
}

async function build() {
	logger.info("Building...");
	statusBarItem.text = "$(loading~spin) Building...";

	const buildStart = performance.now();

	await esbuildCtx.cancel();
	const { errors, warnings, outputFiles } = await esbuildCtx.rebuild();

	if (errors.length > 0) logger.error(errors.join("\n"));
	if (warnings.length > 0) logger.warn(warnings.join("\n"));

	let promises: Thenable<void>[] = [];

	if (outputFiles && outputFiles.length > 0) {
		promises = outputFiles.map((file) => workspace.fs.writeFile(Uri.file(file.path), file.contents));
	} else {
		if (!outputFiles) logger.warn(`outputFiles is ${typeof outputFiles}`);
		else if (outputFiles.length === 0) logger.warn("There is no output files.");
	}

	await Promise.all(promises);

	await commands.executeCommand("workbench.files.action.refreshFilesExplorer");

	const buildTime = performance.now() - buildStart;
	logger.info(`Done in ${buildTime | 0}ms`);
	statusBarItem.text = "$(zap) Build";
}

function onSaveFile(ev: TextDocument) {
	const fileName = ev.fileName.slice(projectFolderUri.path.length + 1);
	logger.info(`File changed: ${fileName}`);

	switch (fileName) {
		case "index.html":
			workspace.fs
				.copy(ev.uri, projectFolderUri)
				.then(() => logger.info("index.html file copied to the output folder."));
			return;
		case "esbuild.config.json":
			statusBarItem.text = "$(sync~spin) Loading...";
			logger.info("Changed config file, restarting...");
			init();
			return;
	}

	build();
}

function addStatusBarItem() {
	statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 1);
	statusBarItem.command = "esbuild.showLogger";
	statusBarItem.text = "$(sync~spin) Loading...";
	statusBarItem.tooltip = "Show output";
	statusBarItem.name = "Build";
	statusBarItem.show();
}

export { activate };
