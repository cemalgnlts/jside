import JSTextIcon from "./JSTextIcon";
import LoadingIcon from "./LoadingIcon";
import SquircleIcon from "./SquircleIcon";
import Icon from "../Icon";

import { FileSystem } from "../../libs/FileSystem";
import Button from "../Button";

import { explainFSError } from "../../utils/Utils";

import styles from "./styles.module.css";

function Splash({ showPermissionBtn, onGranted }) {
  const requestPermission = () => {
    FileSystem.requestPermission()
      .then(() => onGranted())
      .catch((err) => alert(`Error caused: ${explainFSError(err)}`));
  };

  return (
    <div className={styles.splash}>
      <div className={styles.appIcon}>
        <SquircleIcon />
        <JSTextIcon />

        <p className={styles.title}>IDE</p>
      </div>

      {showPermissionBtn && (
        <Button style={{ marginTop: "3em" }} onClick={requestPermission}>
          <Icon name="folder" />
          Request Permission
        </Button>
      )}

      {!showPermissionBtn && <LoadingIcon className={styles.loading} />}
    </div>
  );
}

export default Splash;
