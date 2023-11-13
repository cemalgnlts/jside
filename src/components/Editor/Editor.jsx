import { useEffect, useRef } from "react";
import { monaco } from "./monacoLoader.js";

function Editor() {
  const editorContainerRef = useRef(null);

  useEffect(() => {
    /** @type {import("monaco-editor").editor.IEditorConstructionOptions} */
    const properties = {
      value: 'function hello() {\n\tconsole.log("Hello world!");\n}',
      language: "javascript",
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

    const state = monaco.editor.create(editorContainerRef.current, properties);
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
