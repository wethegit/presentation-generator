import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import PrivateRoute from "../../containers/private-route/private-route.js";

import ProjectsPage from "../../pages/projects/index.js";
import HomePage from "../../pages/home/index.js";
import PresentationPage from "../../pages/presentation/index.js";
import AdminPage from "../../pages/admin/index.js";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <HomePage />
        </Route>
        <PrivateRoute groups={["WTC"]} path="/projects">
          <ProjectsPage />
        </PrivateRoute>
        <PrivateRoute
          groups={["WTC", "NOA", "TPCI"]}
          path="/presentation/:projectSlug"
        >
          <PresentationPage />
        </PrivateRoute>
        <PrivateRoute path="/admin">
          <AdminPage />
        </PrivateRoute>
      </Switch>
    </Router>
  );
}
