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
    else if (type === "op") return this._opFileSystem();

    throw Error("Unknown file system type.");
  }

  /**
   * @param {"device"|"op"} type File system type.
   * @returns {FileSystemManager}
   */
  static get(type) {
    if (
      (type === "device" && this.deviceFSManager === null) ||
      (type === "op" && this.opFSManager === null)
    )
      throw Error("First initialize file system.");

    if (type === "device") return this.deviceFSManager;
    else if (type === "op") return this.opFSManager;

    throw Error("Unknown file system type.");
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

    await this._prepareRootDirectory(root);

    await IDBHelper.set("rootDirectoryHandle", root).catch((err) =>
      console.warn("Why didn't you allow my web app to use IndexedDB?!", err)
    );

    this.deviceFSManager = new FileSystemManager(root);
  }

  static async _opFileSystem() {
    this.isPersisted = await navigator.storage.persisted();

    if (!this.isPersisted) this.isPersisted = await navigator.storage.persist();

    const root = await navigator.storage.getDirectory();

    await this._prepareRootDirectory(root);

    this.opFSManager = new FileSystemManager(root);
  }

  static async _prepareRootDirectory(root) {
    await root.getDirectoryHandle("projects", { create: true });
    await root.getDirectoryHandle("libs", { create: true });
    await root.getDirectoryHandle("types", { create: true });
    await root.getDirectoryHandle("dist", { create: true });
  }

  /**
   * @param {"device"|"op"} type File system type.
   * @returns {boolean}
   */
  static checkPermission(type) {
    if (type === "device") return this.deviceFSManager !== null;
    else if (type === "op") return this.opFSManager !== null;

    throw Error("Unknown file system type.");
  }
}

export { FileSystem };
globalThis.fs = FileSystem;
