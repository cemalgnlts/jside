import { useEffect, useRef } from "react";
import { monaco, defaultOptions } from "./monacoLoader.js";
import { useAtomValue } from "jotai";
import { $fileSystem } from "../../state.js";

/** @param {import("dockview").ISplitviewPanelProps} props*/
function Editor(props) {
  const editorContainerRef = useRef(null);
  const fileSystem = useAtomValue($fileSystem);

  useEffect(() => {
    /** @type {monaco.editor.IStandaloneCodeEditor} */
    let state = null;

    const getContent = async (path) => {
      const content = await fileSystem.readFile(path, "utf8");
      state.setValue(content);
    };

    /** @type {import("monaco-editor").editor.IEditorConstructionOptions} */
    const options = {
      ...defaultOptions,
      readOnly: true
    };

    state = monaco.editor.create(editorContainerRef.current, options);
    getContent(props.api.id);

    return () => state.dispose();
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
