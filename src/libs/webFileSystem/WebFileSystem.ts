import { HTMLFileSystemProvider } from "@codingame/monaco-vscode-files-service-override";

import { StandaloneServices, ILogService } from "vscode/services";
import { URI } from "vscode/vscode/vs/base/common/uri";

class WebFileSystem extends HTMLFileSystemProvider {
  constructor() {
    super(undefined, "WebFileSystem", StandaloneServices.get(ILogService));
  }

  mount(root: FileSystemDirectoryHandle) {
    return super.registerDirectoryHandle(root);
  }

  readDirectory(resource: URI) {
    return this.readdir(resource);
  }

  createDirectory(resource: URI) {
    return this.mkdir(resource);
  }
}

export default WebFileSystem;
