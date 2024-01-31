import type { window, StatusBarAlignment, StatusBarItem } from "vscode";

class StatusBarItemController {
  statusBarItem: StatusBarItem;
  icon = "";
  text = "";
  prevIcon = "zap";
  isLiveModeActive = false;

  constructor(win: typeof window, alignment: StatusBarAlignment, priority?: number) {
    this.statusBarItem = win.createStatusBarItem(alignment, priority);
  }

  init() {
    this.icon = "sync~spin";
    this.text = "Loading...";
    this.statusBarItem.tooltip = "Show commands";
    this.statusBarItem.name = "Bundler";
    this.statusBarItem.command = {
      title: "Commands",
      command: "workbench.action.quickOpen",
      arguments: [">Bundler: "]
    };
    this.statusBarItem.show();

    this.update();
  }

  enableLiveMode() {
    this.icon = "check";
    this.isLiveModeActive = true;

    this.update();
  }

  disableLiveMode() {
    this.icon = "zap";
    this.isLiveModeActive = false;

    this.update();
  }

  active() {
    this.text = "Bundler";
    this.icon = this.isLiveModeActive ? "check" : "zap";

    this.update();
  }

  error() {
    if (this.icon !== "x" && this.icon !== "loading~spin") this.prevIcon = this.icon;

    this.icon = "x";
    this.text = "Bundler";

    this.update();
  }

  loading(text: string = "loading") {
    if (this.icon !== "" && this.icon !== "x") this.prevIcon = this.icon;

    this.icon = "loading~spin";
    this.text = text;

    this.update();
  }

  private update() {
    this.statusBarItem.text = `$(${this.icon}) ${this.text}`;
  }
}

export default StatusBarItemController;
