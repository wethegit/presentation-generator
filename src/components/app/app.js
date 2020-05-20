import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import PrivateRoute from "../private-route/private-route.js";
import Navigation from "../navigation/navigation.js";

import ProjectsPage from "../../pages/projects/index.js";
import HomePage from "../../pages/home/index.js";
import PresentationPage from "../../pages/presentation/index.js";
import LoginPage from "../../pages/login/login.js";

export default function App() {
  return (
    <Router>
      <Navigation />
      <Switch>
        <PrivateRoute exact path="/">
          <HomePage />
        </PrivateRoute>
        <PrivateRoute path="/projects">
          <ProjectsPage />
        </PrivateRoute>
        <Route path="/login">
          <LoginPage />
        </Route>
        <PrivateRoute path="/presentation/:projectId">
          <PresentationPage />
        </PrivateRoute>
      </Switch>
    </Router>
  );
}
