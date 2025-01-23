import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/components.css";
import "./styles/game.css";
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, orientation=landscape"
/>;
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);
