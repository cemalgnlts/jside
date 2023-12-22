import { TreeItem, TreeItemCollapsibleState } from "vscode";

class ProjectTreeItem extends TreeItem {
	constructor(
		public readonly label: string,
		public readonly fileSystem: "opfs" | "dfs"
	) {
        super(label, TreeItemCollapsibleState.None);
    }
}

export default ProjectTreeItem;
