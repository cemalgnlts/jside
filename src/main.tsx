// import { registerSW } from "virtual:pwa-register";

// const updateSW = registerSW({
//   onNeedRefresh() {
//     if (confirm("New version available. Update?")) {
//       updateSW(true);
//     }
//   },
//   onOfflineReady() {
//     console.log("Offline ready!");
//   }
// });

import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "./base.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
