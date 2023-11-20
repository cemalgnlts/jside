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

function getTemplate(index, projectName) {
  const [tmpId, cntId] = index.split(",");
  const files = templates[tmpId].content[cntId].files;
  let absFiles = new Map();

  for (const [path, text] of Object.entries(files)) {
    absFiles.set(`/projects/${projectName}/${path}`, text);
  }

  return absFiles;
}

export { templates, getTemplate };
