import { Suspense, lazy } from "react";
import styles from "./styles.module.css";

const FileTreeContent = lazy(() => import("./FileTreeContent.jsx"));
const ProjectsTreeContent = lazy(() => import("./ProjectsTreeContent.jsx"));

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Suspense fallback={<p>Loading...</p>}>
        <ProjectsTreeContent />
      </Suspense>
    </aside>
  );
}

export default Sidebar;
