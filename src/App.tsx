import { useEffect, useState, lazy, Suspense } from "react";
import { init } from "./workspace/init.ts";
import Splash from "./components/splash/Splash.tsx";

const Workbench = lazy(() => import("./components/workbench/Workbench.tsx"));

function App() {
  const [servicesReady, setServicesReady] = useState<boolean>(false);
  const [appReady, setAppReady] = useState<boolean>(false);

  useEffect(() => {
    const setup = async () => {
      await init();
      setServicesReady(true);
    };

    if (!servicesReady) setup();
  }, []);

  return (
    <>
      <Suspense>
        { !appReady && <Splash /> }
        <Workbench setAppReady={setAppReady} servicesReady={servicesReady} />
      </Suspense>
    </>
  );
}

export default App;
