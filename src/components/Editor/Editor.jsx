import { useEffect, useRef } from "react";
import { monaco, defaultOptions } from "./monacoLoader.js";
import { useAtomValue } from "jotai";
import { $fileSystem } from "../../state.js";
import { getCodeLanguageFromName } from "../../utils/index.js";

/** @param {import("dockview").ISplitviewPanelProps} props*/
function Editor(props) {
  const editorContainerRef = useRef(null);
  const fileSystem = useAtomValue($fileSystem);

  useEffect(() => {
    /** @type {monaco.editor.IStandaloneCodeEditor} */
    let editor = null;
    /** @type {import("monaco-editor").editor.IEditorConstructionOptions} */
    const options = { ...defaultOptions };

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
    };

    getContent(props.api.id);

    return () => {
      if (editor) editor.dispose();
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
