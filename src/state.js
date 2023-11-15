import { atom } from "jotai";

import FileSystem from "./libs/FileSystem";

let fileSystem = null;

const store = atom({
  currentProject: "test",
  currentDir: "/test"
});

const $dockViewApi = atom(null);
const $fileSystem = atom(() => fileSystem);

const $fileTree = atom(async (get) => {
  if (!fileSystem) {
    fileSystem = await FileSystem.getFileSystem();
  }

  const currentDir = get(store).currentDir;

  const paths = await fileSystem.readdir(currentDir, { recursive: true });

  const format = {
    root: {
      index: "root",
      isFolder: true,
      title: currentDir.slice(1),
      children: []
    }
  };

  for (const path of paths) {
    if (path === `${currentDir}/`) continue;

    const isFolder = path.endsWith("/");

    const base = fileSystem.basename(isFolder ? path.slice(0, -1) : path);

    format[path] = {
      index: path,
      title: base,
      children: [],
      isFolder
    };

    const parts = path.slice(1, -1).split("/");
    if (parts.length === 2) {
      if (isFolder) format.root.children.unshift(path);
      else format.root.children.push(path);
    } else if (parts.length > 2 && isFolder) {
      parts.pop();
      const parent = `/${parts.join("/")}/`;
      format[parent].children.push(path);
    }
  }

  return format;
});

export { $dockViewApi, $fileSystem, $fileTree };
