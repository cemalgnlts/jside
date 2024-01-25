import { ExtensionHostKind, registerExtension } from "vscode/extensions";
import { IRelaxedExtensionManifest } from "vscode/vscode/vs/platform/extensions/common/extensions";
import Logger from "../../utils/logger";
import { refreshFilesExplorer } from "../../utils/utils";

const manifest: IRelaxedExtensionManifest = {
  name: "package-manager",
  displayName: "Package Manager",
  publisher: __APP_NAME,
  version: __APP_VERSION,
  engines: {
    vscode: "*"
  },
  contributes: {
    viewsContainers: {
      activitybar: [
        {
          id: "package-manager",
          title: "Package Manager",
          icon: "$(package)"
        }
      ]
    },
    commands: [
      {
        command: "packageManager.install",
        title: "Install dependency",
        icon: "$(add)"
      }
    ],
    views: {
      explorer: [
        {
          id: "dependencies",
          name: "Dependencies"
        }
      ]
    },
    menus: {
      "view/title": [
        {
          command: "packageManager.install",
          group: "navigation",
          when: "projectManager.isAnyProjectOpen && view == dependencies"
        }
      ]
    },
    viewsWelcome: [
      {
        view: "dependencies",
        contents:
          "Open a project to be able to manage packages.\n[Show projects](command:workbench.view.extension.project-manager)"
      }
    ]
  }
};

const { getApi } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

let api: typeof import("vscode");
let logger: Logger;

async function activate() {
  api = await getApi();

  const { commands, window } = api;

  logger = new Logger(window, "Package Manager");

  // workspace.onDidChangeWorkspaceFolders((ev) => console.log(ev.added));

  commands.registerCommand("packageManager.install", installDependency);
}

async function installDependency() {
  let packageName = await api.window.showInputBox({
    title: "Install Dependency - Package Manager",
    placeHolder: "package or package@version",
    validateInput(value) {
      return value.trim().length < 3 ? "Minimum 3 character" : undefined;
    }
  });

  if (!packageName) return;

  packageName = packageName.trim();

  logger.info(`----- Install ${packageName} -----`);

  api.window
    .withProgress(
      {
        location: api.ProgressLocation.Notification,
        title: `Install ${packageName}`
      },
      async () => await downloadPackage(packageName!)
    )
    .then(null, (err) => {
      api.window.showErrorMessage(err.toString());
      logger.error(err.toString());
    });
}

async function downloadPackage(packageName: string) {
  const Uri = api.Uri;

  logger.info(`Fetch package from https://esm.sh/${packageName}`);

  const nodeModulesFolderUri = Uri.joinPath(api.workspace.workspaceFolders![0].uri, "node_modules");
  const packageFolderUri = Uri.joinPath(nodeModulesFolderUri, packageName);
  const files = new Map<import("vscode").Uri, ArrayBuffer>();

  const packageReq = await fetch(`https://esm.sh/${packageName}`);
  let typeReq: Response | null = null;

  if (!packageReq.ok) throw new Error(`${packageReq.status}:${packageReq.statusText}`);

  const packageVersion = packageReq.url.slice(packageReq.url.lastIndexOf("@") + 1);

  if (packageReq.headers.has("x-typescript-types")) {
    const typeUrl = packageReq.headers.get("x-typescript-types")!;
    typeReq = await fetch(typeUrl);

    logger.info(`Type file found: ${typeUrl}`);

    let typePath;

    if (typeUrl.includes("/@types/")) {
      typePath = Uri.joinPath(nodeModulesFolderUri, packageName, "@types", "index.d.ts");
    } else {
      typePath = Uri.joinPath(nodeModulesFolderUri, packageName, "dist", `${packageName}.d.ts`);

      files.set(
        Uri.joinPath(packageFolderUri, "package.json"),
        new TextEncoder().encode(`{
	"name": "${packageName}",
	"version": "${packageVersion}",
	"types": "./dist/${packageName}.d.ts"
}`)
      );
    }

    files.set(typePath, await typeReq.arrayBuffer());
  }

  const indexFile = await packageReq.text();
  const pathsChangedIndexFile = indexFile.replace(/from ".+";/g, (line) => `from "./${line.split("/").pop()}`);

  files.set(Uri.joinPath(packageFolderUri, "index.js"), new TextEncoder().encode(pathsChangedIndexFile));

  let libs: Set<string> | Array<string> = new Set([...indexFile.matchAll(/from "(.*)";/g)].map((match) => match[1]));
  libs = Array.from(libs, (lib) => `https://esm.sh${lib}`);

  logger.info(`Loading the library files: ${libs.map((lib) => lib.split("/").pop())}`);

  let libRes = await Promise.all(libs.map((url) => fetch(url)));
  libRes = libRes.filter((res) => res.ok);

  for (const res of libRes) {
    const fileName = res.url.split("/").pop()!;
    files.set(Uri.joinPath(packageFolderUri, fileName), await res.arrayBuffer());
  }

  logger.info(
    `The files are being saved: ${Array.from(files.keys(), (file) =>
      file.path.slice(nodeModulesFolderUri.path.length)
    ).join(", ")}`
  );

  for (const [pathUri, contents] of files.entries()) {
    await api.workspace.fs.writeFile(pathUri, new Uint8Array(contents));
  }

  await refreshFilesExplorer();

  logger.info(`Package ${packageName} successfully added.`);
}

export default activate;
