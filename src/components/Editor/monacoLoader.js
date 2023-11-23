import * as monaco from "monaco-editor/esm/vs/editor/editor.main.js";

// Workers.
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { $dockViewApi, store } from "../../state";
import Path from "../../libs/FileSystem/Path";

/** @type {monaco.editor.IEditorConstructionOptions} */
const defaultOptions = {
  cursorSmoothCaretAnimation: "off",
  scrollBeyondLastLine: false,
  fontFamily: "Fira Code",
  fontLigatures: false,
  automaticLayout: true,
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

monaco.languages.html.htmlDefaults.setOptions({
  format: {
    indentInnerHtml: true,
    tabSize: 2
  }
});

monaco.editor.registerEditorOpener({
  openCodeEditor(_, resource) {
    const dockViewApi = store.get($dockViewApi);
    const panel = dockViewApi.getPanel(resource.fsPath);

    if (panel) {
      if (!panel.isActive) panel.api.setActive();

      return true;
    }

    dockViewApi.addPanel({
      id: resource.fsPath,
      component: "editor",
      title: Path.basename(resource.fsPath),
      params: {
        path: resource.fsPath
      }
    });

    return true;
  }
});

monaco.editor.defineTheme("dark", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#1c1b1a"
  }
});

monaco.editor.setTheme("dark");

monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

/** @type {monaco.languages.typescript.CompilerOptions} */
const jsCompilerOptions = {
  ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions(),
  typeRoots: ["/types/"],
  noSemanticValidation: false,
  noSyntaxValidation: false
};

monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
  jsCompilerOptions
);
monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
  jsCompilerOptions
);

export { monaco, defaultOptions };
