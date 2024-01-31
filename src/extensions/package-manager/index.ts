import { ExtensionHostKind, registerExtension } from "vscode/extensions";
import { IRelaxedExtensionManifest } from "vscode/vscode/vs/platform/extensions/common/extensions";

import { PackageTreeProvider } from "./packagesTreeDataProvider.ts";

import { refreshFilesExplorer } from "../../utils/utils.ts";
import { fetchPackage } from "../../libs/cdn";
import Logger from "../../utils/logger.ts";

import type { PackageTreeItem } from "./packagesTreeDataProvider.ts";

interface IPackageJSON {
  title?: string;
  version?: string;
  dependencies: {
    [dependency: string]: string;
  };
}

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
      },
      {
        command: "packageManager.refresh",
        title: "Refresh dependencies",
        icon: "$(refresh)"
      },
      {
        command: "packageManager.delete",
        title: "Delete",
        icon: "$(trash)"
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
        },
        {
          command: "packageManager.refresh",
          group: "navigation",
          when: "projectManager.isAnyProjectOpen && view == dependencies"
        }
      ],
      "view/item/context": [
        {
          command: "packageManager.delete",
          when: "view == dependencies",
          group: "inline"
        }
      ],
      commandPalette: [
        {
          command: "packageManager.install",
          when: "false"
        },
        {
          command: "packageManager.refresh",
          when: "false"
        },
        {
          command: "packageManager.delete",
          when: "false"
        }
      ]
    },
    viewsWelcome: [
      {
        view: "dependencies",
        when: "!projectManager.isAnyProjectOpen",
        contents:
          "Open a project to be able to manage packages.\n[Show projects](command:workbench.view.extension.project-manager)"
      }
    ]
  }
};

const { getApi } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

let api: typeof import("vscode");
let workingDir: import("vscode").Uri;
let logger: Logger;

async function activate() {
  api = await getApi();

  const { commands, window, workspace, Uri } = api;

  logger = new Logger(window, "Package Manager");
  // let workingDir: Uri;

  // workspace.onDidSaveTextDocument((doc) => {
  //   if (workingDir.slice(doc.fileName) !== "package.json") return;

  // });

  const packageTreeDataProvider = new PackageTreeProvider(workspace, null);

  workspace.onDidChangeWorkspaceFolders((ev) => {
    if (ev.added.length === 0) return;

    workingDir = ev.added[0].uri;
    packageTreeDataProvider.pkgJSONUri = Uri.joinPath(workingDir, "package.json");
    packageTreeDataProvider.refresh();
  });

  window.createTreeView("dependencies", {
    treeDataProvider: packageTreeDataProvider
  });

  commands.registerCommand("packageManager.install", installDependency);
  commands.registerCommand("packageManager.refresh", () => packageTreeDataProvider.refresh());
  commands.registerCommand("packageManager.delete", (item: PackageTreeItem) => removePackage(item));
}

async function removePackage(item: PackageTreeItem) {
  const { window, workspace, commands, Uri } = api;
  const [packName, packVersion] = item.dep;

  const warn = await window.showWarningMessage(
    `Delete ${packName}${packVersion}`,
    {
      detail: "Do you want to delete this package?",
      modal: true
    },
    "Delete"
  );

  if (warn !== "Delete") return;

  const packDir = Uri.joinPath(workingDir, "node_modules", packName);
  const typeDir = Uri.joinPath(workingDir, "types", packName);

  await Promise.all([
    workspace.fs.delete(packDir, { recursive: true }),
    workspace.fs.delete(typeDir, { recursive: true })
  ]);

  const pkgJSON = await getPackageJSON();

  delete pkgJSON.dependencies[packName];

  await setPackageJSON(pkgJSON);
  await commands.executeCommand("packageManager.refresh");

  logger.info(`Package removed: ${packName}${packVersion}`);
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
  const { files, packageVersion } = await fetchPackage(packageName);
  const { workspace, commands, Uri } = api;

  logger.info(`${files.size} file found.`);
  logger.info(`Type file found: ${files.has(`types/${packageName}/index.d.ts`)}`);

  const modulePath = Uri.joinPath(workingDir, "node_modules", packageName);
  const encoder = new TextEncoder();

  const promises = [];

  for (const [path, text] of files.entries()) {
    const absPath = !path.startsWith("types") ? Uri.joinPath(modulePath, path) : Uri.joinPath(workingDir, path);

    promises.push(workspace.fs.writeFile(absPath, encoder.encode(text)));
  }

  await Promise.all(promises);

  // Add package to package.json
  const pkgJSON = await getPackageJSON();
  pkgJSON.dependencies[packageName] = `^${packageVersion}`;

  await Promise.all([
    setPackageJSON(pkgJSON),
    refreshFilesExplorer()
  ]);

  await commands.executeCommand("packageManager.refresh");

  logger.info("Package downloaded.");
}

async function getPackageJSON() {
  const { workspace, Uri } = api;

  const fileUri = Uri.joinPath(workingDir, "package.json");

  let content: IPackageJSON;

  try {
    const encodedContent = await workspace.fs.readFile(fileUri);
    const rawText = new TextDecoder().decode(encodedContent);
    content = JSON.parse(rawText);
  } catch {
    content = {
      dependencies: {}
    };
  }

  return content;
}

async function setPackageJSON(content: IPackageJSON) {
  const { workspace, Uri } = api;

  const textData = JSON.stringify(content, null, 2);

  const fileUri = Uri.joinPath(workingDir, "package.json");
  await workspace.fs.writeFile(fileUri, new TextEncoder().encode(textData));
}

export default activate;
