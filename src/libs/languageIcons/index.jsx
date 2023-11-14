import icons from "./icons.json";

function getFileIcon(name) {
  const ext = name.slice(name.lastIndexOf(".") + 1);
  const style = icons[ext];

  if (style) return <FileIcon d={style[0]} fill={`#${style[1]}`} />;

  return null;
}

function FileIcon({ d, fill }) {
  return (
    <svg viewBox="0 0 24 24" className="icon">
      <path d={d} fill={fill} />
    </svg>
  );
}

export { getFileIcon };
