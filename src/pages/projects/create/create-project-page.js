import React, { useState, useMemo } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Storage } from "aws-amplify";
import slugify from "slugify";
import update from "immutability-helper";

import {
  createProject,
  createConcept,
  createPage,
  createPageVariant,
} from "../../../graphql/mutations.js";

import PageLayout from "../../../containers/page-layout/page-layout.js";

import Alert from "../../../components/alert/alert.js";

import useAuth from "../../../hooks/use-auth.js";

import { CLIENT_GROUPS, PAGE_SIZES } from "../../../utils/consts.js";

export default function CreateProjectPage() {
  const { user } = useAuth();
  const [createProjectMutation] = useMutation(gql(createProject));
  const [createConceptMutation] = useMutation(gql(createConcept));
  const [createPageMutation] = useMutation(gql(createPage));
  const [createPageVariantMutation] = useMutation(gql(createPageVariant));
  const [state, setState] = useState({
    loading: false,
    error: false,
    success: false,
  });
  const [details, setDetails] = useState({
    client: CLIENT_GROUPS[0],
  });
  const [concepts, setConcepts] = useState([]);

  const createUniqueImageName = function (append, fileName) {
    return `${Date.now()}-${details.slug}-${append}-${fileName}`;
  };

  const createVariantEntry = async (pageID, variant) => {
    let { image, ...variantDetails } = variant;

    // upload image
    if (image) {
      image = await Storage.put(
        createUniqueImageName("variant", image.name),
        image,
        {
          contentType: image.type,
        }
      );

      image = {
        ...image,
        identityId: user.identityId,
      };
    }

    // create variant
    const {
      data: { createPageVariant: newVariant },
    } = await createPageVariantMutation({
      variables: {
        input: { pageID, image, ...variantDetails },
      },
    });

    return newVariant;
  };

  const createPageEntry = async (conceptID, page) => {
    let { variants, ...pageDetails } = page;

    // create concepts and save to variable so we can get the ID
    const {
      data: { createPage: newPage },
    } = await createPageMutation({
      variables: {
        input: { conceptID, ...pageDetails },
      },
    });

    // variants
    await Promise.all(
      variants.map((variant) => createVariantEntry(newPage.id, variant))
    );

    return newPage;
  };

  const createConceptEntry = async (projectID, concept) => {
    let { pages, moodboard, ...conceptDetails } = concept;

    // check if there is a moodboard  upload and get the ID
    if (moodboard) {
      moodboard = await Storage.put(
        createUniqueImageName("concept", moodboard.name),
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

    // create concepts and save to variable so we can get the ID
    const {
      data: { createConcept: newConcept },
    } = await createConceptMutation({
      variables: {
        input: { projectID, moodboard, ...conceptDetails },
      },
    });

    // pages and variants
    await Promise.all(
      pages.map((page) => createPageEntry(newConcept.id, page))
    );

    return newConcept;
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    setState({ loading: true, error: false, success: false });

    try {
      // create project
      // first upload logo so we get the key and add to the entry
      let { logo, ...projectDetails } = details;

      if (logo) {
        logo = await Storage.put(
          createUniqueImageName("logo", logo.name),
          logo,
          {
            contentType: logo.type,
          }
        );

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

      // concepts, pages and variants
      await Promise.all(
        concepts.map((concept) => createConceptEntry(newProject.id, concept))
      );

      // clear form and scroll to the top
      setDetails({
        client: CLIENT_GROUPS[0],
      });

      setConcepts([]);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setState((cur) => {
        return { ...cur, error: false, success: true };
      });
    } catch (error) {
      console.log(error);
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
                variants: [],
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

  const onClickRemoveVariant = (event) => {
    const dataset = event.target.dataset;
    const conceptIndex = parseInt(dataset.conceptIndex);
    const pageIndex = parseInt(dataset.conceptIndex);
    const variantIndex = parseInt(dataset.conceptIndex);

    setConcepts((cur) =>
      update(cur, {
        [conceptIndex]: {
          pages: {
            [pageIndex]: { variants: { $splice: [[variantIndex, 1]] } },
          },
        },
      })
    );
  };

  const onClickAddVariant = (event) => {
    const dataset = event.target.dataset;
    const conceptIndex = parseInt(dataset.conceptIndex);
    const pageIndex = parseInt(dataset.pageIndex);

    setConcepts((cur) =>
      update(cur, {
        [conceptIndex]: {
          pages: {
            [pageIndex]: {
              variants: {
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
      })
    );
  };

  const onVariantValueChange = (event) => {
    const target = event.target;
    const conceptIndex = parseInt(target.dataset.conceptIndex);
    const pageIndex = parseInt(target.dataset.pageIndex);
    const variantIndex = parseInt(target.dataset.variantIndex);
    const prop = target.dataset.prop;
    let { value, type } = target;

    if (type === "file") value = target.files[0];

    setConcepts((cur) =>
      update(cur, {
        [conceptIndex]: {
          pages: {
            [pageIndex]: {
              variants: { [variantIndex]: { [prop]: { $set: value } } },
            },
          },
        },
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

  const onClickRemoveLogo = (event) => {
    event.target.previousElementSibling.value = "";
    setDetails((cur) => update(cur, { logo: { $set: null } }));
  };

  const onClickRemoveMoodboard = (event) => {
    const target = event.target;
    const conceptIndex = parseInt(target.dataset.conceptIndex);

    target.previousElementSibling.value = "";

    setConcepts((cur) =>
      update(cur, { [conceptIndex]: { moodboard: { $set: null } } })
    );
  };

  const onClickRemoveVariantImage = (event) => {
    const target = event.target;
    const conceptIndex = parseInt(target.dataset.conceptIndex);
    const pageIndex = parseInt(target.dataset.pageIndex);
    const variantIndex = parseInt(target.dataset.variantIndex);

    target.previousElementSibling.value = "";

    setConcepts((cur) =>
      update(cur, {
        [conceptIndex]: {
          pages: {
            [pageIndex]: {
              variants: { [variantIndex]: { image: { $set: null } } },
            },
          },
        },
      })
    );
  };

  return (
    <PageLayout>
      <h1>Create project</h1>
      {state.error && <Alert type="error">{state.error}</Alert>}
      {state.success && (
        <Alert type="success">Project created with success!</Alert>
      )}
      <form onSubmit={onSubmit}>
        <fieldset disabled={state.loading}>
          <legend>Details</legend>
          <p>Project details.</p>
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
                  <input
                    type="file"
                    name="logo"
                    accept="image/png, image/jpeg"
                    onChange={onDetailsChange}
                  />
                  <button type="button" onClick={onClickRemoveLogo}>
                    Remove logo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </fieldset>

        <fieldset disabled={state.loading}>
          <legend>Concepts</legend>
          <p>Project concepts.</p>
          <button type="button" onClick={onClickAddConcept}>
            Add Concept
          </button>
          {concepts.map((concept, conceptIndex) => (
            <fieldset key={`concept-${conceptIndex}`}>
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
                      <button
                        type="button"
                        onClick={onClickRemoveMoodboard}
                        data-concept-index={conceptIndex}
                      >
                        Remove moodboard
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                type="button"
                data-concept-index={conceptIndex}
                onClick={onClickRemoveConcept}
              >
                Delete {concept.name}
              </button>

              <fieldset>
                <legend>Pages</legend>
                <p>Concept pages.</p>
                <button
                  type="button"
                  data-concept-index={conceptIndex}
                  onClick={onClickAddPage}
                >
                  Add Page
                </button>
                {concept.pages.length > 0 &&
                  concept.pages.map((page, pageIndex) => (
                    <fieldset key={`concept-${conceptIndex}-page-${pageIndex}`}>
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
                                data-concept-index={conceptIndex}
                                data-page-index={pageIndex}
                                data-prop="name"
                                onChange={onPageValueChange}
                                type="text"
                                name={`concept-${conceptIndex}-page-${pageIndex}-name`}
                                value={page.name}
                                required
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <button
                        type="button"
                        data-concept-index={conceptIndex}
                        data-page-index={pageIndex}
                        onClick={onClickRemovePage}
                      >
                        Delete {page.name}
                      </button>

                      <fieldset>
                        <legend>Page Variant</legend>
                        <p>Page image and size.</p>
                        <button
                          type="button"
                          data-concept-index={conceptIndex}
                          data-page-index={pageIndex}
                          onClick={onClickAddVariant}
                        >
                          Add Page Variant
                        </button>
                        {page.variants.length > 0 &&
                          page.variants.map((variant, variantIndex) => (
                            <fieldset
                              key={`concept-${conceptIndex}-page-${pageIndex}-variant-${variantIndex}`}
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
                                        data-concept-index={conceptIndex}
                                        data-page-index={pageIndex}
                                        data-variant-index={variantIndex}
                                        value={variant.size}
                                        onChange={onVariantValueChange}
                                        data-prop="size"
                                        name={`concept-${conceptIndex}-page-${pageIndex}-variant-${variantIndex}-size`}
                                        required
                                      >
                                        {PAGE_SIZES.map((name) => (
                                          <option
                                            key={`concept-${conceptIndex}-page-${pageIndex}-variant-${variantIndex}-size-${name}`}
                                            value={name}
                                          >
                                            {name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <label>Image</label>
                                    </td>
                                    <td>
                                      <input
                                        data-concept-index={conceptIndex}
                                        data-page-index={pageIndex}
                                        data-variant-index={variantIndex}
                                        data-prop="image"
                                        onChange={onVariantValueChange}
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        name={`concept-${conceptIndex}-page-${pageIndex}-variant-${variantIndex}-image`}
                                        required
                                      />
                                      <button
                                        data-concept-index={conceptIndex}
                                        data-page-index={pageIndex}
                                        data-variant-index={variantIndex}
                                        type="button"
                                        onClick={onClickRemoveVariantImage}
                                      >
                                        Remove image
                                      </button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <button
                                type="button"
                                data-concept-index={conceptIndex}
                                data-page-index={pageIndex}
                                data-variant-index={variantIndex}
                                onClick={onClickRemoveVariant}
                              >
                                Delete {variant.size}
                              </button>
                            </fieldset>
                          ))}
                      </fieldset>
                    </fieldset>
                  ))}
              </fieldset>
            </fieldset>
          ))}
        </fieldset>
        <button key="form-submit-button" type="submit" disabled={state.loading}>
          Create Project
        </button>
      </form>
    </PageLayout>
  );
}
