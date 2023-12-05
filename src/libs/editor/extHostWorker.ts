import type { WorkerConfig } from "@codingame/monaco-vscode-extensions-service-override";

export class Worker {
  constructor(public url: string | URL, public options?: WorkerOptions) {}
}

const fakeWorker = new Worker(
  new URL("vscode/workers/extensionHost.worker", import.meta.url),
  { type: "module" }
);

const workerConfig: WorkerConfig = {
  url: fakeWorker.url.toString(),
  options: fakeWorker.options
};

export default workerConfig;
