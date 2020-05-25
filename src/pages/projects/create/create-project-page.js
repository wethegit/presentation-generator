import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Storage } from "aws-amplify";
import slugify from "slugify";
import update from "immutability-helper";

import PageLayout from "../../../containers/page-layout/page-layout.js";

import {
  createProject,
  createConcept,
  createPage,
} from "../../../graphql/mutations.js";

import useAuth from "../../../hooks/use-auth.js";

import { CLIENT_GROUPS, PAGE_SIZES } from "../../../utils/consts.js";

export default function CreateProjectPage() {
  const { user } = useAuth();
  const [createProjectMutation] = useMutation(gql(createProject));
  const [createConceptMutation] = useMutation(gql(createConcept));
  const [createPageMutation] = useMutation(gql(createPage));
  const [state, setState] = useState({
    loading: false,
    error: false,
    success: false,
  });
  const [details, setDetails] = useState({
    client: CLIENT_GROUPS[0],
  });
  const [concepts, setConcepts] = useState([]);

  const onSubmit = async (event) => {
    event.preventDefault();

    setState({ loading: true, error: false, success: false });

    try {
      // create project
      // first upload logo so get the key and add to the entry
      let { logo, ...projectDetails } = details;

      if (logo) {
        logo = await Storage.put(`${Date.now()}${logo.name}`, logo, {
          contentType: logo.type,
        });

        logo = {
          ...logo,
          identityId: user.identityId,
        };
      }

      // create project and save it to a newProject variable so we can use the id
      const {
        data: { createProject: newProject },
      } = await createProjectMutation({
        variables: { input: { ...projectDetails, logo } },
      });

      // pages and concepts
      let pagesPromises = [];
      for (let { pages, moodboard, ...concept } of concepts) {
        // create concepts and save to variable so we can get the ID
        // check if there is a moodboard so upload and get the ID
        if (moodboard) {
          moodboard = await Storage.put(
            `${Date.now()}${moodboard.name}`,
            moodboard,
            {
              contentType: moodboard.type,
            }
          );

          moodboard = {
            ...moodboard,
            identityId: user.identityId,
          };
        }

        const {
          data: { createConcept: newConcept },
        } = await createConceptMutation({
          variables: {
            input: { projectID: newProject.id, moodboard, ...concept },
          },
        });

        for (let page of pages) {
          // create page
          pagesPromises.push(
            createPageMutation({
              variables: {
                input: {
                  conceptID: newConcept.id,
                  ...page,
                },
              },
            })
          );
        }
      }

      await Promise.all(pagesPromises);

      setState((cur) => {
        return { ...cur, error: false, success: true };
      });
    } catch (error) {
      console.log(error.error);
      setState((cur) => {
        return { ...cur, error: error.message, success: false };
      });
    } finally {
      setState((cur) => {
        return { ...cur, loading: false };
      });
    }
  };

  const onDetailsChange = (event) => {
    const target = event.target;
    let { name, value, type } = target;

    if (type === "file") value = target.files[0];

    setDetails((cur) => update(cur, { [name]: { $set: value } }));
  };

  const onClickAddConcept = () => {
    setConcepts((cur) =>
      update(cur, {
        $push: [
          { name: `Concept ${cur.length + 1}`, moodboard: null, pages: [] },
        ],
      })
    );
  };

  const onConceptValueChange = (event) => {
    const target = event.target;
    let { conceptIndex, prop } = target.dataset;
    let { value, type } = target;

    if (type === "file") value = target.files[0];

    conceptIndex = parseInt(conceptIndex);

    setConcepts((cur) =>
      update(cur, { [conceptIndex]: { [prop]: { $set: value } } })
    );
  };

  const onClickRemoveConcept = (event) => {
    const conceptIndex = parseInt(event.target.dataset.conceptIndex);

    setConcepts((cur) => update(cur, { $splice: [[conceptIndex, 1]] }));
  };

  const onClickRemovePage = (event) => {
    const conceptIndex = parseInt(event.target.dataset.conceptIndex);
    const pageIndex = parseInt(event.target.dataset.conceptIndex);

    setConcepts((cur) =>
      update(cur, { [conceptIndex]: { pages: { $splice: [[pageIndex, 1]] } } })
    );
  };

  const onClickAddPage = (event) => {
    const conceptIndex = parseInt(event.target.dataset.conceptIndex);

    setConcepts((cur) =>
      update(cur, {
        [conceptIndex]: {
          pages: {
            $push: [
              {
                name: `Page ${cur[conceptIndex].pages.length + 1}`,
                size: PAGE_SIZES[0],
                image: null,
              },
            ],
          },
        },
      })
    );
  };

  const onPageValueChange = (event) => {
    const target = event.target;
    const conceptIndex = parseInt(target.dataset.conceptIndex);
    const pageIndex = parseInt(target.dataset.pageIndex);
    const prop = target.dataset.prop;
    let { value, type } = target;

    if (type === "file") value = target.files[0];

    setConcepts((cur) =>
      update(cur, {
        [conceptIndex]: { pages: { [pageIndex]: { [prop]: { $set: value } } } },
      })
    );
  };

  const onSlugFocus = (event) => {
    const { value } = event.target;

    if (!value) return;

    const slug = slugify(value, {
      replacement: "-",
      lower: true,
      strict: true,
    });

    setDetails((cur) => update(cur, { slug: { $set: slug } }));
  };

  return (
    <PageLayout>
      {state.error && <p>{state.error}</p>}
      {state.success && <p>Success!</p>}
      <form onSubmit={onSubmit}>
        <fieldset disabled={state.loading}>
          <legend>Details</legend>
          <table>
            <tbody>
              <tr>
                <td>
                  <label>Title</label>
                </td>
                <td>
                  <input
                    onChange={onDetailsChange}
                    value={details.title || ""}
                    name="title"
                    type="text"
                    required
                    onBlur={onSlugFocus}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Slug</label>
                </td>
                <td>
                  <input
                    type="text"
                    name="slug"
                    required
                    onChange={onDetailsChange}
                    value={details.slug || ""}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Client</label>
                </td>
                <td>
                  <select
                    value={details.client || CLIENT_GROUPS[0]}
                    name="client"
                    required
                    onChange={onDetailsChange}
                  >
                    {CLIENT_GROUPS.map((name) => (
                      <option key={`client-option-${name}`} value={name}>
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
                    type="text"
                    name="description"
                    onChange={onDetailsChange}
                    value={details.description || ""}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Logo</label>
                </td>
                <td>
                  <input type="file" name="logo" onChange={onDetailsChange} />
                </td>
              </tr>
            </tbody>
          </table>
        </fieldset>
        <fieldset disabled={state.loading}>
          <legend>Concepts</legend>
          <button type="button" onClick={onClickAddConcept}>
            Add concept
          </button>
          <table>
            <tbody>
              {concepts.map((concept, conceptIndex) => (
                <tr key={`concept-${conceptIndex}`}>
                  <td colSpan="2">
                    <fieldset>
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              <label>Name</label>
                            </td>
                            <td>
                              <input
                                data-concept-index={conceptIndex}
                                data-prop="name"
                                name={`concept-${conceptIndex}-name`}
                                type="text"
                                required
                                value={concept.name}
                                onChange={onConceptValueChange}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <label>Moodboard</label>
                            </td>
                            <td>
                              <input
                                data-concept-index={conceptIndex}
                                data-prop="moodboard"
                                name={`concept-${conceptIndex}-moodboard`}
                                type="file"
                                onChange={onConceptValueChange}
                                accept="image/png, image/jpeg"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table>
                        <tbody>
                          <tr>
                            <td colSpan="2">
                              <fieldset>
                                <legend>Pages</legend>
                                <button
                                  type="button"
                                  data-concept-index={conceptIndex}
                                  onClick={onClickAddPage}
                                >
                                  Add Page
                                </button>
                                {concept.pages.length > 0 && (
                                  <table>
                                    <tbody>
                                      {concept.pages.map((page, pageIndex) => (
                                        <tr
                                          key={`concept-${conceptIndex}-page-${pageIndex}`}
                                        >
                                          <td colSpan="2">
                                            <fieldset>
                                              <table>
                                                <tbody>
                                                  <tr>
                                                    <td>
                                                      <label>Name</label>
                                                    </td>
                                                    <td>
                                                      <input
                                                        data-concept-index={
                                                          conceptIndex
                                                        }
                                                        data-page-index={
                                                          pageIndex
                                                        }
                                                        onChange={
                                                          onPageValueChange
                                                        }
                                                        type="text"
                                                        name={`concept-${conceptIndex}-page-${pageIndex}-name`}
                                                        data-prop="name"
                                                        required
                                                        value={page.name}
                                                      />
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td>
                                                      <label>Size</label>
                                                    </td>
                                                    <td>
                                                      <select
                                                        value={page.size}
                                                        name={`concept-${conceptIndex}-page-${pageIndex}-size`}
                                                        required
                                                        data-concept-index={
                                                          conceptIndex
                                                        }
                                                        data-page-index={
                                                          pageIndex
                                                        }
                                                        onChange={
                                                          onPageValueChange
                                                        }
                                                      >
                                                        {PAGE_SIZES.map(
                                                          (name) => (
                                                            <option
                                                              key={`concept-${conceptIndex}-page-${pageIndex}-size-option-${name}`}
                                                              value={name}
                                                            >
                                                              {name}
                                                            </option>
                                                          )
                                                        )}
                                                      </select>
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td>
                                                      <label>Image</label>
                                                    </td>
                                                    <td>
                                                      <input
                                                        data-concept-index={
                                                          conceptIndex
                                                        }
                                                        data-page-index={
                                                          pageIndex
                                                        }
                                                        onChange={
                                                          onPageValueChange
                                                        }
                                                        type="file"
                                                        name={`concept-${conceptIndex}-page-${pageIndex}-image`}
                                                        data-prop="image"
                                                        required
                                                      />
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                              <button
                                                type="button"
                                                data-concept-index={
                                                  conceptIndex
                                                }
                                                data-page-index={pageIndex}
                                                onClick={onClickRemovePage}
                                              >
                                                Remove
                                              </button>
                                            </fieldset>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </fieldset>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <button
                        type="button"
                        data-concept-index={conceptIndex}
                        onClick={onClickRemoveConcept}
                      >
                        Remove
                      </button>
                    </fieldset>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>
        <button key="form-submit-button" type="submit" disabled={state.loading}>
          Create
        </button>
      </form>
    </PageLayout>
  );
}
