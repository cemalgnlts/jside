import { monaco } from "./monacoLoader";
import { FileSystem } from "../../libs/FileSystem";
import { getCodeLanguageFromName } from "../../utils/Utils";

/** @type {monaco.IDisposable[]} */
const disposables = [];

export async function getOrCreateModel(path) {
  const uri = monaco.Uri.file(path);
  let model = monaco.editor.getModel(uri);

  if (!model) {
    const content = await FileSystem.get().readFile(path, "utf8");
    const language = getCodeLanguageFromName(path);
    model = monaco.editor.createModel(content, language, uri);

    model.updateOptions({
      insertSpaces: false,
      tabSize: 2
    });
  }

  return model;
}

/** @param {monaco.editor.IStandaloneCodeEditor} editor  */
export async function registerEditor(editor) {
  const saveAct = editor.addAction({
    id: "save",
    label: "Save",
    contextMenuGroupId: "modification",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    async run(editor) {
      const model = editor.getModel();
      const path = model.uri.fsPath;
      const value = model.getValue();

      await FileSystem.get()
        .writeFile(path, value)
        .catch((err) => {
          console.error(err);
          alert(err.toString());
        });
    }
  });

  const onChange = editor.onDidChangeModelContent((ev) => console.log(ev));

  disposables.push(saveAct, onChange);

  editor.focus();
}

export async function disposeEditor(editor) {
  disposables.forEach((disposable) => disposable.dispose());

  editor.dispose();
}
