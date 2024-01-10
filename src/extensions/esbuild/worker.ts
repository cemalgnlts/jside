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
let distDirHandle: FileSystemDirectoryHandle;

async function activate() {
	logger.info("Activating...");
	addStatusBarItem();

	await esbuild.initialize({
		wasmURL: esbuildWasmURL,
		worker: false
	});

	// Warm up.
	await esbuild.transform("let a=1;");

	const rootHandle = await (await navigator.storage.getDirectory()).getDirectoryHandle("JSIDE");
	distDirHandle = await rootHandle.getDirectoryHandle("dist");

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
		absWorkingDir: projectFolderUri.path,
		publicPath: "/preview"
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

	if (errors.length > 0) logger.error(errors.join("\n* "));
	if (warnings.length > 0) logger.warn(warnings.join("\n* "));

	let promises: Thenable<void>[] | Promise<void>[] = [];

	if (outputFiles && outputFiles.length > 0) {
		promises = outputFiles.map((file) => workspace.fs.writeFile(Uri.file(file.path), file.contents));
		promises.push(...outputFiles.map(writeOPFSDistFolder));
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

async function onSaveFile(ev: TextDocument) {
	const fileName = ev.fileName.split("/").pop();
	const fileRelativePath = ev.fileName.slice(projectFolderUri.path.length + 1);
	logger.info(`File changed: ${fileRelativePath}`);

	if (fileName === "index.html") {
		const htmlTargetUri = Uri.joinPath(outputFolderUri, "index.html");

		// Promise.all([
		// 	writeOPFSDistFolder({
		// 		path: htmlTargetUri.path,
		// 		contents: await workspace.fs.readFile(ev.uri),
		// 		hash: "",
		// 		text: ""
		// 	}),
		// 	workspace.fs.copy(ev.uri, htmlTargetUri, { overwrite: true })
		// ]).then(
		// 	() => logger.info("index.html file copied to the output folder."),
		// 	(err: Error) => logger.error(err.toString())
		// );

		const ui8 = await workspace.fs.readFile(ev.uri);
		let content = new TextDecoder().decode(ui8);
		content = content.replace(/\<head\>/, '<head>\n<base href="/preview/">\n');
		
		await writeOPFSDistFolder({
			path: htmlTargetUri.path,
			contents: new TextEncoder().encode(content)
		});

		return;
	} else if (fileName === "esbuild.config.json") {
		statusBarItem.text = "$(sync~spin) Loading...";
		logger.info("Changed config file, reloading...");
		init();

		return;
	}

	// "/JSIDE/projects/test/dist".slice("/JSIDE/projects/test") -> "dist/"
	const outputDirName = outputFolderUri.path.slice(projectFolderUri.path.length + 1) + "/";

	if (fileRelativePath.startsWith(outputDirName)) {
		logger.info("Changes in the output folder were ignored.");
		return;
	}

	build();
}

async function writeOPFSDistFolder(output: Partial<esbuild.OutputFile>) {
	const fileName = output.path!.split("/").pop()!;

	const file = await distDirHandle.getFileHandle(fileName, { create: true });
	const syncAccess = await file.createSyncAccessHandle();

	syncAccess.write(output.contents!, { at: 0 });

	syncAccess.flush();
	syncAccess.close();
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
