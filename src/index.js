import React from "react";
import ReactDOM from "react-dom";
import Amplify from "aws-amplify";
import { BrowserRouter as Router } from "react-router-dom";

import { AuthProvider } from "./contexts/auth-context";

import "./index.scss";

import App from "./components/app/app";
import Auth from "./containers/auth/auth";
import ApolloWrapper from "./containers/apollo/apollo";

import * as serviceWorker from "./serviceWorker";
import awsExports from "./aws-exports";

Amplify.configure(awsExports);

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
