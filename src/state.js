import { atom } from "jotai";

import { FileSystem } from "./libs/FileSystem";

import { convertFilesToTree } from "./utils/Utils";

const store = atom({
  currentProject: "test",
  currentDir: "/test"
});

const $dockViewApi = atom(null);

const $projectTree = atom({
  root: {
    name: ""
  }
});

const $updateProjectTree = atom(null, async (get, set) => {
  const currentDir = "/projects";

  if (!FileSystem._fsManager) return;

  let files = await FileSystem.get().readdir(currentDir);
  files = files.map((folder) => `${currentDir}/${folder}/`);
  const format = await convertFilesToTree(files, currentDir);

  set($projectTree, { ...format });
});

const $fileTree = atom({
  root: {
    name: ""
  }
});

const $updateFileTree = atom(null, async (get, set) => {
  const currentDir = get(store).currentDir;

  const files = await FileSystem.get().readdir(currentDir, { recursive: true });
  const format = await convertFilesToTree(files, currentDir);

  set($fileTree, { ...format });
});

const $insertFile = atom(null, (get, set, info) => {
  const tree = get($fileTree);

  const clone = { ...tree };
  clone["new"] = {
    index: "new",
    title: "",
    path: "",
    isFolder: false
  };

  clone[info.parent].children.push("new");

  set($fileTree, clone);
});

export {
  $dockViewApi,
  $projectTree,
  $updateProjectTree,
  $fileTree,
  $updateFileTree,
  $insertFile
};
