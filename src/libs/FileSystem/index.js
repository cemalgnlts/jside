import FileSystemManager from "./FileSystemManager.js";
import { IDBHelper } from "./IDBHerlper.js";

class FileSystem {
  static _fsManager = null;
  static isPersisted = false;

  constructor() {
    throw TypeError("Illegal constructor");
  }

  /**
   *
   * @returns {Promise<boolean>}
   */
  static async requestPermission() {
    /** @type {FileSystemDirectoryHandle} */
    let root = await IDBHelper.get("rootDirectoryHandle").catch(() => null);

    if (root) {
      let isWritable = await root.queryPermission({ mode: "readwrite" });

      if (isWritable !== "granted") {
        isWritable = await root.requestPermission({ mode: "readwrite" });

        if (isWritable !== "granted") throw { name: "AbortError" };
      }
    }

    if (!root) {
      if (!!window.showDirectoryPicker) {
        root = await window.showDirectoryPicker({
          mode: "readwrite",
          startIn: "documents"
        });
      } else {
        root = await this._privateFileSystem();
      }
    }

    if (root.name !== "JSIDE")
      root = await root.getDirectoryHandle("JSIDE", { create: true });

    await root.getDirectoryHandle("projects", { create: true });
    await root.getDirectoryHandle("libs", { create: true });
    await root.getDirectoryHandle("types", { create: true });
    await root.getDirectoryHandle("dist", { create: true });

    await IDBHelper.set("rootDirectoryHandle", root).catch((err) =>
      console.warn("Why didn't you allow my web app to use IndexedDB?!", err)
    );

    this._fsManager = new FileSystemManager(root);

    return true;
  }

  /**
   *
   * @returns {Promise<FileSystemManager>}
   */
  static get() {
    if (this._fsManager === null) throw Error("First initialize file system.");

    return this._fsManager;
  }

  static async _privateFileSystem() {
    this.isPersisted = navigator.storage.persisted();

    if (!this.isPersisted) this.isPersisted = await navigator.storage.persist();

    return navigator.storage.getDirectory();
  }
}

export { FileSystem };
