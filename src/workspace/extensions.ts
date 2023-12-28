// Languages
import "@codingame/monaco-vscode-html-default-extension";
import "@codingame/monaco-vscode-css-default-extension";
import "@codingame/monaco-vscode-javascript-default-extension";
import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "@codingame/monaco-vscode-json-default-extension";
import "@codingame/monaco-vscode-markdown-basics-default-extension";

// Language servers
import "@codingame/monaco-vscode-typescript-language-features-default-extension";
import "@codingame/monaco-vscode-markdown-language-features-default-extension";

// Themes
import "../extensions/one-dark-theme";
import "../extensions/material-icon-theme";

// Other
import "@codingame/monaco-vscode-media-preview-default-extension";
import "@codingame/monaco-vscode-search-result-default-extension";

// Custom
import activateProjectManager from "../extensions/project-manager";
import activateSearch from "../extensions/search";
// import "../extensions/esbuild";

async function activateDefaultExtensions() {
	await Promise.all([
        activateProjectManager(),
        activateSearch()
    ]);
}

export { activateDefaultExtensions };
