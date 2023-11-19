import { getFileIcon } from "../../libs/languageIcons";

import styles from "./styles.module.css";

function ProjectTemplate() {
  return (
    <section>
      <h1>Create New Project</h1>
      <p>Select a template for a quick start.</p>

      <div className="space-m"></div>

      <h2>Frameworks</h2>
      <div className={styles.container}>
        <figure className={styles.card}>
          {getFileIcon(".jsx")}
          <figcaption>
            <h4>React</h4>
            <small>JavaScript</small>
          </figcaption>
        </figure>

        <figure className={styles.card}>
          {getFileIcon(".tsx")}
          <figcaption>
            <h4>React</h4>
            <small>TypeScript</small>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default ProjectTemplate;
