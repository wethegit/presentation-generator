import React, { useState } from "react";
import gql from "graphql-tag";
import { useHistory } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/react-hooks";
import update from "immutability-helper";
import { Storage } from "aws-amplify";

import PageLayout from "../../../containers/page-layout/page-layout.js";

import {
  updateProject,
  deleteProject,
  createConcept,
  updateConcept,
  deleteConcept,
  createPage,
  updatePage,
  deletePage,
} from "../../../graphql/mutations.js";
import { getProject } from "../../../graphql/queries.js";

import { CLIENT_GROUPS, PAGE_SIZES } from "../../../utils/consts.js";

export default function CreateProjectPage() {
  const history = useHistory();
  const { projectId } = useParams();
  const [state, setState] = useState({
    loading: true,
    error: false,
    success: false,
  });
  const [project, setProject] = useState(null);
  const [updateProjectMutation] = useMutation(gql(updateProject));
  const [deleteProjectMutation] = useMutation(gql(deleteProject));
  const [createConceptMutation] = useMutation(gql(createConcept));
  const [updateConceptMutation] = useMutation(gql(updateConcept));
  const [deleteConceptMutation] = useMutation(gql(deleteConcept));
  const [createPageMutation] = useMutation(gql(createPage));
  const [updatePageMutation] = useMutation(gql(updatePage));
  const [deletePageMutation] = useMutation(gql(deletePage));
  const { loading, error, data } = useQuery(gql(getProject), {
    variables: { id: projectId },
    onCompleted: async () => {
      if (!data.getProject) return;

      const project = data.getProject;
      // we gotta go through and get all images
      if (project.logo) {
        const url = await Storage.get(project.logo.key, {
          identityId: project.logo.identityId,
        });
        project.logo.url = url;
      }

      if (project.concepts) {
        for (let concept of project.concepts.items) {
          if (concept.moodboard) {
            const url = await Storage.get(concept.moodboard.key, {
              identityId: concept.moodboard.identityId,
            });

            concept.moodboard.url = url;
          }

          if (concept.pages) {
            for (let page of concept.pages.items) {
              if (page.image) {
                const url = await Storage.get(page.image.key, {
                  identityId: page.image.identityId,
                });

                page.image.url = url;
              }
            }
          }
        }
      }

      setState((cur) => {
        return { ...cur, loading: false };
      });

      setProject(project);
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
      for (let { id: conceptId, pages, name } of concepts.items) {
        // if the concept has an id, we update it
        if (conceptId)
          promises.push(
            updateConceptMutation({
              variables: { input: { id: conceptId, name } },
            })
          );
        // otherwise we create it
        else {
          // create concept
          const {
            data: { createConcept: newConcept },
          } = await createConceptMutation({
            variables: {
              input: { projectID: projectId, name },
            },
          });

          // save id for pages
          conceptId = newConcept.id;
        }

        // Go through pages and basically do the same thing
        for (let { id: pageId, name, size } of pages.items) {
          // if page has id we update it
          if (pageId)
            promises.push(
              updatePageMutation({
                variables: { input: { id: pageId, name, size } },
              })
            );
          // otherwise create page
          else
            promises.push(
              createPageMutation({
                variables: { input: { conceptID: conceptId, name, size } },
              })
            );
        }
      }

      // go through original data and compare to see if any concept or page was deleted
      for (let { pages, id: conceptId } of data.getProject.concepts.items) {
        // delete concept and all pages
        const updatedConcept = concepts.items.find(
          ({ id }) => id === conceptId
        );

        if (!updatedConcept) {
          for (let { id: pageId } of pages.items) {
            promises.push(
              deletePageMutation({ variables: { input: { id: pageId } } })
            );
          }

          promises.push(
            deleteConceptMutation({ variables: { input: { id: conceptId } } })
          );
        }
        // checks if a page was deleted
        else {
          for (let { id: pageId } of pages.items) {
            if (!updatedConcept.pages.items.find(({ id }) => id === pageId))
              promises.push(
                deletePageMutation({ variables: { input: { id: pageId } } })
              );
          }
        }
      }

      promises = await Promise.all(promises);

      setState((cur) => {
        return { ...cur, success: true, error: false };
      });
    } catch (err) {
      console.log(err);
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

      // delete children
      for (let { id: conceptId, moodboard, pages } of project.concepts.items) {
        // check for ids because maybe they added but didn't save
        for (let { id: pageId } of pages.items) {
          if (pageId)
            promises.push(
              deletePageMutation({ variables: { input: { id: pageId } } })
            );
        }

        if (conceptId) {
          if (moodboard && moodboard.key)
            promises.push(Storage.remove(moodboard.key));

          promises.push(
            deleteConceptMutation({ variables: { input: { id: conceptId } } })
          );
        }
      }

      // lastly, delete project
      // first the logo
      if (project.logo && project.logo.key)
        promises.push(Storage.remove(project.logo.key));

      promises.push(
        deleteProjectMutation({
          variables: { input: { id: projectId } },
        })
      );

      promises = await Promise.all(promises);

      history.push("/projects");
    } catch (error) {
      console.log(error);
      setState(() => {
        return { success: false, error, loading: false };
      });
    }
  };

  const onDetailsChange = (event) => {
    const target = event.target;
    let { name, value, type } = target;

    if (type === "file") value = target.files[0];

    setProject((cur) => update(cur, { [name]: { $set: value } }));
  };

  const onClickAddConcept = () => {
    setProject((cur) =>
      update(cur, {
        concepts: {
          items: {
            $push: [
              {
                name: `Concept ${cur.concepts.items.length + 1}`,
                pages: { items: [] },
              },
            ],
          },
        },
      })
    );
  };

  const onClickDeleteConcept = (event) => {
    const target = event.target;
    const conceptIndex = parseInt(target.dataset.conceptIndex);

    setProject((cur) =>
      update(cur, { concepts: { items: { $splice: [[conceptIndex, 1]] } } })
    );
  };

  const onConceptChange = (event) => {
    const target = event.target;
    let { conceptIndex, prop } = target.dataset;
    const { value } = target;

    conceptIndex = parseInt(conceptIndex);

    setProject((cur) =>
      update(cur, {
        concepts: { items: { [conceptIndex]: { [prop]: { $set: value } } } },
      })
    );
  };

  const onClickAddPage = (event) => {
    const conceptIndex = parseInt(event.target.dataset.conceptIndex);

    setProject((cur) =>
      update(cur, {
        concepts: {
          items: {
            [conceptIndex]: {
              pages: {
                items: {
                  $push: [
                    {
                      name: `Page ${
                        cur.concepts.items[conceptIndex].pages.items.length + 1
                      }`,
                      size: PAGE_SIZES[0],
                    },
                  ],
                },
              },
            },
          },
        },
      })
    );
  };

  const onPageChange = (event) => {
    const target = event.target;
    let { conceptIndex, pageIndex, prop } = target.dataset;
    const { value } = target;

    conceptIndex = parseInt(conceptIndex);
    pageIndex = parseInt(pageIndex);

    setProject((cur) =>
      update(cur, {
        concepts: {
          items: {
            [conceptIndex]: {
              pages: {
                items: {
                  [pageIndex]: {
                    [prop]: {
                      $set: value,
                    },
                  },
                },
              },
            },
          },
        },
      })
    );
  };

  const onClickRemovePage = (event) => {
    const target = event.target;
    const conceptIndex = parseInt(target.dataset.conceptIndex);
    const pageIndex = parseInt(target.dataset.pageIndex);

    setProject((cur) =>
      update(cur, {
        concepts: {
          items: {
            [conceptIndex]: {
              pages: {
                items: {
                  $splice: [[pageIndex, 1]],
                },
              },
            },
          },
        },
      })
    );
  };

  return (
    <PageLayout>
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
          <h1>Update Project</h1>
          <h2>{project.title}</h2>
          <Link to={`/presentation/${project?.slug}`}>See presentation</Link>
          <form onSubmit={onSubmit}>
            {/* disables if loading entry or mutation */}
            <fieldset disabled={loading || state.loading}>
              <legend>Details</legend>
              <p>Project details</p>
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
                        {CLIENT_GROUPS.map((name) => (
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
                        value={project.description || ""}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Logo</label>
                    </td>
                    <td>
                      <input
                        name="logo"
                        type="file"
                        onChange={onDetailsChange}
                      />
                      <br />
                      {project.logo && project.logo.key && project.logo.url && (
                        <img src={project.logo.url} alt="" />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </fieldset>

            <fieldset disabled={loading || state.loading}>
              <legend>Concepts</legend>
              <p>Project concepts.</p>
              <button type="button" onClick={onClickAddConcept}>
                Add Concept
              </button>
              {project.concepts &&
                project.concepts.items.length > 0 &&
                project.concepts.items.map((concept, conceptIndex) => (
                  <fieldset
                    disabled={loading || state.loading}
                    key={`concept-${conceptIndex}`}
                  >
                    <legend>{concept.name}</legend>
                    <p>Concept details.</p>
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <label>Name</label>
                          </td>
                          <td>
                            <input
                              type="text"
                              name={`concept-${conceptIndex}-name`}
                              data-prop="name"
                              data-concept-index={conceptIndex}
                              onChange={onConceptChange}
                              value={concept.name}
                              required
                            />
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <label>Moodboard</label>
                          </td>
                          <td>
                            <input
                              type="file"
                              name={`concept-${conceptIndex}-moodboard`}
                              data-prop="moodboard"
                              data-concept-index={conceptIndex}
                              onChange={onConceptChange}
                            />
                            <br />
                            {concept.moodboard &&
                              concept.moodboard.key &&
                              concept.moodboard.url && (
                                <img src={concept.moodboard.url} alt="" />
                              )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button
                      data-concept-index={conceptIndex}
                      type="button"
                      onClick={onClickDeleteConcept}
                    >
                      Delete Concept
                    </button>

                    <fieldset disabled={loading || state.loading}>
                      <legend>Pages</legend>
                      <p>Concept pages.</p>
                      <button
                        type="button"
                        onClick={onClickAddPage}
                        data-concept-index={conceptIndex}
                      >
                        Add Page
                      </button>
                      {concept.pages.items.map((page, pageIndex) => (
                        <fieldset
                          key={`concept-${conceptIndex}-page-${pageIndex}`}
                          disabled={loading || state.loading}
                        >
                          <legend>{page.name}</legend>
                          <p>Page details.</p>
                          <table>
                            <tbody>
                              <tr>
                                <td>
                                  <label>Name</label>
                                </td>
                                <td>
                                  <input
                                    onChange={onPageChange}
                                    type="text"
                                    value={page.name}
                                    name={`concept-${conceptIndex}-page-${pageIndex}-name`}
                                    data-prop="name"
                                    data-concept-index={conceptIndex}
                                    data-page-index={pageIndex}
                                    required
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <label>Size</label>
                                </td>
                                <td>
                                  <select
                                    onChange={onPageChange}
                                    value={page.size}
                                    name={`concept-${conceptIndex}-page-${pageIndex}-size`}
                                    data-prop="size"
                                    data-concept-index={conceptIndex}
                                    data-page-index={pageIndex}
                                    required
                                  >
                                    {PAGE_SIZES.map((size) => (
                                      <option
                                        key={`concept-${conceptIndex}-page-${pageIndex}-size-${size}`}
                                        value={size}
                                      >
                                        {size}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                              <tr>
                                <td>Image</td>
                                <td>
                                  <input
                                    data-concept-index={conceptIndex}
                                    data-page-index={pageIndex}
                                    data-prop="image"
                                    onChange={onPageChange}
                                    type="file"
                                    name={`concept-${conceptIndex}-page-${pageIndex}-image`}
                                  />
                                  <br />
                                  {page.image &&
                                    page.image.key &&
                                    page.image.url && (
                                      <img src={page.image.url} alt="" />
                                    )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <button
                            onClick={onClickRemovePage}
                            data-concept-index={conceptIndex}
                            data-page-index={pageIndex}
                            type="button"
                          >
                            Delete page
                          </button>
                        </fieldset>
                      ))}
                    </fieldset>
                  </fieldset>
                ))}
            </fieldset>
            <button type="submit" disabled={loading || state.loading}>
              Update project
            </button>
            <button
              type="button"
              disabled={loading || state.loading}
              onClick={onClickDelete}
            >
              Delete Project
            </button>
          </form>
        </>
      )}
    </PageLayout>
  );
}
