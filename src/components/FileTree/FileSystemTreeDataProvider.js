import { fileSystem } from "../../state";

export default class FileSystemTreeDataProvider {
  changeHandler = null;
  items = {};

  constructor(items) {
    this.items = items;
  }

  async getTreeItem(itemId) {
    return this.items[itemId];
  }

  async getTreeItems(itemIds) {
    const found = [];

    for (const item of Object.values(this.items)) {
      if (itemIds.includes(item.index)) found.push({ ...item });
    }

    return found;
  }

  async onRenameItem(item, name) {
    await fileSystem.renameFile(item.index, name);

    // let newPath = item.index.split("/");
    // newPath.pop();
    // newPath.push(name);
    // newPath = newPath.push("/");

    this.items[item.index].name = name;
    // this.item[item.index].path = newPath;

    this.changeHandler?.([item.index]);
  }

  async onChangeItemChildren(itemId, newChildren) {
    this.items[itemId].children = newChildren;
    this.changeHandler?.([itemId]);
  }

  onDidChangeTreeData(listener) {
    this.changeHandler = listener;

    return { dispose: () => (this.changeHandler = null) };
  }
}
