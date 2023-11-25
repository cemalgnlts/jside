import { FileSystem } from "../../libs/FileSystem";
import Path from "../../libs/FileSystem/Path";
import {
  $isProjectExplorer,
  $updateFileTree,
  $updateProjectTree,
  store
} from "../../state";

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
      item.index = path;
      item.path = path;
      item.title = name;

      const isExists = await fs.isExists(item.path);

      if (isExists) {
        delete this.items[item.index];
        await this.refresh();

        alert("File already exists.");
        return;
      }

      await fs.writeFile(item.path, "");
    } else {
      let newPath;
      try {
        newPath = await fs.renameFile(item.path, name);
      } catch (err) {
        alert(err);
        return;
      }

      item.title = Path.basename(newPath);
      item.path = newPath;
      item.index = newPath;
    }

    this.items[item.index] = item;

    await this.refresh();
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

    await this.refresh();
  }

  async onChangeItemChildren(itemId, newChildren) {
    this.items[itemId].children = newChildren;
    this.changeHandler?.([itemId]);
  }

  onDidChangeTreeData(listener) {
    this.changeHandler = listener;

    return { dispose: () => (this.changeHandler = null) };
  }

  refresh() {
    const isProjectExplorer = store.get($isProjectExplorer);
    const updateTree = isProjectExplorer ? $updateProjectTree : $updateFileTree;
    return store.set(updateTree);
  }
}
