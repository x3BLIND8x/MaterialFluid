import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../kit/styles.css";
import "../kit/appearance.css";
import "./showcase.css";
const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = "/fonts.css";
document.head.append(stylesheet);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
