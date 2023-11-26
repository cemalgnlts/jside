import { useEffect, useState } from "react";

import styles from "./styles.module.css";
import Button from "../Button";
import Icon from "../Icon";

/**
 *
 * @param {import("dockview").IPaneviewPanelProps} props
 */
function PaneHeader(props) {
  const [expanded, setExpanded] = useState(props.api.isExpanded);

  useEffect(() => {
    const disposable = props.api.onDidExpansionChange((ev) =>
      setExpanded(ev.isExpanded)
    );

    return () => disposable.dispose();
  }, []);

  const toggleState = (ev) => {
    ev.preventDefault();
    props.api.setExpanded(!expanded);
  };

  return (
    <div className={styles.paneHeader}>
      <a href="#" className={styles.toggler} onClick={toggleState}>
        <Icon name={expanded ? "expand_more" : "expand_less"} />
        <small>{props.title}</small>
      </a>
      <div className={styles.actions}>
        <Button
          title={props.params.isProjectExplorer ? "New project" : "New file"}
          icon
          small
          ghost
        >
          <Icon name={props.params.isProjectExplorer ? "add" : "note_add"} />
        </Button>

        {!props.params.isProjectExplorer && (
          <>
            <Button title="New folder" icon small ghost>
              <Icon name="create_new_folder" />
            </Button>
            <Button title="Collapse folders" icon small ghost>
              <Icon name="unfold_less" />
            </Button>
          </>
        )}

        <Button title="Refresh" icon small ghost>
          <Icon name="refresh" />
        </Button>
      </div>
    </div>
  );
}

export default PaneHeader;
