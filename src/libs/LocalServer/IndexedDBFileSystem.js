import { getMimeType } from "./mimeTypes.js";

class FileSystem {
  /** @type {IDBDatabase}  */
  db = null;
  /** @type {IDBIndex} */
  pathIndex = null;
  name = "LocalHost";
  objectStoreName = "FileSystem";
  version = 1;

  constructor() {
    const openRequest = indexedDB.open(this.name, this.version);
    openRequest.onupgradeneeded = this.onUpgradeNeeded.bind(this);
    openRequest.onerror = console.error;
    openRequest.onsuccess = () => {
      this.db = openRequest.result;
    };
  }

  onUpgradeNeeded(ev) {
    this.db = ev.target.result;

    if (!this.db.objectStoreNames.contains(this.objectStoreName)) {
      const store = this.db.createObjectStore(this.objectStoreName);
      store.createIndex("path", "key");
    }
  }

  _wrapAsync(fun, mode = "readwrite") {
    return new Promise((resolve, reject) => {
      const store = this.db
        .transaction(this.objectStoreName, mode)
        .objectStore(this.objectStoreName);

      const request = fun(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  writeFile(path = "", data) {
    const fixPath = !path.startsWith("/") ? `/${path}` : path;

    const handle = (store) => {
      if (!fixPath || fixPath.length < 4)
        throw Error("path argument missing or wrong!");

      const type = getMimeType(FileSystem.extname(fixPath));
      const blob = new Blob([data], { type });

      return store.put(blob, fixPath);
    };

    return this._wrapAsync(handle);
  }

  readFile(path = "") {
    const fixPath = !path.startsWith("/") ? `/${path}` : path;

    const handle = (store) => {
      if (!fixPath || fixPath.length < 4)
        throw Error("path argument missing or wrong!");

      return store.get(fixPath);
    };

    return this._wrapAsync(handle, "readonly");
  }

  readdir(path = "") {
    const fixPath = !path.startsWith("/") ? `/${path}` : path;

    const handle = (resolve, reject) => {
      const store = this.db
        .transaction(this.objectStoreName, "readonly")
        .objectStore(this.objectStoreName);

      if (!fixPath || fixPath.length < 1)
        throw Error("path argument missing or wrong!");

      const data = {};

      const request = store.openCursor(IDBKeyRange.lowerBound(fixPath));
      request.onerror = () => reject(request.error);

      request.onsuccess = (ev) => {
        /** @type {IDBCursorWithValue} */
        const cursor = ev.target.result;
        if (!cursor) return resolve(data);

        data[cursor.key] = cursor.value;
        cursor.continue();
      };
    };

    return new Promise(handle);
  }

  rename(oldPath, newPath) {}
  rm(path) {}

  async init(data) {
    const handle = (store) => {
      let request = null;

      for (const [path, text] of Object.entries(data)) {
        const fixPath = !path.startsWith("/") ? `/${path}` : path;

        const type = getMimeType(FileSystem.extname(fixPath));
        const blob = new Blob([text], { type });

        request = store.put(blob, fixPath);
      }

      return request;
    };

    return this._wrapAsync(handle);
  }

  /* Helper */
  static basename(path) {
    return path.split("/").pop();
  }

  static dirname(path) {
    const splitted = path.split("/");
    splitted.pop();

    return splitted.join("/");
  }

  static extname(path) {
    return path.slice(path.lastIndexOf(".") + 1);
  }
}

export default FileSystem;
