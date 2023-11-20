import { atom } from "jotai";

import { FileSystem } from "./libs/FileSystem";

import { convertFilesToTree } from "./utils/Utils";

const store = atom({
  isProjectExplorer: true,
  currentProject: "",
  currentDir: "/projects"
});

const $dockViewApi = atom(null);
const $isProjectExplorer = atom((get) => get(store).isProjectExplorer);
const $openProject = atom(null, (get, set, { title, path }) => {
  set(store, {
    isProjectExplorer: false,
    currentProject: title,
    currentDir: path
  });
});

const $projectTree = atom({
  root: {}
});

const $updateProjectTree = atom(null, async (_, set) => {
  const currentDir = "/projects";

  if (!FileSystem._fsManager) return;

  let files = await FileSystem.get().readdir(currentDir);
  files = files.map((folder) => `${currentDir}/${folder}/`);
  const format = await convertFilesToTree(files, currentDir, true);

  set($projectTree, format);
});

const $fileTree = atom({
  root: {}
});

const $updateFileTree = atom(null, async (get, set) => {
  const currentDir = get(store).currentDir;

  const files = await FileSystem.get().readdir(currentDir, { recursive: true });
  const format = await convertFilesToTree(files, currentDir);

  set($fileTree, format);
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
  $isProjectExplorer,
  $openProject,
  $projectTree,
  $updateProjectTree,
  $fileTree,
  $updateFileTree,
  $insertFile
};
