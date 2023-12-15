/** @ts-ignore */
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Update?")) {
      updateSW(true);
    }
  },
});

import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "./base.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
