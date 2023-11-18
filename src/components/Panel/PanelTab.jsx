import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";

function PanelTab(props) {
  const close = () => {
    props.api.panel.api.close();
  };
  
  return (
    <div className="panel-tab">
      {getFileIcon(props.api.title) || <Icon name="insert_drive_file" />}
      <p>{props.api.title}</p>
      <button onClick={close} className="btn btn-icon btn-ghost">
        <Icon name="close" />
      </button>
    </div>
  );
}

export { PanelTab };
