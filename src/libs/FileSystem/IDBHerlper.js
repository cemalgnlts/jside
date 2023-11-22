export class IDBHelper {
  static set(key, val) {
    const executor = async (resolve, reject) => {
      const db = await this._open();
      const request = db
        .transaction("FileSystem", "readwrite")
        .objectStore("FileSystem")
        .put(val, key);

      request.onerror = (ev) => reject(ev.target.errorCode);
      request.onsuccess = (ev) => resolve(ev.target.result);
    };

    return new Promise(executor);
  }

  static get(key) {
    const executor = async (resolve, reject) => {
      const db = await this._open();
      const request = db
        .transaction("FileSystem")
        .objectStore("FileSystem")
        .get(key);
      request.onerror = (ev) => reject(ev.target.errorCode);
      request.onsuccess = (ev) => resolve(ev.target.result);
    };

    return new Promise(executor);
  }

  /**
   * @returns {Promise<IDBDatabase>}
   */
  static async _open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("JSIDE", 1);
      request.onerror = (ev) => reject(ev.target.errorCode);
      request.onsuccess = (ev) => resolve(ev.target.result);

      request.onupgradeneeded = (ev) => {
        /** @type {IDBDatabase}*/
        const db = ev.target.result;

        if (!db.objectStoreNames.contains("FileSystem")) {
          db.createObjectStore("FileSystem");
        }

        resolve(db);
      };
    });
  }
}
