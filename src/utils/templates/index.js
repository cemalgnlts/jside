import react from "./framework/react.js";

const templates = [
  {
    title: "Frameworks",
    content: [
      {
        title: "React",
        icon: "jsx",
        files: react
      },
      {
        title: "React",
        icon: "tsx",
        files: react
      }
    ]
  }
];

function getTemplate(index) {
  const [tmpId, cntId] = index.split(",");

  return templates[tmpId].content[cntId].files;
}

export { templates, getTemplate };
