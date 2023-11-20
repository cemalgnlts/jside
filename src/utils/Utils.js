import { FileSystem } from "../libs/FileSystem";
import Path from "../libs/FileSystem/Path";
import { monaco } from "../components/Editor/monacoLoader";

export function explainFSError(err) {
  switch (err.name) {
    case "AbortError":
      return (
        "Thrown if the user dismisses the prompt without making a selection, " +
        "or if the user agent deems the selected content to be too sensitive or dangerous."
      );
    case "SecurityError":
      return (
        "Thrown if the call was blocked by the same-origin policy or " +
        "it was not called via a user interaction such as a button press."
      );
    case "TypeError":
      return (
        "Thrown if obtaining a local storage shelf failed. For example, " +
        "if the current origin is an opaque origin or if the user has disabled storage."
      );
  }

  return err.message;
}

export async function getOrCreateModel(path) {
  const uri = monaco.Uri.file(path);
  let model = monaco.editor.getModel(uri);

  if (!model) {
    const content = await FileSystem.get().readFile(path, "utf8");
    const language = getCodeLanguageFromName(path);
    model = monaco.editor.createModel(content, language, uri);
  }

  return model;
}

export function getCodeLanguageFromName(name) {
  const ext = name.slice(name.lastIndexOf(".") + 1);

  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    default:
      return ext;
  }
}

export async function convertFilesToTree(paths, currentDir, noFolder = false) {
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

    const { dir: parent, base } = Path.parse(
      isFolder ? path.slice(0, -1) : path
    );

    format[path] = {
      index: path,
      title: base,
      path: `${parent}/${base}`,
      parent,
      isFolder: !noFolder && isFolder
    };

    if (isFolder) format[path].children = [];

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
}
