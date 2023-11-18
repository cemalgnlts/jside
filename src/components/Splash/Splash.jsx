import JSTextIcon from "./JSTextIcon";
import SquircleIcon from "./SquircleIcon";

import styles from "./styles.module.css";

function Splash() {
  return (
    <div className={styles.splash}>
      <div className={styles.appIcon}>
        <SquircleIcon />
        <JSTextIcon />
        <p className={styles.title}>IDE</p>
      </div>
    </div>
  );
}

export default Splash;
