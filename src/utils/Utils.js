import { FileSystem } from "../libs/FileSystem";
import Path from "../libs/FileSystem/Path";
import { monaco } from "../components/Editor/monacoLoader";

export function openFile(index, title, path) {}

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

export function getCodeLanguageFromName(name) {
  const ext = name.slice(name.lastIndexOf(".") + 1);

  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "md":
      return "markdown";
    default:
      return ext;
  }
}

export async function convertFilesToTree(paths, currentDir, noFolder = false) {
  const format = {
    root: {
      index: "root",
      isFolder: true,
      title: currentDir.slice(1).split("/")[1],
      children: []
    }
  };

  for (const path of paths) {
    // We defined root above.
    if (path === `${currentDir}/`) continue;

    const isFolder = path.endsWith("/");

    const { dir: parent, base } = Path.parse(
      isFolder ? path.slice(0, -1) : path
    );

    format[path] = {
      index: path,
      title: base,
      path: `${parent}/${base}`,
      isFolder: !noFolder && isFolder,
      parent
    };

    if (isFolder) format[path].children = [];

    const parentNode =
      parent === currentDir ? format.root : format[`${parent}/`];

    if (isFolder) parentNode.children.unshift(path);
    else parentNode.children.push(path);
  }

  for (const file of Object.values(format)) {
    if (!file.isFolder) continue;

    file.children.sort((a, b) => {
      if (a.endsWith("/")) return -1;
      else if (b.endsWith("/")) return 1;

      return a.localeCompare(b);
    });
  }

  return format;
}
