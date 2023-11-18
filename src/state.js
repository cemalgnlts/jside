import { atom } from "jotai";

import FileSystem from "./libs/FileSystem";

import { formatProjectFilesAsTree } from "./utils";

let fileSystem = null;

const store = atom({
  currentProject: "test",
  currentDir: "/test"
});

const $dockViewApi = atom(null);

const $fileTree = atom({
  root: {
    name: ""
  }
});

const $updateFileTree = atom(null, async (get, set) => {
  if (!fileSystem) {
    fileSystem = await FileSystem.getFileSystem();
    globalThis.fileSystem = fileSystem;
  }

  const currentDir = get(store).currentDir;

  const files = await fileSystem.readdir(currentDir, { recursive: true });
  const format = await formatProjectFilesAsTree(files, currentDir);

  set($fileTree, { ...format });
});

const $insertFile = atom(null, (get, set, info) => {
  const tree = get($fileTree);

  const clone = { ...tree };
  clone["new"] = {
    index: "new",
    name: "",
    path: "",
    isFolder: false
  };

  clone[info.parent].children.push("new");

  set($fileTree, clone);
});

export { $dockViewApi, $fileTree, $updateFileTree, $insertFile, fileSystem };
