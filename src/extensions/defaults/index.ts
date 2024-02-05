import { ExtensionHostKind, registerExtension } from "vscode/extensions";
import { IModelService, StandaloneServices } from "vscode/services";
import { MenuRegistry, MenuId } from "vscode/monaco";

import type { IExtensionManifest } from "vscode/extensions";
import type { ProviderResult, Uri } from "vscode";

const manifest: IExtensionManifest = {
  name: "defaults",
  publisher: __APP_NAME,
  version: __APP_VERSION,
  engines: {
    vscode: "*"
  },
  enabledApiProposals: ["fileSearchProvider", "textSearchProvider"]
};

const { getApi, setAsDefaultApi } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

async function activate() {
  await setAsDefaultApi();

  const { workspace, commands, env, Uri, Range } = await getApi();

  const modelService = StandaloneServices.get(IModelService);

  workspace.registerFileSearchProvider("file", {
    provideFileSearchResults: function (): ProviderResult<Uri[]> {
      return modelService
        .getModels()
        .map((model) => model.uri)
        .filter((uri) => uri.scheme === "file");
    }
  });

  workspace.registerTextSearchProvider("file", {
    async provideTextSearchResults(query, _, progress) {
      for (const model of modelService.getModels()) {
        const matches = model.findMatches(
          query.pattern,
          false,
          !!query.isRegExp,
          !!query.isCaseSensitive,
          query.isWordMatch ?? false ? " " : null,
          true
        );

        if (matches.length === 0) return {};

        const ranges = matches.map(
          ({ range }) => new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)
        );

        progress.report({
          uri: model.uri,
          ranges,
          preview: {
            text: model.getValue(),
            matches: ranges
          }
        });
      }
    }
  });

  const openGitHub = (url: string) => env.openExternal(Uri.parse(`https://github.com/cemalgnlts/jside${url}`));

  commands.registerCommand("defaults.openGitHubPage", () => openGitHub("/"));
  commands.registerCommand("defaults.openIssuesPage", () => openGitHub("/issues/new"));
  commands.registerCommand("defaults.openDiscussionsPage", () => openGitHub("/discussions"));

  addCustomMenuItems();
  purgeMenus();

  // globalThis.MenuRegistry = MenuRegistry;
  // globalThis.MenuId = MenuId;
}

function addCustomMenuItems() {
  MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
    group: "3_views",
    order: 3,
    command: {
      id: "workbench.view.extension.project-manager",
      title: "Project Manager"
    }
  });

  MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
    group: "2_links",
    command: {
      id: "defaults.openGitHubPage",
      title: "GitHub Page"
    }
  });

  MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
    group: "2_links",
    order: 2,
    command: {
      id: "defaults.openIssuesPage",
      title: "Report Issue"
    }
  });

  MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
    group: "2_links",
    order: 3,
    command: {
      id: "defaults.openDiscussionsPage",
      title: "Discussions Page"
    }
  });
}

function purgeMenus() {
  removeMenu(MenuId.TitleBarContext);
  removeMenu(MenuId.ActivityBarPositionMenu);

  removeSubmenu(MenuId.MenubarHelpMenu, "workbench.action.openWalkthrough");
  removeSubmenu(MenuId.MenubarHelpMenu, "workbench.action.showInteractivePlayground");

  removeSubmenu(MenuId.MenubarViewMenu, "workbench.action.showCommands");
  removeSubmenu(MenuId.MenubarViewMenu, "workbench.action.openView");

  removeSubmenu(MenuId.ViewContainerTitleContext, "workbench.action.toggleSidebarPosition");
  removeSubmenu(MenuId.ViewContainerTitleContext, "workbench.action.toggleSidebarPosition");
  removeSubmenu(MenuId.ViewTitleContext, "workbench.action.toggleSidebarPosition");
  removeSubmenu(MenuId.ViewTitleContext, "workbench.action.toggleSidebarPosition");

  removeSubmenu(MenuId.MenubarFileMenu, "addRootFolder");
}

function removeMenu(menu: MenuId) {
  // @ts-expect-error _menuItems private
  MenuRegistry._menuItems.delete(menu);
}

function removeSubmenu(menu: MenuId, commandId: string) {
  // @ts-expect-error _menuItems private
  const linkedList = MenuRegistry._menuItems.get(menu);

  for (let node = linkedList._first; node !== undefined; node = node.next) {
    if (node.element?.command?.id === commandId) {
      linkedList._remove(node);

      // // @ts-expect-error _onDidChangeMenu private
      // MenuRegistry._onDidChangeMenu.fire(menu);
      break;
    }
  }
}

// // @ts-expect-error _onDidChangeMenu private
// MenuRegistry._onDidChangeMenu._mergeFn = function merge(events: { id?: string }[]) {
//   const ids = new Set();

//   for (const event of events) {
//     if (event.id) ids.add(event.id);
//   }

//   return ids;
// };

// // @ts-expect-error _onDidChangeMenu private
// MenuRegistry._onDidChangeMenu._options.merge = MenuRegistry._onDidChangeMenu._mergeFn;

export default activate;