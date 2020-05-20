import React from "react";
import ReactDOM from "react-dom";
import { Grommet } from "grommet";

import "./index.scss";

import App from "./components/app/app";
import lightTheme from "./themes/light";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <React.StrictMode>
    <Grommet theme={lightTheme}>
      <App />
    </Grommet>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
