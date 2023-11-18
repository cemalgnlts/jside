import { Suspense, lazy } from "react";
import Splash from "./components/Splash/Splash.jsx";

const GridView = lazy(() => import("./components/GridView/GridView.jsx"));

function App() {
  return (
    <>
      <Suspense fallback={<Splash />}>
        <GridView />
      </Suspense>
    </>
  );
}

export default App;
