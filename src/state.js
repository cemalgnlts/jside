import { atom, createStore } from "jotai";

import { FileSystem } from "./libs/FileSystem";

import { convertFilesToTree } from "./utils/Utils";

const store = createStore();

const $currentStatus = atom({
  isProjectExplorer: true,
  projectName: "",
  fsType: "",
  dir: "/projects"
});

const $dockViewApi = atom(null);

const $isProjectExplorer = atom((get) => get($currentStatus).isProjectExplorer);
const $openProject = atom(null, (get, set, { title, path, fsType }) => {
  set($currentStatus, {
    isProjectExplorer: false,
    projectName: title,
    dir: path,
    fsType: fsType
  });
});

const projectTrees = {
  device: atom({ root: {} }),
  op: atom({ root: {} })
};

const $fileTree = atom({
  root: {}
});

const $updateProjectTree = atom(null, async (_, set, fsType) => {
  const currentDir = "/projects";

  let files = await FileSystem.get(fsType).readdir(currentDir);
  files = files.map((folder) => `${currentDir}/${folder}/`);
  const format = await convertFilesToTree(files, currentDir, true);

  set(projectTrees[fsType], format);
});

const $updateFileTree = atom(null, async (get, set, fsType_) => {
  const { dir, fsType = fsType_ } = get($currentStatus);

  const files = await FileSystem.get(fsType).readdir(dir, {
    recursive: true
  });
  const format = await convertFilesToTree(files, dir);

  set($fileTree, format);
});

const $insertFile = atom(null, (get, set, info) => {
  const tree = get($fileTree);
  const projectDir = get($currentStatus).dir;

  const clone = { ...tree };
  clone["new"] = {
    index: "new",
    title: "",
    path: "",
    parent: `${projectDir}/${info.relativeParentPath}`,
    isFolder: false
  };

  clone[info.parentIndex].children.push("new");

  set($fileTree, clone);
});

export {
  $dockViewApi,
  $isProjectExplorer,
  $openProject,
  projectTrees,
  $updateProjectTree,
  $fileTree,
  $updateFileTree,
  $insertFile,
  $currentStatus,
  store
};
