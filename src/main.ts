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

	task()
		.then(() => console.log("Offline Ready!"))
		.catch(console.error);

	window
		.withProgress({ title: "Preparing for offline use...", location: ProgressLocation.Notification }, task)
		.then(() => window.showInformationMessage("Ready for offline use."));
}

App().then(() => {
	if (import.meta.env.PROD) registerSW();
});
