import { registerExtension, IExtensionManifest, ExtensionHostKind } from "vscode/extensions";

const manifest: IExtensionManifest = {
  name: "one-dark",
  version: "3.16.2",
  publisher: "zhuangtongfa",
  engines: {
    vscode: "*"
  },
  contributes: {
    themes: [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore id type problem
      {
        label: "One Dark",
        path: "/one-dark.json",
        uiTheme: "vs-dark"
      }
    ]
  }
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

registerFileUrl("/one-dark.json", new URL("./one-dark.json", import.meta.url).toString());
