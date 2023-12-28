import vscode from "vscode";

function activate() {
	vscode.window.showInformationMessage("Hello from extension");
}

export {
    activate
}