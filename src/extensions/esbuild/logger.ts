import { window } from "vscode";

type LogLevel = "info" | "warning" | "error";

class Logger {
	private outputChannel = window.createOutputChannel("Builder", "log");
	private textDecoder = new TextDecoder();

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

const logger = new Logger();

export { logger };
