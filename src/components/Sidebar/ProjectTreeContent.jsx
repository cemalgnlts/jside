import { useAtomValue, useSetAtom } from "jotai";

import ProjectTree from "../ProjectTree";

import Button from "@components/Button";
import Icon from "../Icon";

import { $dockViewApi, $updateProjectTree } from "../../state";

import styles from "./styles.module.css";

function ProjectsTreeContent() {
  const refreshProjectTree = useSetAtom($updateProjectTree);

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

  const updateProjectTree = () => {
    refreshProjectTree();
  };

  return (
    <>
      <div className={styles.header}>
        <span className={styles.name}>Projects</span>
        <div className={styles.actions}>
          <Button title="New project" onClick={newProject} icon small ghost>
            <Icon name="add" />
          </Button>
          <Button title="Refresh" onClick={updateProjectTree} icon small ghost>
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
