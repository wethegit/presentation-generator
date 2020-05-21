import React, { useState, useMemo } from "react";
import gql from "graphql-tag";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/react-hooks";

import PageLayout from "../../../containers/page/page";

import { updateProject } from "../../../graphql/mutations";
import { getProject } from "../../../graphql/queries";

import { formToObject } from "../../../utils/helpers";
import { CLIENTS } from "../../../utils/consts";

export default function CreateProjectPage() {
  const { projectId } = useParams();
  const [state, setState] = useState({
    loading: false,
    error: false,
    success: false,
  });
  const [updateProjectMutation] = useMutation(gql(updateProject));
  const { loading, error, data } = useQuery(gql(getProject), {
    variables: { id: projectId },
  });
  const project = useMemo(() => data?.getProject || null, [data]);

  const onSubmit = async (event) => {
    event.preventDefault();

    setState(() => {
      return { success: false, error: false, loading: true };
    });

    const formData = formToObject(event.target);

    try {
      await updateProjectMutation({
        variables: { input: { id: projectId, ...formData } },
      });

      setState((cur) => {
        return { ...cur, success: true, error: false };
      });
    } catch (err) {
      setState((cur) => {
        return { ...cur, error: err.message };
      });
    } finally {
      setState((cur) => {
        return { ...cur, loading: false };
      });
    }
  };

  return (
    <PageLayout>
      {/* loading current project entry */}
      {loading && <p>Loading</p>}

      {/* errors from current entry */}
      {error && <p>Error: {error.message}</p>}

      {/* no data returned */}
      {!loading && !project && <p>No project found</p>}

      {/* errors from mutations */}
      {state.error && <p>Error: {state.error}</p>}

      {/* success for updates */}
      {state.success && <p>Succes!</p>}

      {/* if we got data then we can finally edit */}
      {project && (
        <>
          <Link to={`/presentation/${project.slug}`}>See presentation</Link>
          <hr />
          <form onSubmit={onSubmit}>
            {/* disables if loading entry or mutation */}
            <fieldset disabled={loading || state.loading}>
              <label>
                Title
                <input
                  name="title"
                  type="text"
                  defaultValue={project.title}
                  required
                />
              </label>
              <label>
                Slug
                <input
                  name="slug"
                  type="text"
                  defaultValue={project.slug}
                  required
                />
              </label>
              <label>
                Client
                <select name="client" required>
                  {CLIENTS.map((name) => (
                    <option
                      key={`client-${name}`}
                      defaultValue={name === project.client}
                      value={name}
                    >
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Description
                <input
                  name="description"
                  type="text"
                  defaultValue={project.description}
                />
              </label>
              <button type="submit">Update</button>
            </fieldset>
          </form>
        </>
      )}
    </PageLayout>
  );
}
