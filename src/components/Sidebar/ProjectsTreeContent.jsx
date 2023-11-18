import ProjectsTree from "../ProjectsTree";

import Button from "@components/Button";
import Icon from "../Icon";

import styles from "./styles.module.css";

function ProjectsTreeContent() {
  return (
    <>
      <div className={styles.header}>
        <span className={styles.name}>Projects</span>
        <div className={styles.actions}>
          <Button title="New project" icon small ghost>
            <Icon name="add" />
          </Button>
          <Button title="Refresh" icon small ghost>
            <Icon name="refresh" />
          </Button>
        </div>
      </div>
      <div className="rct-dark">
        <ProjectsTree />
      </div>
    </>
  );
}

export default ProjectsTreeContent;