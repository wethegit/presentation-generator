import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import PageLayout from "../../../containers/page/page";

import {
  createProject,
  createConcept,
  createPage,
} from "../../../graphql/mutations";

import { CLIENTS, SIZES } from "../../../utils/consts";

const FORMFIELDS = [
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
  },
  {
    name: "client",
    label: "Client",
    type: "select",
    required: true,
    initialValue: CLIENTS[0],
    options: CLIENTS.map((name) => {
      return { value: name, label: name };
    }),
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    initialValue: null,
  },
];

export default function CreateProjectPage() {
  const [createProjectMutation] = useMutation(gql(createProject));
  const [createConceptMutation] = useMutation(gql(createConcept));
  const [createPageMutation] = useMutation(gql(createPage));
  const [state, setState] = useState({
    loading: false,
    error: false,
    success: false,
  });
  const [details, setDetails] = useState(() => {
    let initial = {};

    FORMFIELDS.forEach(({ name, initialValue }) => {
      if (initialValue !== null) initial[name] = initialValue || "";
    });

    return initial;
  });
  const [concepts, setConcepts] = useState([]);

  const onSubmit = async (event) => {
    event.preventDefault();

    setState({ loading: true, error: false, success: false });

    try {
      // create project
      const {
        data: { createProject: newProject },
      } = await createProjectMutation({
        variables: { input: { ...details } },
      });

      let pagesPromises = [];
      for (let { pages, ...concept } of concepts) {
        // create concept
        const {
          data: { createConcept: newConcept },
        } = await createConceptMutation({
          variables: {
            input: { projectID: newProject.id, ...concept },
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
    const { name, value } = target;

    setDetails((cur) => {
      return { ...cur, [name]: value };
    });
  };

  const onClickAddConcept = () => {
    setConcepts((cur) =>
      cur.concat([{ name: `Concept ${cur.length + 1}`, pages: [] }])
    );
  };

  const onConceptValueChange = (event) => {
    const target = event.target;
    let { conceptIndex, prop } = target.dataset;
    const val = target.value;

    conceptIndex = parseInt(conceptIndex);

    setConcepts((cur) =>
      cur.map((concept, index) => {
        if (index === conceptIndex) concept[prop] = val;
        return concept;
      })
    );
  };

  const onClickRemoveConcept = (event) => {
    const conceptIndex = parseInt(event.target.dataset.conceptIndex);

    setConcepts((cur) => cur.filter((c, index) => index !== conceptIndex));
  };

  const onClickRemovePage = (event) => {
    const conceptIndex = parseInt(event.target.dataset.conceptIndex);
    const pageIndex = parseInt(event.target.dataset.conceptIndex);

    setConcepts((cur) =>
      cur.map((concept, index) => {
        if (index === conceptIndex)
          concept.pages = concept.pages.filter((p, pi) => pi !== pageIndex);
        return concept;
      })
    );
  };

  const onClickAddPage = (event) => {
    const conceptIndex = parseInt(event.target.dataset.conceptIndex);

    setConcepts((cur) => {
      const update = [...cur];
      const concept = { ...update[conceptIndex] };
      concept.pages = concept.pages.concat([
        { name: `Page ${concept.pages.length + 1}`, size: SIZES[0] },
      ]);
      update[conceptIndex] = concept;
      return update;
    });
  };

  const onPageValueChange = (event) => {
    const target = event.target;
    const conceptIndex = parseInt(target.dataset.conceptIndex);
    const pageIndex = parseInt(target.dataset.pageIndex);
    const val = target.value;
    const prop = target.dataset.prop;

    setConcepts((cur) =>
      cur.map((concept, ci) => {
        if (ci === conceptIndex)
          concept.pages = concept.pages.map((page, pi) => {
            if (ci === conceptIndex && pi === pageIndex) page[prop] = val;
            return page;
          });

        return concept;
      })
    );
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
              {FORMFIELDS.map(({ label, name, type, required, options }) => (
                <tr key={`form-field-${name}`}>
                  <td>
                    <label>{label}</label>
                  </td>
                  <td>
                    {type === "select" ? (
                      <select
                        value={details[name]}
                        name={name}
                        required={required}
                        onChange={onDetailsChange}
                      >
                        {options.map(({ value, label }) => (
                          <option
                            key={`form-field-${name}-option-${value}`}
                            value={value}
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        onChange={onDetailsChange}
                        value={details[name]}
                        name={name}
                        type={type}
                        required={required}
                      />
                    )}
                  </td>
                </tr>
              ))}
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
                                name={`concept-${conceptIndex}-title`}
                                type="text"
                                required
                                value={concept.name}
                                onChange={onConceptValueChange}
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
                                                        {SIZES.map((name) => (
                                                          <option
                                                            key={`concept-${conceptIndex}-page-${pageIndex}-size-option-${name}`}
                                                            value={name}
                                                          >
                                                            {name}
                                                          </option>
                                                        ))}
                                                      </select>
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
