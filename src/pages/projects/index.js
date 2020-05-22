import React from "react";
import { Switch, Route, useRouteMatch, Link } from "react-router-dom";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

import { listProjects } from "../../graphql/queries";
import PageLayout from "../../containers/page/page.js";

import CreateProjectPage from "./create/index.js";
import UpdateProjectPage from "./update/index.js";

const ProjectsLanding = () => {
  let { url } = useRouteMatch();
  const { loading, error, data } = useQuery(gql(listProjects));

  return (
    <PageLayout>
      <h3>Show list of projects</h3>
      <Link to={`${url}/create`}>New Project</Link>
      <hr />
      {loading && <p>Loading...</p>}
      {error && <p>Error! {error.message}</p>}
      {data?.listProjects?.items && (
        <ul>
          {data.listProjects.items.map((item) => (
            <li key={`project-${item.id}`}>
              <Link to={`${url}/${item.id}`}>{item.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
};

export default function Projects() {
  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <ProjectsLanding />
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
