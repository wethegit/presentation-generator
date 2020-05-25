import React from "react";
import ReactDOM from "react-dom";
import Amplify, { Storage } from "aws-amplify";
import { BrowserRouter as Router } from "react-router-dom";

import { AuthProvider } from "./contexts/auth-context";

import "./index.scss";

import App from "./components/app/app";
import Auth from "./components/auth/auth.js";
import ApolloWrapper from "./containers/apollo/apollo.js";

import * as serviceWorker from "./serviceWorker.js";
import awsExports from "./aws-exports.js";

Amplify.configure(awsExports);
Storage.configure({ level: "protected" });

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <Auth>
        <Router>
          <ApolloWrapper>
            <App />
          </ApolloWrapper>
        </Router>
      </Auth>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
