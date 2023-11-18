import JSTextIcon from "./JSTextIcon";
import LoadingIcon from "./LoadingIcon";
import SquircleIcon from "./SquircleIcon";

import styles from "./styles.module.css";

function Splash() {
  return (
    <div className={styles.splash}>
      <div className={styles.appIcon}>
        <SquircleIcon />
        <JSTextIcon />
      </div>

      <p className={styles.title}>IDE</p>

      <LoadingIcon className={styles.loading} />
    </div>
  );
}

export default Splash;
