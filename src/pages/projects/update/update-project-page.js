import React, { useState } from "react";
import gql from "graphql-tag";
import { useHistory } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/react-hooks";
import update from "immutability-helper";
import { Storage } from "aws-amplify";

import {
  updateProject,
  deleteProject,
  createConcept,
  updateConcept,
  deleteConcept,
  createPage,
  updatePage,
  deletePage,
  createPageVariant,
  updatePageVariant,
  deletePageVariant,
} from "../../../graphql/mutations.js";
import { getProject } from "../../../graphql/queries.js";

import PageLayout from "../../../containers/page-layout/page-layout.js";

import Alert from "../../../components/alert/alert.js";

import useAuth from "../../../hooks/use-auth.js";

import { CLIENT_GROUPS, PAGE_SIZES } from "../../../utils/consts.js";

export default function CreateProjectPage() {
  const { user } = useAuth();
  const history = useHistory();
  const { projectID } = useParams();
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
  const [createPageVariantMutation] = useMutation(gql(createPageVariant));
  const [updatePageVariantMutation] = useMutation(gql(updatePageVariant));
  const [deletePageVariantMutation] = useMutation(gql(deletePageVariant));
  const { loading, error, data, refetch } = useQuery(gql(getProject), {
    variables: { id: projectID },
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
              if (page.variants) {
                for (let variant of page.variants.items) {
                  if (variant.image) {
                    const url = await Storage.get(variant.image.key, {
                      identityId: variant.image.identityId,
                    });

                    variant.image.url = url;
                  }
                }
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

    let { concepts, title, slug, client, description, logo } = project;

    try {
      let promises = [];
      const imagePrefix = `${Date.now()}-${slug}-`;

      if (logo) {
        let { new: newLogo, url, ...logoDetails } = logo;
        // Update project details
        // check if the logo was updated
        if (newLogo) {
          // check for previous logo and delete it
          if (logo.key) promises.push(Storage.remove(logo.key));

          // upload new one
          logo = await Storage.put(`${imagePrefix}${newLogo.name}`, newLogo, {
            contentType: newLogo.type,
          });

          // save keys to object
          logo = {
            ...logo,
            identityId: user.identityId,
          };
        } else {
          logo = { ...logoDetails };
        }
      }

      promises.push(
        await updateProjectMutation({
          variables: {
            input: { id: projectID, title, slug, client, description, logo },
          },
        })
      );

      // go through concepts
      for (let { id: conceptID, pages, name, moodboard } of concepts.items) {
        // same thing as the logo above
        if (moodboard) {
          let { new: newMoodboard, url, ...moodboardDetails } = moodboard;

          if (newMoodboard) {
            if (moodboard.key) promises.push(Storage.remove(moodboard.key));

            moodboard = await Storage.put(
              `${imagePrefix}concept-${newMoodboard.name}`,
              newMoodboard,
              {
                contentType: newMoodboard.type,
              }
            );

            moodboard = {
              ...moodboard,
              identityId: user.identityId,
            };
          } else {
            moodboard = { ...moodboardDetails };
          }
        }

        // if the concept has an id, we update it
        if (conceptID)
          promises.push(
            updateConceptMutation({
              variables: { input: { id: conceptID, name, moodboard } },
            })
          );
        // otherwise we create it
        else {
          // create concept
          const {
            data: { createConcept: newConcept },
          } = await createConceptMutation({
            variables: {
              input: { projectID, name, moodboard },
            },
          });

          // save id for pages
          conceptID = newConcept.id;
        }

        // Go through pages and do the same thing
        for (let { id: pageID, name, variants } of pages.items) {
          // if page has id we update it
          if (pageID)
            promises.push(
              updatePageMutation({
                variables: { input: { id: pageID, name } },
              })
            );
          // otherwise create page
          else {
            // create concept
            const {
              data: { createConcept: newPage },
            } = await createPageMutation({
              variables: {
                input: { conceptID, name },
              },
            });

            pageID = newPage.id;
          }

          // Go through variants
          for (let {
            id: variantId,
            size,
            image: { url, ...image },
          } of variants.items) {
            // same thing as the logo above
            if (image.new) {
              if (image.key) promises.push(Storage.remove(image.key));

              image = await Storage.put(
                `${imagePrefix}variant-${image.new.name}`,
                image.new,
                {
                  contentType: image.new.type,
                }
              );

              image = {
                ...image,
                identityId: user.identityId,
              };
            }

            if (variantId)
              promises.push(
                updatePageVariantMutation({
                  variables: { input: { id: variantId, size, image } },
                })
              );
            else
              promises.push(
                createPageVariantMutation({
                  variables: { input: { pageID, size, image } },
                })
              );
          }
        }
      }

      // TODO: improve this logic
      // go through original data and compare to see if any concept or page was deleted
      for (let { pages, id: conceptID, moodboard } of data.getProject.concepts
        .items) {
        // find concept
        const updatedConcept = concepts.items.find(
          ({ id }) => id === conceptID
        );

        // didn't find, delete all concepts, pages and variants
        if (!updatedConcept) {
          for (let { id: pageID, variants } of pages.items) {
            for (let { id: variantID, image } of variants.items) {
              if (image && image.key) promises.push(Storage.remove(image.key));

              promises.push(
                deletePageVariantMutation({
                  variables: { input: { id: variantID } },
                })
              );
            }

            promises.push(
              deletePageMutation({ variables: { input: { id: pageID } } })
            );
          }

          if (moodboard && moodboard.key)
            promises.push(Storage.remove(moodboard.key));

          promises.push(
            deleteConceptMutation({ variables: { input: { id: conceptID } } })
          );
        }
        // found but we still need to check if a page was deleted
        else {
          for (let { id: pageID, variants } of pages.items) {
            const updatedPage = updatedConcept.pages.items.find(
              ({ id }) => id === conceptID
            );

            // couldn't find page, delete all
            if (!updatedPage) {
              for (let { id: variantID, image } of variants.items) {
                if (image && image.key)
                  promises.push(Storage.remove(image.key));

                promises.push(
                  deletePageVariantMutation({
                    variables: { input: { id: variantID } },
                  })
                );
              }

              promises.push(
                deletePageMutation({ variables: { input: { id: pageID } } })
              );
              // found but we still need to check if a variant was deleted
            } else {
              for (let { id: variantID, image } of variants.items) {
                if (
                  !updatedPage.variants.items.find(({ id }) => id === variantID)
                ) {
                  if (image && image.key)
                    promises.push(Storage.remove(image.key));

                  promises.push(
                    deletePageVariantMutation({
                      variables: { input: { id: variantID } },
                    })
                  );
                }
              }
            }
          }
        }
      }

      promises = await Promise.all(promises);

      refetch();

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
        for (let { id: pageId, variants } of pages.items) {
          for (let { id: variantId, image } of variants.items) {
            if (variantId) {
              if (image && image.key) promises.push(Storage.remove(image.key));

              promises.push(
                deletePageVariantMutation({
                  variables: { input: { id: variantId } },
                })
              );
            }
          }

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
          variables: { input: { id: projectID } },
        })
      );

      promises = await Promise.all(promises);

      history.push(
        `/projects?alert=success&alertMessage=${encodeURIComponent(
          "Project deleted."
        )}`
      );
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

    setProject((cur) => {
      if (type === "file") value = { ...cur[name], new: target.files[0] };
      return update(cur, { [name]: { $set: value } });
    });
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
                moodboard: null,
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
    let { value, type } = target;

    conceptIndex = parseInt(conceptIndex);

    setProject((cur) => {
      if (type === "file")
        value = Object.assign({}, cur.concepts.items[conceptIndex][prop], {
          new: target.files[0],
        });
      return update(cur, {
        concepts: { items: { [conceptIndex]: { [prop]: { $set: value } } } },
      });
    });
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
                      variants: { items: [] },
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
    let { value, type } = target;

    conceptIndex = parseInt(conceptIndex);
    pageIndex = parseInt(pageIndex);

    setProject((cur) => {
      if (type === "file")
        value = Object.assign(
          {},
          cur.concepts.items[conceptIndex].pages.items[pageIndex][prop],
          {
            new: target.files[0],
          }
        );

      return update(cur, {
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
      });
    });
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

  const onClickAddVariant = (event) => {
    const dataset = event.target.dataset;
    const conceptIndex = parseInt(dataset.conceptIndex);
    const pageIndex = parseInt(dataset.pageIndex);

    setProject((cur) =>
      update(cur, {
        concepts: {
          items: {
            [conceptIndex]: {
              pages: {
                items: {
                  [pageIndex]: {
                    variants: {
                      items: {
                        $push: [
                          {
                            size: PAGE_SIZES[0],
                            image: null,
                          },
                        ],
                      },
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

  const onVariantChange = (event) => {
    const target = event.target;
    let { value, type, dataset } = target;
    const conceptIndex = parseInt(dataset.conceptIndex);
    const pageIndex = parseInt(dataset.pageIndex);
    const variantIndex = parseInt(dataset.variantIndex);
    const { prop } = target.dataset;

    setProject((cur) => {
      if (type === "file")
        value = Object.assign(
          {},
          cur.concepts.items[conceptIndex].pages.items[pageIndex].variants
            .items[variantIndex][prop],
          {
            new: target.files[0],
          }
        );

      return update(cur, {
        concepts: {
          items: {
            [conceptIndex]: {
              pages: {
                items: {
                  [pageIndex]: {
                    variants: {
                      items: {
                        [variantIndex]: {
                          [prop]: {
                            $set: value,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  };

  const onClickRemoveVariant = (event) => {
    const dataset = event.target.dataset;
    const conceptIndex = parseInt(dataset.conceptIndex);
    const pageIndex = parseInt(dataset.pageIndex);
    const variantIndex = parseInt(dataset.variantIndex);

    setProject((cur) =>
      update(cur, {
        concepts: {
          items: {
            [conceptIndex]: {
              pages: {
                items: {
                  [pageIndex]: {
                    variants: {
                      items: {
                        $splice: [[variantIndex, 1]],
                      },
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

  return (
    <PageLayout>
      {/* no data returned */}
      {!loading && !project && <p>No project found</p>}

      {/* errors from current entry */}
      {error && <Alert type="error">{error.message}</Alert>}

      {/* errors from mutations */}
      {state.error && <Alert type="error">{state.error}</Alert>}

      {/* success for updates */}
      {state.success && (
        <Alert type="success">Project updated with success!</Alert>
      )}

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
                        accept="image/png, image/jpeg"
                      />
                      <p>Current logo</p>
                      {project.logo && project.logo.key && project.logo.url && (
                        <img src={project.logo.url} alt="" width="50" />
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
                                <img
                                  src={concept.moodboard.url}
                                  alt=""
                                  width="50"
                                />
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
                      {concept.pages.items &&
                        concept.pages.items.map((page, pageIndex) => (
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

                            <fieldset disabled={loading || state.loading}>
                              <legend>Page Variant</legend>
                              <p>Page image and size.</p>
                              <button
                                type="button"
                                onClick={onClickAddVariant}
                                data-concept-index={conceptIndex}
                                data-page-index={pageIndex}
                              >
                                Add Page Variant
                              </button>
                              {page.variants.items &&
                                page.variants.items.map(
                                  (variant, variantIndex) => (
                                    <fieldset
                                      key={`concept-${conceptIndex}-page-${pageIndex}-variant-${variantIndex}`}
                                      disabled={loading || state.loading}
                                    >
                                      <legend>{variant.size}</legend>
                                      <p>Page Variant details.</p>
                                      <table>
                                        <tbody>
                                          <tr>
                                            <td>
                                              <label>Size</label>
                                            </td>
                                            <td>
                                              <select
                                                onChange={onVariantChange}
                                                value={variant.size}
                                                name={`concept-${conceptIndex}-page-${pageIndex}-variant-${variantIndex}-size`}
                                                data-prop="size"
                                                data-concept-index={
                                                  conceptIndex
                                                }
                                                data-page-index={pageIndex}
                                                data-variant-index={
                                                  variantIndex
                                                }
                                                required
                                              >
                                                {PAGE_SIZES.map((size) => (
                                                  <option
                                                    key={`concept-${conceptIndex}-page-${pageIndex}-variant-${variantIndex}-size-${size}`}
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
                                                data-concept-index={
                                                  conceptIndex
                                                }
                                                data-page-index={pageIndex}
                                                data-variant-index={
                                                  variantIndex
                                                }
                                                data-prop="image"
                                                onChange={onVariantChange}
                                                type="file"
                                                name={`concept-${conceptIndex}-page-${pageIndex}-image`}
                                              />
                                              <br />
                                              {variant.image &&
                                                variant.image.key &&
                                                variant.image.url && (
                                                  <img
                                                    src={variant.image.url}
                                                    alt=""
                                                    width="50"
                                                  />
                                                )}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <button
                                        onClick={onClickRemoveVariant}
                                        data-concept-index={conceptIndex}
                                        data-page-index={pageIndex}
                                        data-variant-index={variantIndex}
                                        type="button"
                                      >
                                        Delete {variant.size}
                                      </button>
                                    </fieldset>
                                  )
                                )}
                            </fieldset>
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
