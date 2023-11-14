import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./main.css";

import { Provider } from "jotai";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider>
    <App />
  </Provider>
);
