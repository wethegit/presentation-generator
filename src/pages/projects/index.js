import React from "react";
import { Switch, Route, useRouteMatch, Link } from "react-router-dom";

import CreateProjectPage from "./create/index.js";
import UpdateProjectPage from "./update/index.js";

import PROJECTS from "../../data/projects.json";
import PageLayout from "../../layouts/page/page.js";

export default function Projects() {
  let { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <PageLayout>
          <h3>Show list of projects or NO projects depending on user</h3>
          {PROJECTS.map((item, index) => (
            <Link to={`${url}/${index}`} key={`project-${index}`}>
              {item.title}
            </Link>
          ))}
        </PageLayout>
      </Route>
      <Route path={`${path}/create`}>
        <CreateProjectPage />
      </Route>
      <Route path={`${path}/:projectId`}>
        <UpdateProjectPage />
      </Route>
    </Switch>
  );
}
