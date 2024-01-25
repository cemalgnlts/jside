const templates = import.meta.glob("./sources/*.js");

async function getTemplate(name: string): Promise<Map<string, string>> {
  const tempPath = `./sources/${name}.js`;

  if (!tempPath) throw Error("Template not found!");

  const module = (await templates[tempPath]()) as { files: Map<string, string> };

  return module.files;
}

import templateMeta from "./meta.json";

export { getTemplate, templateMeta };
