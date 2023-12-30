/*
import { registerSW } from "virtual:pwa-register";
import App from "./App.ts";

const updateSW = registerSW({
	immediate: true,
	onNeedRefresh() {
		console.log("onNeedRefresh()");
		if (confirm("New version available. Update?")) {
			updateSW(true);
		}
	},
	onRegisteredSW() {
		console.log("onRegisteredSW");
		App();
	},
	onOfflineReady() {
		console.log("onOfflineReady");
	}
});
*/
