import { useEffect, useState } from "react";
import { init } from "./workspace/init.ts";
import Workbench from "./components/workbench/Workbench.tsx";

function App() {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const setup = async () => {
      await init();
      setReady(true);
    };

    if (!ready) setup();
  }, []);

  return (
    <>
      <Workbench ready={ready} />
    </>
  );
}

export default App;
