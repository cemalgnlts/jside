import { useEffect, useState, lazy, Suspense } from "react";
import { init } from "./workspace/init.ts";
import Splash from "./components/splash/Splash.tsx";

import { freeTask, TaskType, waitTailComplete } from "./utils/prepareTaskTail.ts";

const Workbench = lazy(() => import("./components/workbench/Workbench.tsx"));

function App() {
  const [servicesReady, setServicesReady] = useState<boolean>(false);
  const [appReady, setAppReady] = useState<boolean>(false);

  useEffect(() => {
    const setup = async () => {
      await init();
      setServicesReady(true);

      freeTask(TaskType.SERVICE);
    };

    const preload = async () => {
      await document.fonts.load("1rem Fira Code");

      freeTask(TaskType.PRELOAD);
    };

    const trackIsAppReady = async () => {
      await waitTailComplete();

      setAppReady(true);
    };

    if (!servicesReady) {
      setup();
      preload();
      trackIsAppReady();
    }
  }, []);

  return (
    <>
      <Suspense>
        {!appReady && <Splash />}
        <Workbench servicesReady={servicesReady} />
      </Suspense>
    </>
  );
}

export default App;
