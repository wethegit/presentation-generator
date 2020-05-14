import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import ProjectPage from "./project/index.js";
import NewProjectPage from "./new/index.js";

export default function Projects() {
  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <h3>Show list of projects or NO projects depending on user</h3>
      </Route>
      <Route path={`${path}/new`}>
        <NewProjectPage />
      </Route>
      <Route path={`${path}/:projectId`}>
        <ProjectPage />
      </Route>
    </Switch>
  );
}
