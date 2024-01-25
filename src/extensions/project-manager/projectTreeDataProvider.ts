import {
  Event,
  EventEmitter,
  ThemeIcon,
  FileType,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  Uri
} from "vscode";
import WebFileSystem from "../../libs/webFileSystem/WebFileSystem";
import { WebFileSystemType } from "../../libs/webFileSystem";

class ProjectTreeDataProvider implements TreeDataProvider<ProjectTreeItem> {
  public static readonly id = "projectTree";

  private dataChangeEventEmitter: EventEmitter<ProjectTreeItem | undefined | null | void> = new EventEmitter<
    ProjectTreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData: Event<void | ProjectTreeItem | ProjectTreeItem[] | null | undefined> | undefined =
    this.dataChangeEventEmitter.event;

  constructor(public fs: WebFileSystem | null) {}

  getTreeItem(element: ProjectTreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(): Thenable<ProjectTreeItem[]> {
    if (this.fs === null) return Promise.resolve([]);

    let items: ProjectTreeItem[] = [];

    return this.fs!.readdir(Uri.file("/JSIDE/projects")).then((dirs) => {
      if (dirs.length > 0) {
        const folders = dirs.filter(([, type]) => type === FileType.Directory);
        items = folders.map(([folderName]) => new ProjectTreeItem(folderName, this.fs!.type));
      }

      return items;
    });
  }

  refresh() {
    this.dataChangeEventEmitter.fire();
  }
}

class ProjectTreeItem extends TreeItem {
  constructor(public readonly label: string, fsType: WebFileSystemType) {
    super(label, TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon(fsType === "dfs" ? "device-desktop" : "database");

    this.command = {
      command: "projectManager.open",
      arguments: [fsType, label],
      title: ""
    };
  }
}

export { ProjectTreeDataProvider, ProjectTreeItem };
