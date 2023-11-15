import OPFileSystem from "./OPFileSystem";

class FileSystem {
  constructor() {}

  /**
   *
   * @returns {Promise<OPFileSystem>}
   */
  static async getFileSystem() {
    const fs = new OPFileSystem();

    await fs.requestPermission();

    return fs;
  }
}

export default FileSystem;
