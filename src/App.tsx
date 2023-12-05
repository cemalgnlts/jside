import { useEffect, useRef, useState } from "react";
import { init, attachPanels } from "./libs/editor/init";

import { Parts } from "vscode/vscode/vs/workbench/services/layout/browser/layoutService";

function App() {
  const [ready, setReady] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const explorerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setup = async () => {
      await init();
      setReady(true);
    };

    if (!ready) setup();
  }, []);

  useEffect(() => {
    if (!editorRef.current || !explorerRef.current || !ready) return;

    attachPanels([
      {
        panel: Parts.EDITOR_PART,
        element: editorRef.current
      },
      {
        panel: Parts.SIDEBAR_PART,
        element: explorerRef.current
      }
    ]);
  }, [ready]);

  return (
    <>
      <div className="editor" ref={editorRef}></div>
      <div className="explorer" ref={explorerRef}></div>
    </>
  );
}

export default App;
