import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import ProjectsPage from "../../pages/projects/index.js";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <p>Home</p>
        </Route>
        <Route path="/projects">
          <ProjectsPage />
        </Route>
      </Switch>
    </Router>
  );
}
