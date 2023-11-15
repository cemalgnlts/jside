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
