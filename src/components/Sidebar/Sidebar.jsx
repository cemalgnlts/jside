import { Suspense, lazy } from "react";
import styles from "./styles.module.css";

const FileTreeContent = lazy(() => import("./FileTreeContent.jsx"));
const ProjectTreeContent = lazy(() => import("./ProjectTreeContent.jsx"));

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Suspense fallback={<p>Loading...</p>}>
        <ProjectTreeContent />
      </Suspense>
    </aside>
  );
}

export default Sidebar;
