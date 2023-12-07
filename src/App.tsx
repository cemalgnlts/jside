import { useEffect, useRef, useState } from "react";
import { init, attachPanels } from "./libs/configuration/init.ts";

import { Parts } from "vscode/vscode/vs/workbench/services/layout/browser/layoutService";

function App() {
  const [ready, setReady] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const explorerRef = useRef<HTMLDivElement>(null);
  const statusbarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setup = async () => {
      await init();
      setReady(true);
    };

    if (!ready) setup();
  }, []);

  useEffect(() => {
    if (
      !editorRef.current ||
      !explorerRef.current ||
      !statusbarRef.current ||
      !panelRef.current ||
      !ready
    )
      return;

    attachPanels([
      {
        panel: Parts.EDITOR_PART,
        element: editorRef.current
      },
      {
        panel: Parts.SIDEBAR_PART,
        element: explorerRef.current
      },
      {
        panel: Parts.STATUSBAR_PART,
        element: statusbarRef.current
      },
      {
        panel: Parts.PANEL_PART,
        element: panelRef.current
      }
    ]);
  }, [ready]);

  return (
    <>
      <div className="editor" ref={editorRef}></div>
      <div className="explorer" ref={explorerRef}></div>
      <div className="panel" ref={panelRef}></div>
      <div className="statusbar" ref={statusbarRef}></div>
    </>
  );
}

export default App;
