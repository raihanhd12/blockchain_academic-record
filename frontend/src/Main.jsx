import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import {
  ThirdwebProvider,
  metamaskWallet,
  embeddedWallet,
} from "@thirdweb-dev/react";
import App from "./App.jsx";
import "./index.css";
import { Localhost } from "@thirdweb-dev/chains";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <ThirdwebProvider
        supportedWallets={[
          metamaskWallet({
            recommended: true,
          }),
          embeddedWallet({
            auth: {
              options: ["email", "google", "facebook", "apple"],
            },
          }),
        ]}
        activeChain={Localhost}
        clientId={import.meta.env.VITE_CLIENT_ID}
      >
        <App />
      </ThirdwebProvider>
    </Router>
  </React.StrictMode>
);
