import Path from "../libs/FileSystem/Path";

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

export async function formatProjectFilesAsTree(paths, currentDir) {
  const format = {
    root: {
      index: "root",
      isFolder: true,
      name: currentDir.slice(1),
      children: []
    }
  };

  for (const path of paths) {
    if (path === `${currentDir}/`) continue;

    const isFolder = path.endsWith("/");

    const { dir: parent, base } = Path.parse(isFolder ? path.slice(0, -1) : path);

    format[path] = {
      index: path,
      name: base,
      parent,
      isFolder
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
