import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";

function PanelTab(props) {
  const close = () => {
    props.api.panel.api.close();
  };

  return (
    <div
      className={`panel-tab${
        props.params.modified ? " panel-tab-modified" : ""
      }`}
    >
      {props.params.noIcon !== true &&
        (getFileIcon(props.api.title) || <Icon name="insert_drive_file" />)}
      <small className="panel-tab-title">{props.api.title}</small>
      <button onClick={close} className="btn btn-icon btn-ghost">
        <Icon name="close" />
      </button>
    </div>
  );
}

export { PanelTab };
