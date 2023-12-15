import { useRef, useEffect } from "react";
import { attachPanels } from "../../workspace/init.ts";

import { Parts } from "vscode/vscode/vs/workbench/services/layout/browser/layoutService";

interface props {
    servicesReady: boolean;
    setAppReady: React.Dispatch<React.SetStateAction<boolean>>;
}

function Workbench({ servicesReady, setAppReady }: props) {
    const editorRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const statusbarRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (
            !editorRef.current ||
            !sidebarRef.current ||
            !statusbarRef.current ||
            !panelRef.current ||
            !servicesReady
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
                element: sidebarRef.current
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

        setAppReady(true);
    }, [servicesReady]);

    return (
        <>
            <div className="editor" ref={editorRef}></div>
            <div className="sidebar" ref={sidebarRef}></div>
            <div className="panel" ref={panelRef}></div>
            <div className="statusbar" ref={statusbarRef}></div>
        </>
    );
}

export default Workbench;