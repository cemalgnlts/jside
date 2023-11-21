import { Suspense, lazy, useEffect, useState } from "react";
import Splash from "./components/Splash/Splash.jsx";
import { useSetAtom } from "jotai";

import { $updateProjectTree } from "./state.js";

const GridView = lazy(() => import("./components/GridView/GridView.jsx"));

function App() {
  const [ready, setReady] = useState(false);
  const [showPermissionBtn, setShowPermissionBtn] = useState(false);
  const refreshProjectTree = useSetAtom($updateProjectTree);

  const permissionGranted = () => {
    refreshProjectTree();
    setReady(true);
  };

  useEffect(() => {
    const treeReady = async () => {
      // Preload editor font.
      await document.fonts.load("1rem Fira Code");

      setShowPermissionBtn(true);
    };

    document.addEventListener("grid-ready", treeReady, { once: true });
    return () => document.removeEventListener("grid-ready", treeReady);
  }, []);

  return (
    <>
      {!ready && (
        <Splash
          showPermissionBtn={showPermissionBtn}
          onGranted={permissionGranted}
        />
      )}
      <Suspense fallback={<FallbackNotifier />}>
        <GridView />
      </Suspense>
    </>
  );
}

function FallbackNotifier() {
  useEffect(() => {
    return () => document.dispatchEvent(new Event("grid-ready"));
  }, []);
}

export default App;
