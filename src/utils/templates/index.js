import react from "./framework/react.js";

const templates = {
  react: react
};

function getTemplate(name, useTypeScript = false) {
  const prjName = `${name}${useTypeScript ? "-ts" : ""}`;
  return templates[prjName];
}

export { getTemplate };
