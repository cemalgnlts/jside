import { useRef } from "react";
import usePrompt from "../../hooks/usePrompt";
import { getFileIcon } from "../../libs/languageIcons";
import { getTemplate, templates } from "../../utils/templates";

import styles from "./styles.module.css";
import { FileSystem } from "../../libs/FileSystem";

function ProjectTemplate(props) {
  const tmpId = useRef(null);
  const [showPrompt, PromptUI] = usePrompt({
    title: "Project name",
    onEnter: onPromptEnter
  });

  async function onPromptEnter(val) {
    const files = getTemplate(tmpId.current, val);

    await FileSystem.get().initFiles(Object.fromEntries(files));

    props.api.panel.api.close();
  }

  const onSelect = (ev) => {
    tmpId.current = ev.target.dataset.id;
    showPrompt();
  };

  return (
    <section>
      <h1>Create New Project</h1>
      <p>Select a template for a quick start.</p>

      <div className="space-m"></div>

      {templates.map((template, idx) => {
        return (
          <div key={template.title}>
            <h2>{template.title}</h2>
            <div className="space-m"></div>
            <div className={styles.container} onClick={onSelect}>
              {template.content.map((cnt, cntIdx) => (
                <Card
                  key={`${cnt.title}${cnt.icon}`}
                  id={`${idx},${cntIdx}`}
                  {...cnt}
                />
              ))}
            </div>
          </div>
        );
      })}

      <PromptUI />
    </section>
  );
}

function Card({ title, icon, id }) {
  return (
    <figure className={styles.card} data-id={id}>
      {getFileIcon(icon)}
      <figcaption>
        <h4>{title}</h4>
        <small>{icon.startsWith("js") ? "JavaScript" : "TypeScript"}</small>
      </figcaption>
    </figure>
  );
}

export default ProjectTemplate;
