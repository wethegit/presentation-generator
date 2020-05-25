import React from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";

import PrivateRoute from "../../containers/private-route/private-route.js";

import ProjectsPage from "../../pages/projects/projects-page.js";
import HomePage from "../../pages/home/home-page.js";
import PresentationPage from "../../pages/presentation/presentation-page.js";
import AdminPage from "../../pages/admin/admin-page.js";

export default function App() {
  return (
    <Router>
      <Switch>
        <PrivateRoute exact groups={["WTC"]} path="/">
          <HomePage />
        </PrivateRoute>
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
