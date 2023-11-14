import Icon from "@components/Icon";
import { getFileIcon } from "../../libs/languageIcons";

function PanelTab(props) {
  return (
    <div className="panel-tab">
      {getFileIcon(props.api.title) || <Icon name="insert_drive_file" />}
      <p>{props.api.title}</p>
      <Icon name="close" />
    </div>
  );
}

export { PanelTab };
