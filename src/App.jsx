import { GridviewReact, Orientation, LayoutPriority } from "dockview";
import Header from "@components/Header";
import Footer from "@components/Footer";
import Sidebar from "@components/Sidebar";
import DockView from "@components/DockView";

const gridComponents = {
  header: Header,
  sidebar: Sidebar,
  main: DockView,
  footer: Footer
};

/** @type {import("dockview").SerializedGridviewComponent} */
const serializedGridView = {
  grid: {
    root: {
      type: "branch",
      data: [
        {
          type: "leaf",
          data: {
            id: "header-id",
            component: "header",
            minimumHeight: 20,
            maximumHeight: 20
          }
        },
        {
          type: "branch",
          data: [
            {
              type: "leaf",
              size: 10,
              data: {
                id: "sidebar-id",
                component: "sidebar",
                minimumWidth: 250
              }
            },
            {
              type: "leaf",
              size: 90,
              data: {
                id: "main-id",
                component: "main",
                minimumWidth: 1000,
                priority: LayoutPriority.High
              }
            }
          ]
        },
        {
          type: "leaf",
          data: {
            id: "footer-id",
            component: "footer",
            minimumHeight: 20,
            maximumHeight: 20
          }
        }
      ]
    },
    width: 100,
    height: 100,
    orientation: Orientation.VERTICAL
  }
};

function App() {
  /** @param {import("dockview").GridviewReadyEvent} ev */
  const onReady = (ev) => {
    ev.api.fromJSON(serializedGridView);
  };

  return (
    <GridviewReact
      components={gridComponents}
      onReady={onReady}
      className="dockview-theme-custom"
    />
  );
}

export default App;
