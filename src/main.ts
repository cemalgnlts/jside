// import { registerSW } from "virtual:pwa-register";
import App from "./App.ts";

// const updateSW = registerSW({
// 	onNeedRefresh() {
// 		if (confirm("New version available. Update?")) {
// 			updateSW(true);
// 		}
// 	},
// 	onOfflineReady() {
// 		console.log("Offline ready!");
// 	}
// });

App();
