// Languages
import "@codingame/monaco-vscode-html-default-extension";
import "@codingame/monaco-vscode-css-default-extension";
import "@codingame/monaco-vscode-javascript-default-extension";
import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "@codingame/monaco-vscode-json-default-extension";
import "@codingame/monaco-vscode-markdown-basics-default-extension";
import "@codingame/monaco-vscode-log-default-extension";

// Language servers
import "@codingame/monaco-vscode-html-language-features-default-extension";
import "@codingame/monaco-vscode-css-language-features-default-extension";
import "@codingame/monaco-vscode-typescript-language-features-default-extension";
import "@codingame/monaco-vscode-json-language-features-default-extension";
import "@codingame/monaco-vscode-markdown-language-features-default-extension";

// Themes
import "../extensions/one-dark-theme";
import "../extensions/material-icon-theme";

// Other
import "@codingame/monaco-vscode-media-preview-default-extension";
import "@codingame/monaco-vscode-search-result-default-extension";
import "@codingame/monaco-vscode-emmet-default-extension";

// Custom
import activatePackageManager from "../extensions/package-manager";
import activateProjectManager from "../extensions/project-manager";
import activateSearch from "../extensions/search";
import "../extensions/esbuild";

async function activateDefaultExtensions() {
	await Promise.all([
        activatePackageManager(),
        activateProjectManager(),
        activateSearch()
    ]);
}

export { activateDefaultExtensions };
