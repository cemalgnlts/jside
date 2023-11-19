import { useEffect, useRef } from "react";
import styles from "./styles.module.css";

function PromptDialog({ title, onEnter }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const close = () => {
      dialogRef.current.querySelector("input").value = "";
      dialogRef.current.dataset.open = false;
    };

    const onClick = (ev) => {
      if (ev.target === dialogRef.current) {
        close();
      }
    };

    const onKeyDown = (ev) => {
      if (ev.key === "Escape") close();
      else if (ev.key === "Enter") {
        const value = ev.target.value.trim();

        if (onEnter && value.length > 1) onEnter();
        close();
      }
    };

    document.body.addEventListener("click", onClick);
    document.body.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.removeEventListener("click", onClick);
      document.body.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className={styles.dialog} ref={dialogRef}>
      <div className={styles.dialogContent}>
        {title && <h6 className={styles.dialogTitle}>{title}</h6>}
        <input className="text-field" autoFocus />
      </div>
    </div>
  );
}

export { PromptDialog };
