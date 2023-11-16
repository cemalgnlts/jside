import Path from "./Path.js";

class OPFileSystem {
  /** @type {FileSystemDirectoryHandle} */
  _rootDirHandle = null;

  constructor() {}

  async requestPermission() {
    await navigator.storage
      .persisted()
      .catch(() => navigator.storage.persist());

    this._rootDirHandle = await navigator.storage.getDirectory();
  }

  /**
   * Writes data to the file.
   * @param {string} path.
   * @param {string|Blob|ArrayBuffer|DataView} contents File content.
   */
  async writeFile(path, contents) {
    const fixedPath = this.normalizePath(path);
    const { dir, base } = Path.pathParse(fixedPath);

    const dirHandle = await this._getParentDirectoryHandle(dir);
    const fileHandle = await dirHandle.getFileHandle(base, { create: true });
    const writable = await fileHandle.createWritable();

    await writable.write(contents);
    await writable.close();
  }

  /**
   * Reads the contents of a file.
   * @param {String} path.
   * @param {"file" | "utf8"} type Content type.
   * @returns {Promise<String|File>}
   */
  async readFile(path, type = "file") {
    const fixedPath = this.normalizePath(path);
    const { dir, base } = Path.pathParse(fixedPath);

    const dirHandle = await this._getParentDirectoryHandle(dir);
    const fileHandle = await dirHandle.getFileHandle(base);
    const file = await fileHandle.getFile();

    if (type === "utf8") return file.text();

    return file;
  }

  /**
   * Create recursive directories.
   * @param {string} path
   */
  async mkdir(path) {
    const fixedPath = this.normalizePath(path);
    const parts = fixedPath.slice(1).split("/");
    let dirHandle = this._rootDirHandle;

    for (const name of parts) {
      dirHandle = await dirHandle.getDirectoryHandle(name, { create: true });
    }
  }

  /**
   * Reads the contents of a directory.
   * @param {String} path Directory path.
   * @param {{ recursive: boolean }} options Options.
   * @returns {Promise<String[]>}
   */
  async readdir(path, options = { recursive: false }) {
    const fixedPath = this.normalizePath(path);

    const dirHandle = await this._getParentDirectoryHandle(fixedPath);
    const res = [];

    if (options.recursive) {
      for await (const dir of this._getFilesRecursively(dirHandle)) {
        res.push(dir);
      }
    } else {
      for await (const dir of dirHandle.keys()) res.push(dir);
    }

    return res;
  }

  /**
   * Remove an entry if the directory handle contains a file or directory called the name specified.
   * @param {string} path
   * @param {{ recursive: false }} options
   */
  async rm(path, options = { recursive: false }) {
    const fixedPath = this.normalizePath(path);
    const { dir, base } = Path.pathParse(fixedPath);

    const dirHandle = await this._getParentDirectoryHandle(dir);

    return dirHandle.removeEntry(base, { recursive: options.recursive });
  }

  /**
   * Rename file.
   * @param {string} path
   * @param {string} newName
   */
  async renameFile(path, newName) {
    const fixedPath = this.normalizePath(path);
    const { dir, base } = Path.pathParse(fixedPath);

    const dirHandle = await this._getParentDirectoryHandle(dir);
    const file = await dirHandle.getFileHandle(base);

    return file.move(newName);
  }

  /**
   * To move around the file.
   * @param {string} path
   * @param {string} targetFolderPath
   */
  async moveFile(path, targetFolderPath) {
    const sourceFixedPath = this.normalizePath(path);
    const { dir: sourceDir, base: sourceBase } =
      Path.pathParse(sourceFixedPath);

    const sourceDirHandle = await this._getParentDirectoryHandle(sourceDir);
    const file = await sourceDirHandle.getFileHandle(sourceBase);

    const targetFixedPath = this.normalizePath(targetFolderPath);
    const targetDirHandle = await this._getParentDirectoryHandle(
      targetFixedPath
    );

    return file.move(targetDirHandle);
  }

  /**
   *
   * @param {String} path
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  async _getParentDirectoryHandle(path) {
    let dirHandle = this._rootDirHandle;
    const parts = path.slice(1).split("/");

    if (parts.length === 1 && parts[0] === "") return dirHandle;

    for (const name of path.slice(1).split("/")) {
      dirHandle = await dirHandle.getDirectoryHandle(name);
    }

    return dirHandle;
  }

  /**
   * @param {FileSystemHandle} entry
   * @returns {String[]}
   * @private
   */
  async *_getFilesRecursively(entry) {
    if (entry.kind === "file") {
      const relativePath = await this._rootDirHandle.resolve(entry);

      yield `/${relativePath.join("/")}`;
    } else if (entry.kind === "directory") {
      const relativePath = await this._rootDirHandle.resolve(entry);

      yield `/${relativePath.join("/")}/`;

      for await (const handle of entry.values()) {
        yield* this._getFilesRecursively(handle);
      }
    }
  }

  normalizePath(path = "") {
    if (this._rootDirHandle === null)
      throw Error("First use requestPermission() function!");

    let fixedPath = path.trim();

    if (fixedPath.length < 1) throw Error("Wrong or empty path attribute!");

    fixedPath = !path.startsWith("/") ? `/${path}` : path;

    if (fixedPath.endsWith("/")) fixedPath = fixedPath.slice(0, -1);

    return fixedPath;
  }
}

export default OPFileSystem;
