import { Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";
import ProjectTreeItem from "./projectTreeItem";

class ProjectTreeDataProvider implements TreeDataProvider<ProjectTreeItem> {
	public static readonly id = "projectTree";

	private _onDidChangeTreeData: EventEmitter<ProjectTreeItem | undefined | null | void> = new EventEmitter<
		ProjectTreeItem | undefined | null | void
	>();
	readonly onDidChangeTreeData: Event<void | ProjectTreeItem | ProjectTreeItem[] | null | undefined> | undefined = this._onDidChangeTreeData.event;

	getTreeItem(element: ProjectTreeItem): TreeItem | Thenable<TreeItem> {
		return element;
	}

	getChildren(): Thenable<ProjectTreeItem[]> {
		return Promise.resolve([]);
	}

	refresh() {
		this._onDidChangeTreeData.fire();
	}
}

export default ProjectTreeDataProvider;
