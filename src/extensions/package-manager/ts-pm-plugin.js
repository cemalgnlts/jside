/**
 * @typedef {import("typescript/lib/tsserverlibrary")} TS
 */

/**
 * @implements {import("typescript/lib/tsserverlibrary").server.PluginModule}
 */
class Plugin {
  /** @type {TS} */
  ts;
  logger;

  constructor(ts) {
    this.ts = ts;
  }

  /** @param {import("typescript/lib/tsserverlibrary").server.PluginCreateInfo} info */
  create(info) {
    const { languageService, languageServiceHost, project } = info;
    this.logger = project.projectService.logger;

    // rewrite TS module resolution
    // const resolveModuleNameLiterals = languageServiceHost.resolveModuleNameLiterals?.bind(languageServiceHost);

    // if (resolveModuleNameLiterals) {
    //   const resolvedModule = (resolvedFileName, extension) => {
    //     const resolvedUsingTsExtension = extension === ".d.ts";
    //     return {
    //       resolvedModule: {
    //         resolvedFileName,
    //         extension,
    //         resolvedUsingTsExtension
    //       }
    //     };
    //   };

    //   languageServiceHost.resolveModuleNameLiterals = (literals, containingFile, ...rest) => {
    //     const resolvedModules = resolveModuleNameLiterals(literals, containingFile, ...rest);

    //     console.log(resolvedModules);
    //   };
    // }

    globalThis.info = info;
    console.log(this);

    console.log("Ready!");

    return languageService;
  }

  onConfigurationChanged(config) {
    console.log(config);
  }
}

/**
 * @param {{ typescript: import("typescript/lib/tsserverlibrary") }} modules
 */
function init(modules) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ts = modules.typescript;
  return new Plugin(ts);

  // /**
  //  *
  //  * @param {ts.server.PluginCreateInfo} info
  //  */
  // function create(info) {
  //   // Set up decorator object
  //   const proxy = Object.create(null);

  //   for (let k of Object.keys(info.languageService)) {
  //     const x = info.languageService[k];
  //     // @ts-expect-error - JS runtime trickery which is tricky to type tersely
  //     proxy[k] = (...args) => x.apply(info.languageService, args);
  //   }

  //   console.log("Hello from TS Server Plugin!");
  //   info.project.projectService.logger.info("Hello from TS Server Plugin!");

  //   return proxy;
  // }

  // return { create };
}

export default init;
