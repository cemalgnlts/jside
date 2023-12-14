import { useRef, useEffect } from "react";
import { attachPanels } from "../../libs/configuration/init";

import { Parts } from "vscode/vscode/vs/workbench/services/layout/browser/layoutService";

function Workbench({ ready }: { ready: boolean }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const explorerRef = useRef<HTMLDivElement>(null);
    const statusbarRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

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
                /** @ts-ignore */
                panel: Parts.EDITOR_PART,
                element: editorRef.current
            },
            {
                /** @ts-ignore */
                panel: Parts.SIDEBAR_PART,
                element: explorerRef.current
            },
            {
                /** @ts-ignore */
                panel: Parts.STATUSBAR_PART,
                element: statusbarRef.current
            },
            {
                /** @ts-ignore */
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

export default Workbench;