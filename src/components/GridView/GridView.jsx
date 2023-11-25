import { memo } from "react";
import { GridviewReact } from "dockview";
import { Orientation, LayoutPriority } from "dockview";

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
            id: "header",
            component: "header",
            minimumHeight: 25,
            maximumHeight: 25
          }
        },
        {
          type: "branch",
          data: [
            {
              type: "leaf",
              size: 22,
              data: {
                id: "sidebar",
                component: "sidebar",
                minimumWidth: 200
              }
            },
            {
              type: "leaf",
              size: 90,
              data: {
                id: "main",
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
            id: "footer",
            component: "footer",
            minimumHeight: 25,
            maximumHeight: 25
          }
        }
      ]
    },
    width: 100,
    height: 100,
    orientation: Orientation.VERTICAL
  }
};

function GridView() {
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

export default memo(GridView);
