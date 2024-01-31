import { StatusBarAlignment, Uri, env, commands, window, workspace } from "vscode";
import type { TextDocument, Disposable } from "vscode";

import esbuild from "esbuild-wasm/lib/browser.js";
import esbuildWasmURL from "esbuild-wasm/esbuild.wasm?url";

import { logger } from "./esbuildFSBinding.ts";
import { refreshFilesExplorer } from "../../utils/utils.ts";
import StatusBarItemController from "./statusBarItemController.ts";

const statusBarController = new StatusBarItemController(window, StatusBarAlignment.Left, 1);
const liveReloadBC = new BroadcastChannel("live_reload");

let esbuildCtx: esbuild.BuildContext;
let projectFolderUri: Uri;
let outputFolderUri: Uri;
let distDirHandle: FileSystemDirectoryHandle;
let watchingFiles: string[] = [];
let livePreviewDisposable: Disposable;

async function activate() {
  logger.info("Activating...");
  statusBarController.init();

  await esbuild.initialize({
    wasmURL: esbuildWasmURL,
    worker: false
  });

  // Warm up.
  await esbuild.transform("let a=1;");

  const rootHandle = await (await navigator.storage.getDirectory()).getDirectoryHandle("JSIDE");
  distDirHandle = await rootHandle.getDirectoryHandle("dist");

  commands.registerCommand("bundler.init", init);
  commands.registerCommand("bundler.build", build);
  commands.registerCommand("bundler.startLivePreview", startLivePreview);
  commands.registerCommand("bundler.showLogs", () => logger.show());
  commands.registerCommand("bundler.openWebPage", () => env.openExternal(Uri.parse(`${location.origin}/preview`)));
  commands.registerCommand("bundler.stopLivePreview", () => {
    livePreviewDisposable.dispose();
    statusBarController.disableLiveMode();
  });
}

async function init() {
  projectFolderUri = workspace.workspaceFolders![0].uri;

  const userConfig = await getUserConfigFile();

  if (userConfig !== undefined) {
    outputFolderUri = Uri.joinPath(projectFolderUri, userConfig.outdir!);

    if (esbuildCtx) await esbuildCtx.dispose();

    esbuildCtx = await esbuild.context(userConfig);
    logger.info("Active.");
  }

  statusBarController.active();
}

async function getUserConfigFile(): Promise<esbuild.BuildOptions | undefined> {
  let userChoices: esbuild.BuildOptions;

  try {
    const configFileUi8 = await workspace.fs.readFile(Uri.joinPath(projectFolderUri, "esbuild.config.json"));
    userChoices = JSON.parse(new TextDecoder().decode(configFileUi8));
  } catch (err) {
    const errMsg = (err as Error).toString();
    logger.error("Error in esbuild.config.json file!");
    logger.error(errMsg);

    window.showErrorMessage(`Error esbuild.config.json: ${errMsg}`);
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
    publicPath: "/preview",
    metafile: true
  };

  if (userChoices.outdir && userChoices.outdir.startsWith("/")) {
    logger.warn("'outdir' should not be the absolute path!");
    opts.outdir = "./dist";
  }

  return opts;
}

async function startLivePreview() {
  for await (const entry of distDirHandle.keys()) {
    distDirHandle.removeEntry(entry);
  }

  await serve();

  livePreviewDisposable = workspace.onDidSaveTextDocument(onSaveFile);

  statusBarController.enableLiveMode();
  logger.info(`Files watching: \n \u2022 ${watchingFiles.join("\n \u2022 ")}`);

  await commands.executeCommand("bundler.openWebPage");
}

async function* start(mode: "serve" | "build") {
  const buildStart = performance.now();

  await esbuildCtx.cancel();

  const { errors, warnings, outputFiles, metafile } = await (mode === "serve"
    ? esbuildCtx.rebuild()
    : esbuild.build({}));

  console.log(errors);

  if (errors.length > 0) logger.error(errors.join("\n* "));
  if (warnings.length > 0) logger.warn(warnings.join("\n* "));

  let promises: Thenable<void>[] | Promise<void>[] = [];

  if (outputFiles!.length > 0) {
    promises = yield outputFiles;
  } else {
    logger.warn("There is no output files.");
  }

  await Promise.all(promises);

  watchingFiles = Object.keys(metafile!.inputs);

  const buildTime = performance.now() - buildStart;

  logger.info(`Done in ${buildTime | 0}ms`);
  statusBarController.active();
}

async function serve() {
  statusBarController.loading("Serving...");
  logger.info("Serving...");

  try {
    const gen = start("serve");
    const files = (await gen.next()).value!;

    await gen.next(files.map(writeOPFSDistFolder));
    await gen.next();
  } catch (err) {
    statusBarController.error();
  }

  liveReloadBC.postMessage("reload");
}

async function build() {
  statusBarController.loading("Building...");
  logger.info("Building...");

  try {
    const gen = start("build");
    const files = (await gen.next()).value!;

    const writeOutpuFolder = (file: esbuild.OutputFile) => workspace.fs.writeFile(Uri.file(file.path), file.contents);

    await gen.next(files.map(writeOutpuFolder));
    await gen.next();
  } catch (err) {
    statusBarController.error();
  }

  await refreshFilesExplorer();
}

async function onSaveFile(ev: TextDocument) {
  const fileName = ev.fileName.split("/").pop();
  const fileRelativePath = ev.fileName.slice(projectFolderUri.path.length + 1);
  logger.info(`File changed: ${fileRelativePath}`);

  if (fileName === "index.html") {
    const htmlTargetUri = Uri.joinPath(outputFolderUri, "index.html");

    const ui8 = await workspace.fs.readFile(ev.uri);
    let content = new TextDecoder().decode(ui8);
    content = content.replace(
      /<head>/,
      `<head>
<base href="/preview/">
<script>
	const bc = new BroadcastChannel("live_reload");
	bc.onmessage = ev => {
		switch(ev.data) {
			case "reload": location.reload(); break;
		}
	};
</script>
`
    );

    await writeOPFSDistFolder({
      path: htmlTargetUri.path,
      contents: new TextEncoder().encode(content)
    });

    logger.info("index.html file copied to the output folder.");

    liveReloadBC.postMessage("reload");
  } else if (fileName === "esbuild.config.json") {
    logger.info("Changed config file, synchronizing...");
    statusBarController.loading();
    init();
  } else if (watchingFiles.includes(fileRelativePath)) {
    serve();
  }

  // // "/JSIDE/projects/test/dist".slice("/JSIDE/projects/test") -> "dist/"
  // const outputDirName = outputFolderUri.path.slice(projectFolderUri.path.length + 1) + "/";

  // if (fileRelativePath.startsWith(outputDirName)) {
  //   logger.info("Changes in the output folder were ignored.");
  //   return;
  // }
}

async function writeOPFSDistFolder(output: Partial<esbuild.OutputFile>) {
  const fileName = output.path!.split("/").pop()!;

  const file = await distDirHandle.getFileHandle(fileName, { create: true });
  const syncAccess = await file.createSyncAccessHandle();

  syncAccess.write(output.contents!, { at: 0 });

  syncAccess.flush();
  syncAccess.close();
}

export { activate };
