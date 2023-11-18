import { Suspense, lazy, useEffect, useState } from "react";
import Splash from "./components/Splash/Splash.jsx";
import LoadingIcon from "./components/Splash/LoadingIcon.jsx";

const GridView = lazy(() => import("./components/GridView/GridView.jsx"));

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const treeReady = () => {
      setReady(true);
    };

    // Called from LoadingCircle.
    document.addEventListener("tree-ready", treeReady);
  }, []);

  return (
    <>
      {!ready && <Splash />}
      <Suspense fallback={<LoadingIcon />}>
        <GridView />
      </Suspense>
    </>
  );
}

export default App;
