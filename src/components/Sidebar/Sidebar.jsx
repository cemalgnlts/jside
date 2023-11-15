import FileTree from "@components/FileTree";

import { useAtomValue } from "jotai";
import { $fileTree } from "../../state";

const items = {
  root: {
    index: "root",
    isFolder: true,
    children: ["child2", "child1"],
    title: "folder"
  },
  child2: {
    index: "child2",
    isFolder: true,
    children: ["child3"],
    title: "assets"
  },
  child1: {
    index: "child1",
    children: [],
    title: "main.js"
  },
  child3: {
    index: "child3",
    children: [],
    title: "base.css"
  }
};

function Sidebar() {
  const files = useAtomValue($fileTree);

  return (
    <aside className="rct-dark sidebar">
      <FileTree items={files} />
    </aside>
  );
}

export default Sidebar;
