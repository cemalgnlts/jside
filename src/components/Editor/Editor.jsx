import { useEffect, useRef } from "react";
import { monaco, defaultOptions } from "./monacoLoader.js";
import { useAtomValue } from "jotai";
import { fileSystem } from "../../state.js";
import { getCodeLanguageFromName } from "../../utils/index.js";

/** @param {import("dockview").ISplitviewPanelProps} props*/
function Editor(props) {
  const editorContainerRef = useRef(null);

  useEffect(() => {
    /** @type {monaco.editor.IStandaloneCodeEditor} */
    let editor = null;
    /** @type {monaco.editor.IEditorConstructionOptions} */
    const options = { ...defaultOptions };
    /** @type {monaco.editor.ICodeEditorViewState} */
    let viewState = null;

    const getContent = async (path) => {
      const uri = monaco.Uri.file(path);
      let model = monaco.editor.getModel(uri);

      if (!model) {
        const content = await fileSystem.readFile(path, "utf8");
        const language = getCodeLanguageFromName(path);
        model = monaco.editor.createModel(content, language, uri);
      }

      options.model = model;
      editor = monaco.editor.create(editorContainerRef.current, options);
      editor.focus();
    };

    const activeListener = props.api.onDidActiveChange((ev) => {
      if (!editor) return;

      if (!ev.isActive) viewState = editor.saveViewState();
      else {
        editor.restoreViewState(viewState);
        requestAnimationFrame(() => editor.focus());
      }
    });

    getContent(props.params.path);

    return () => {
      if (editor) editor.dispose();

      activeListener.dispose();
    };
  }, []);

  return (
    <div
      ref={editorContainerRef}
      style={{
        width: "100%",
        height:
          "calc(100% - var(--dv-tabs-and-actions-container-height) + 10px)",
        position: "absolute",
        zIndex: 1
      }}
    ></div>
  );
}

export default Editor;
