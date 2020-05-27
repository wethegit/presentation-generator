import React from "react";
import {
  Switch,
  Route,
  useRouteMatch,
  Link,
  useLocation,
} from "react-router-dom";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

import { listProjects } from "../../graphql/queries.js";
import PageLayout from "../../containers/page-layout/page-layout.js";

import CreateProjectPage from "./create/create-project-page.js";
import UpdateProjectPage from "./update/update-project-page.js";
import Alert from "../../components/alert/alert.js";

const ProjectsLanding = () => {
  const { url } = useRouteMatch();
  const query = new URLSearchParams(useLocation().search);
  const { loading, error, data } = useQuery(gql(listProjects));

  return (
    <PageLayout>
      <h1>Projects</h1>
      <Link to={`${url}/create`}>New Project</Link>
      {query.get("alert") && (
        <Alert type={query.get("alert")}>{query.get("alertMessage")}</Alert>
      )}
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
      <Route path={`${path}/:projectID`}>
        <UpdateProjectPage />
      </Route>
    </Switch>
  );
}
