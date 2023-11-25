import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./main.css";

import { Provider } from "jotai";
import { store } from "./state.js";

import { registerSW } from "virtual:pwa-register";

registerSW({
  onOfflineReady() { },
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
