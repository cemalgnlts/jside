type LogLevel = "info" | "warning" | "error";

class Logger {
  private textDecoder = new TextDecoder();
  outputChannel: import("vscode").OutputChannel;

  constructor(window: typeof import("vscode").window, outputChannelName: string) {
    this.outputChannel = window.createOutputChannel(outputChannelName, "log");
  }

  show() {
    this.outputChannel.show();
  }

  append(value: string | Uint8Array) {
    this.outputChannel.append(value instanceof Uint8Array ? this.textDecoder.decode(value) : value);
  }

  info(msg: string) {
    this.log("info", msg);
  }

  warn(msg: string) {
    this.log("warning", msg);
  }

  error(msg: string) {
    this.log("error", msg);
  }

  private log(level: LogLevel, msg: string) {
    const line = `${new Date().toLocaleTimeString()} [${level}] ${msg}`;
    this.outputChannel.appendLine(line);
  }
}

export default Logger;
