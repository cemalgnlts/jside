import { atom } from "jotai";

import FileSystem from "./libs/FileSystem";

import { formatProjectFilesAsTree } from "./utils";

let fileSystem = null;

const store = atom({
  currentProject: "test",
  currentDir: "/test"
});

const $dockViewApi = atom(null);

const $files = atom(async (get) => {
  if (!fileSystem) {
    fileSystem = await FileSystem.getFileSystem();
  }

  const currentDir = get(store).currentDir;
  return fileSystem.readdir(currentDir, { recursive: true });
});

const $tree = atom({});

const $fileTree = atom(
  async (get) => {
    const currentDir = get(store).currentDir;
    const files = await get($files);
    const format = await formatProjectFilesAsTree(files, currentDir);

    return format;
  },
  async (get, set) => {
    const tree = await get($files);
    set($tree, tree);
  }
);

async function formatFiles(currentDir) {
  const format = await formatProjectFilesAsTree(paths, currentDir);

  return format;
}

export { $dockViewApi, $tree, $fileTree, fileSystem };
