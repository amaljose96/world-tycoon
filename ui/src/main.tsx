import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { WorldTycoon } from "./WorldTycoon/index.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WorldTycoon />
  </StrictMode>,
);
