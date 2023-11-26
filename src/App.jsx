import { Suspense, lazy } from "react";

const GridView = lazy(() => import("./components/GridView/GridView.jsx"));

function App() {
  return (
    <Suspense>
      <GridView />
    </Suspense>
  );
}

export default App;
