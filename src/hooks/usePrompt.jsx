import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { PromptDialog } from "../components/Dialog/Dialog";

const dialogContainer = document.getElementById("dialogContainer");

function usePrompt({ title, onEnter }) {
  const ui = useRef();

  useEffect(() => {
    ui.current = createPortal(
      <PromptDialog title={title} onEnter={onEnter} />,
      dialogContainer
    );
  }, []);

  const showPrompt = () => {
    if (ui.current)
      ui.current.containerInfo.firstElementChild.dataset.open = true;
  };

  const PromptUI = () => ui.current;

  return [showPrompt, PromptUI];
}

export default usePrompt;
