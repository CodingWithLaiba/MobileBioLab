import { createRoot } from "react-dom/client"; //connect React to the browser
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
