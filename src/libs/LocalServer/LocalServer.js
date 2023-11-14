import FileSystem from "./FileSystem";
import BuildWorker from "./worker?worker";

/**
 * @typedef {{
 * baseUrl: string
 * }} LocalServerOptions
 */

class LocalServer extends EventTarget {
  /** @type {Worker} */
  worker = null;
  /** @type {ServiceWorkerRegistration} */
  serviceWorker = null;
  previewUrl = "";
  fs = new FileSystem();

  /**
   * @param {LocalServerOptions} options
   */
  constructor() {
    super();

    this.previewUrl = `${location.origin}/preview`;

    this.worker = new BuildWorker();
    this.worker.onmessage = this.#onMessage.bind(this);
  }

  async #onMessage(ev) {
    const { type, data } = ev.data;

    switch (type) {
      case "ready": {
        this.serviceWorker = await navigator.serviceWorker.register(
          "/serviceWorker.js",
          { scope: this.previewUrl }
        );
        break;
      }
      case "result": {
        break;
      }
      case "modified": {
        break;
      }
      case "error": {
      }
    }

    const customEvent = new CustomEvent(type, { detail: data });
    this.dispatchEvent(customEvent);
  }

  run() {
    this.worker.postMessage({ type: "init" });
  }

  build() {
    this.worker.postMessage({ type: "build" });
  }
}
