import App from "./App.ts";

if (import.meta.env.PROD) {
	navigator.serviceWorker.register("/sw.js");
}

App();
