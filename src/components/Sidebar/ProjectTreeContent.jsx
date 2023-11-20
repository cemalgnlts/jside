import { useAtomValue, useSetAtom } from "jotai";

import ProjectTree from "../ProjectTree";

import Button from "@components/Button";
import Icon from "../Icon";

import { $dockViewApi, $projectTree, $updateProjectTree } from "../../state";

import styles from "./styles.module.css";
import { useEffect } from "react";

function ProjectsTreeContent() {
  const projectTree = useAtomValue($projectTree);
  const refreshProjectTree = useSetAtom($updateProjectTree);

  /** @type {import("dockview").DockviewApi} */
  const dockViewApi = useAtomValue($dockViewApi);

  useEffect(() => {
    refreshProjectTree();
  }, []);

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
        <ProjectTree items={projectTree} />
      </div>
    </>
  );
}

export default ProjectsTreeContent;
