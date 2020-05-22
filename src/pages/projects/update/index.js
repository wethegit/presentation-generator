import React, { useState } from "react";
import gql from "graphql-tag";
import { useHistory } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/react-hooks";

import PageLayout from "../../../containers/page/page";

import {
  updateProject,
  deleteProject,
  createProjectConcept,
  updateProjectConcept,
  deleteProjectConcept,
} from "../../../graphql/mutations";
import { getProject } from "../../../graphql/queries";

import { CLIENTS } from "../../../utils/consts";

export default function CreateProjectPage() {
  const history = useHistory();
  const { projectId } = useParams();
  const [state, setState] = useState({
    loading: false,
    error: false,
    success: false,
  });
  const [project, setProject] = useState(null);
  const [updateProjectMutation] = useMutation(gql(updateProject));
  const [updateProjectConceptMutation] = useMutation(gql(updateProjectConcept));
  const [createProjectConceptMutation] = useMutation(gql(createProjectConcept));
  const [deleteProjectConceptMutation] = useMutation(gql(deleteProjectConcept));
  const [deleteProjectMutation] = useMutation(gql(deleteProject));
  const { loading, error, data } = useQuery(gql(getProject), {
    variables: { id: projectId },
    onCompleted: () => {
      if (!data.getProject) return;
      setProject(data.getProject);
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    setState(() => {
      return { success: false, error: false, loading: true };
    });

    const { concepts, title, slug, client, description } = project;

    try {
      let promises = [];

      // Update project details
      promises.push(
        await updateProjectMutation({
          variables: {
            input: { id: projectId, title, slug, client, description },
          },
        })
      );

      // go through concepts
      concepts.items.forEach(({ id, name }) => {
        // if the concept has an id, we update it
        if (id)
          promises.push(
            updateProjectConceptMutation({
              variables: { input: { id, name, projectID: projectId } },
            })
          );
        // otherwise we create it
        else
          promises.push(
            createProjectConceptMutation({
              variables: { input: { name, projectID: projectId } },
            })
          );
      });

      // go through original data and compare to see if any concepts where deleted
      data.getProject.concepts.items.forEach(({ id }) => {
        if (!concepts.items.find((c) => c.id === id))
          promises.push(
            deleteProjectConceptMutation({ variables: { input: { id } } })
          );
      });

      promises = await Promise.all(promises);

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

  const onClickDelete = async () => {
    setState(() => {
      return { success: false, error: false, loading: true };
    });

    try {
      let promises = [];

      project.concepts.items.forEach(({ id }) => {
        if (id)
          promises.push(
            deleteProjectConceptMutation({ variables: { input: { id } } })
          );
      });

      promises.push(
        deleteProjectMutation({
          variables: { input: { id: projectId } },
        })
      );

      promises = await Promise.all(promises);

      history.push("/projects");
    } catch (error) {
      setState(() => {
        return { success: false, error, loading: false };
      });
    }
  };

  const onDetailsChange = (event) => {
    const target = event.target;
    const { name, value } = target;

    setProject((cur) => {
      return { ...cur, [name]: value };
    });
  };

  const onClickAddConcept = () => {
    setProject(({ concepts, ...rest }) => {
      return {
        ...rest,
        concepts: {
          items: concepts.items.concat([
            { name: `Concept ${concepts.items.length + 1}` },
          ]),
        },
      };
    });
  };

  const onClickDeleteConcept = (event) => {
    const target = event.target;
    const conceptIndex = parseInt(target.dataset.conceptIndex);

    setProject(({ concepts, ...rest }) => {
      return {
        ...rest,
        concepts: {
          items: concepts.items.filter((c, index) => index !== conceptIndex),
        },
      };
    });
  };

  const onConceptChange = (event) => {
    const target = event.target;
    let { conceptIndex } = target.dataset;
    const { name, value } = target;

    conceptIndex = parseInt(conceptIndex);

    setProject(({ concepts, ...rest }) => {
      return {
        ...rest,
        concepts: {
          items: concepts.items.map((concept, index) => {
            if (index === conceptIndex) concept[name] = value;
            return concept;
          }),
        },
      };
    });
  };
  return (
    <PageLayout>
      {/* loading current project entry */}
      {loading && <p>Loading</p>}

      {/* no data returned */}
      {!loading && !project && <p>No project found</p>}

      {/* errors from current entry */}
      {error && <p>Error: {error.message}</p>}

      {/* errors from mutations */}
      {state.error && <p>Error: {state.error}</p>}

      {/* success for updates */}
      {state.success && <p>Succes!</p>}

      {project && (
        <>
          <Link to={`/presentation/${project?.slug}`}>See presentation</Link>
          <hr />
          <form onSubmit={onSubmit}>
            {/* disables if loading entry or mutation */}
            <fieldset disabled={loading || state.loading}>
              <legend>Details</legend>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <label>Title</label>
                    </td>
                    <td>
                      <input
                        name="title"
                        type="text"
                        onChange={onDetailsChange}
                        value={project.title}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Slug</label>
                    </td>
                    <td>
                      <input
                        name="slug"
                        type="text"
                        onChange={onDetailsChange}
                        value={project.slug}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Client</label>
                    </td>
                    <td>
                      <select
                        name="client"
                        required
                        onChange={onDetailsChange}
                        value={project.client}
                      >
                        {CLIENTS.map((name) => (
                          <option key={`client-${name}`} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Description</label>
                    </td>
                    <td>
                      <input
                        name="description"
                        type="text"
                        onChange={onDetailsChange}
                        value={project.description}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </fieldset>
            <fieldset>
              <legend>Concepts</legend>
              {project.concepts.items.length > 0 && (
                <table>
                  <tbody>
                    {project.concepts.items.map((concept, index) => (
                      <tr key={`concept-${index}-${concept.id}`}>
                        <td>
                          <label>Name</label>
                        </td>
                        <td>
                          <input
                            data-concept-index={index}
                            type="text"
                            name="name"
                            required
                            onChange={onConceptChange}
                            value={concept.name}
                          />
                        </td>
                        <td>
                          <button
                            data-concept-index={index}
                            type="button"
                            onClick={onClickDeleteConcept}
                          >
                            Delete concept
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button type="button" onClick={onClickAddConcept}>
                Add Concept
              </button>
            </fieldset>
            <button type="submit">Update</button>
            <button type="button" onClick={onClickDelete}>
              Delete
            </button>
          </form>
        </>
      )}
    </PageLayout>
  );
}
