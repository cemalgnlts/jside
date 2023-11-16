export default class Path {
  /**
   * Returns the directory name of a path.
   * @param {string} path
   * @returns {string}
   */
  static dirname(path) {
    return path.slice(0, path.lastIndexOf("/"));
  }

  /**
   * Returns the last portion of a path.
   * @param {string} path
   * @returns {string}
   */
  static basename(path) {
    return path.slice(path.lastIndexOf("/") + 1);
  }

  /**
   * Returns an object whose properties represent significant elements of the path.
   * @param {string} path
   * @returns {{ dir: string, base: string }}
   */
  static parse(path) {
    const dir = Path.dirname(path);
    const base = Path.basename(path);

    return { dir, base };
  }
}
