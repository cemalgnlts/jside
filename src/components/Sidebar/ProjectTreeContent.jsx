import { useAtomValue } from "jotai";

import ProjectTree from "../ProjectTree";

import Button from "@components/Button";
import Icon from "../Icon";

import { $dockViewApi } from "../../state";

import styles from "./styles.module.css";

function ProjectsTreeContent() {
  /** @type {import("dockview").DockviewApi} */
  const dockViewApi = useAtomValue($dockViewApi);

  const newProject = () => {
    const panel = dockViewApi.getPanel("newProject");

    if (panel) {
      if (!panel.isActive) panel.api.setActive();

      return;
    }

    dockViewApi.addPanel({
      id: "newProject",
      component: "projectTemplates",
      title: "New Project",
      props: {
        noIcon: true
      }
    });
  };

  return (
    <>
      <div className={styles.header}>
        <span className={styles.name}>Projects</span>
        <div className={styles.actions}>
          <Button title="New project" onClick={newProject} icon small ghost>
            <Icon name="add" />
          </Button>
          <Button title="Refresh" icon small ghost>
            <Icon name="refresh" />
          </Button>
        </div>
      </div>
      <div className="rct-dark">
        <ProjectTree />
      </div>
    </>
  );
}

export default ProjectsTreeContent;
