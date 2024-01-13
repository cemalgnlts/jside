import { ProgressLocation, window } from "vscode";

import App from "./App.ts";

// Set up the service worker.
function registerSW() {
	navigator.serviceWorker.register("/sw.js").then((registration) => {
		registration.onupdatefound = () => onSWUpdateFound(registration);
	});

	// https://github.com/CodinGame/monaco-vscode-api/discussions/312
	navigator.serviceWorker.getRegistrations().then((registrations) => {
		const rootScope = `${location.protocol}//${location.hostname}/`;
		const unwanted = registrations.filter((registration) => registration.scope !== rootScope);

		if (unwanted.length > 0) unwanted.forEach((sw) => sw.unregister());
	});
}

function onSWUpdateFound(regsitration: ServiceWorkerRegistration) {
	const newWorker = regsitration.installing!;
	const hasController = !!navigator.serviceWorker.controller;

	const task = () =>
		new Promise<void>((resolve, reject) => {
			newWorker.onstatechange = () => {
				// The very first activation! Ready for offline.
				if (newWorker.state === "activated" && !hasController) resolve();
				else if (newWorker.state === "activated" && hasController) console.log("New wersion?");

				newWorker.onerror = reject;
			};
		});

	window
		.withProgress({ title: "Preparing for offline use...", location: ProgressLocation.Notification }, task)
		.then(() => window.showInformationMessage("Ready for offline use."));
}

App().then(registerSW);
