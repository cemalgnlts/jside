import {
  Event,
  EventEmitter,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
  workspace
} from "vscode";

class PackageTreeProvider implements TreeDataProvider<PackageTreeItem> {
  static readonly id = "packageTree";

  private dataChangeEventEmitter: EventEmitter<PackageTreeItem | void> = new EventEmitter();

  readonly onDidChangeTreeData?: Event<PackageTreeItem | PackageTreeItem[] | void> =
    this.dataChangeEventEmitter.event;

  constructor(private wspace: typeof workspace, public pkgJSONUri: Uri | null) {}

  getTreeItem(element: PackageTreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(): Thenable<PackageTreeItem[]> {
    if (this.pkgJSONUri === null) return Promise.resolve([]);

    return this.wspace.fs.readFile(this.pkgJSONUri).then(
      (ui8Content) => {
        let contents: { dependencies?: string[] };

        try {
          const raw = new TextDecoder().decode(ui8Content);
          contents = JSON.parse(raw);
        } catch {
          return Promise.resolve([]);
        }

        const deps = Object.entries(contents.dependencies ?? []);

        return Promise.resolve(deps.map((label) => new PackageTreeItem(label)));
      },
      () => Promise.resolve([])
    );
  }

  refresh() {
    this.dataChangeEventEmitter.fire();
  }
}

class PackageTreeItem extends TreeItem {
  constructor(public dep: [string, string]) {
    super(dep[0], TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon("package");
    this.description = dep[1];
  }
}

export { PackageTreeProvider, PackageTreeItem };
