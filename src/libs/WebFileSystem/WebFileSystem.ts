import {
  HTMLFileSystemProvider,
  IStat
} from "@codingame/monaco-vscode-files-service-override";

import type { FileSystemProvider, FileType, Uri } from "vscode";
import { StandaloneServices, ILogService } from "vscode/services";
import { URI } from "vscode/vscode/vs/base/common/uri";

class WebFileSystem
  extends HTMLFileSystemProvider
  implements FileSystemProvider
{
  constructor() {
    super(undefined, "WebFileSystem", StandaloneServices.get(ILogService));
  }

  mount(root: FileSystemDirectoryHandle) {
    return super.registerDirectoryHandle(root);
  }
}

export default WebFileSystem;
