import FileSystemManager from "./FileSystemManager.js";
import { IDBHelper } from "./IDBHerlper.js";

class FileSystem {
  static _fsManager = null;
  static deviceFSManager = null;
  static opFSManager = null;
  static isPersisted = false;

  constructor() {
    throw TypeError("Illegal constructor");
  }

  /**
   * @param {"device"|"op"} type File system type.
   * @returns {Promise<undefined>}
   */
  static requestPermission(type) {
    if (type === "device") return this._deviceFileSystem();
    else return this._opFilesystem();
  }

  /**
   *
   * @returns {FileSystemManager}
   */
  static get() {
    if (this.deviceFSManager === null)
      throw Error("First initialize file system.");

    return this.deviceFSManager;
  }

  static async _deviceFileSystem() {
    /** @type {FileSystemDirectoryHandle} */
    let root = await IDBHelper.get("rootDirectoryHandle");

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

    this.deviceFSManager = new FileSystemManager(root);
  }

  static async _opFilesystem() {
    this.isPersisted = await navigator.storage.persisted();

    if (!this.isPersisted) this.isPersisted = await navigator.storage.persist();

    return navigator.storage.getDirectory();
  }

  static get hasAccessDeviceFS() {
    return FileSystem.deviceFSManager !== null;
  }
}

export { FileSystem };
globalThis.fs = FileSystem;
