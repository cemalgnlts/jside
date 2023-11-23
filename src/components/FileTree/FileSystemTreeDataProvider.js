import { FileSystem } from "../../libs/FileSystem";

export default class FileSystemTreeDataProvider {
  changeHandler = null;
  items = {};

  constructor(items) {
    this.items = items;
  }

  update(items) {
    this.items = items;

    this.changeHandler(Object.keys(this.items));
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
    const fs = FileSystem.get();

    if (item.index === "new") {
      const path = `${item.parent}/${name}`;
      item.path = path;

      const isExists = await fs.isExists(item.path);

      if (isExists) {
        alert("File already exists.");
        return;
      }

      await fs.writeFile(item.path, "");
    } else {
      await fs.renameFile(item.index, name);
    }

    // let newPath = item.index.split("/");
    // newPath.pop();
    // newPath.push(name);
    // newPath = newPath.push("/");

    this.items[item.index] = item;

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
