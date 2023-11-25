import { useEffect, useRef } from "react";
import { monaco, defaultOptions } from "./monacoLoader.js";
import { disposeEditor, getOrCreateModel, registerEditor } from "./utils.js";

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
      options.model = await getOrCreateModel(path);

      editor = monaco.editor.create(editorContainerRef.current, options);
      registerEditor(editor, props.api);
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
      if (editor) disposeEditor(editor);

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
