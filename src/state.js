import { createStore, atom } from "jotai";
import FileSystem from "./libs/LocalServer/FileSystem.js";

const fileSystem = new FileSystem();
window.fs = fileSystem;

const store = atom({
  files: []
});

const $files = atom((get) => get(store).files);

export { store, $files };
