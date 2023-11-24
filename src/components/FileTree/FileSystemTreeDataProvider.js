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
      const path = `${item.parent}${name}`;
      item.path = path;
      item.title = name;

      const isExists = await fs.isExists(item.path).catch(alert);

      if (isExists) {
        alert("File already exists.");
        return;
      }

      await fs.writeFile(item.path, "").catch(alert);
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

  async remove(itemId) {
    try {
      await FileSystem.get().rm(this.items[itemId].path);
    } catch (err) {
      console.error(err);
      alert(err);
      return;
    }

    delete this.items[itemId];
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
