import { Suspense, lazy, useEffect, useState } from "react";
import Splash from "./components/Splash/Splash.jsx";
import LoadingIcon from "./components/Splash/LoadingIcon.jsx";

const GridView = lazy(() => import("./components/GridView/GridView.jsx"));

function App() {
  const [ready, setReady] = useState(false);
  const [showPermissionBtn, setShowPermissionBtn] = useState(false);

  const permissionGranted = () => {
    setReady(true);
  };

  useEffect(() => {
    const treeReady = () => setShowPermissionBtn(true);

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
