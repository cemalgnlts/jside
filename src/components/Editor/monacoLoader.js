import * as monaco from "monaco-editor/esm/vs/editor/editor.main.js";

// Workers.
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

/** @type {monaco.editor.IEditorConstructionOptions} */
const defaultOptions = {
  automaticLayout: true,
  scrollBeyondLastLine: false,
  fontFamily: "Fira Code",
  fontLigatures: false,
  fontSize: 16,

  minimap: {
    enabled: false
  },
  padding: {
    top: 10
  }
};

self.MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case "json":
        return new jsonWorker();
      case "css":
      case "scss":
      case "less":
        return new cssWorker();
      case "html":
      case "handlebars":
      case "razor":
        return new htmlWorker();
      case "javascript":
      case "typescript":
        return new tsWorker();
      default:
        return new editorWorker();
    }
  }
};

monaco.editor.setTheme("vs-dark");
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

monaco.languages.html.htmlDefaults.setOptions({
  format: {
    indentInnerHtml: true,
    tabSize: 2
  }
});

export { monaco, defaultOptions };
