import { ProgressLocation, window } from "vscode";

import App from "./App.ts";

// Set up the service worker.
function registerSW() {
	navigator.serviceWorker.register("/sw.js").then((registration) => {
		registration.onupdatefound = () => onSWUpdateFound(registration);
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
		.withProgress({ title: "PWA Installing", location: ProgressLocation.Notification }, task)
		.then(() => setTimeout(() => window.showInformationMessage("PWA Installed."), 1000));
}

App().then(() => (import.meta.env.PROD ? registerSW() : null));
