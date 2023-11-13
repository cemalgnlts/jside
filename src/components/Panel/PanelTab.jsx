import Icon from "@components/Icon";

function PanelTab(props) {
  return (
    <div className="panel-tab">
      <Icon name="insert_drive_file" />
      <p>{props.api.title}</p>
      <Icon name="close" />
    </div>
  );
}

export { PanelTab };
