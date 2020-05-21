import React, { useMemo } from "react";
import gql from "graphql-tag";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";

import PageLayout from "../../containers/page/page";

import { projectsBySlug } from "../../graphql/queries";

export default function CreateProjectPage() {
  const { projectSlug } = useParams();
  const { loading, error, data } = useQuery(gql(projectsBySlug), {
    variables: { slug: projectSlug },
  });
  const project = useMemo(() => data?.projectsBySlug?.items[0] || null, [data]);

  return (
    <PageLayout>
      {/* loading current project entry */}
      {loading && <p>Loading</p>}

      {/* errors from current entry */}
      {error && <p>Error: {error.message}</p>}

      {/* no data returned */}
      {!loading && !project && <p>No project found</p>}

      {/* if we got data then we can finally edit */}
      {project && (
        <>
          <h1>{project.title}</h1>
          <h2>{project.description}</h2>
          <h4>
            Created: {new Date(project.createdAt).toDateString()} | Updated:{" "}
            {new Date(project.updatedAt).toDateString()}
          </h4>
        </>
      )}
    </PageLayout>
  );
}
