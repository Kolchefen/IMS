
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
    // @ts-ignore: side-effect CSS import is handled by the bundler
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  