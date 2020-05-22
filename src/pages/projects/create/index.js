import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import PageLayout from "../../../containers/page/page";

import {
  createProject,
  createProjectConcept,
} from "../../../graphql/mutations";

import { CLIENTS } from "../../../utils/consts";

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
  const [createProjectConceptMutation] = useMutation(gql(createProjectConcept));
  const [state, setState] = useState({
    loading: false,
    error: false,
    success: false,
  });
  const [concepts, setConcepts] = useState([]);
  const [details, setDetails] = useState(() => {
    let initial = {};

    FORMFIELDS.forEach(({ name, initialValue }) => {
      if (initialValue !== null) initial[name] = initialValue || "";
    });

    return initial;
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    setState({ loading: true, error: false, success: false });

    try {
      const {
        data: { createProject: project },
      } = await createProjectMutation({
        variables: { input: { ...details } },
      });

      await Promise.all(
        concepts.map((concept) =>
          createProjectConceptMutation({
            variables: { input: { projectID: project.id, ...concept } },
          })
        )
      );

      setState((cur) => {
        return { ...cur, error: false, success: true };
      });
    } catch (error) {
      setState((cur) => {
        return { ...cur, error, success: false };
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
    setConcepts((cur) => cur.concat([{ name: `Concept ${cur.length + 1}` }]));
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
    const { conceptIndex } = event.target.dataset;

    setConcepts((cur) => cur.filter((c, index) => index !== conceptIndex));
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
              {concepts.map((concept, index) => (
                <React.Fragment key={`concept-${index}`}>
                  <tr>
                    <td>
                      <label>Name</label>
                    </td>
                    <td>
                      <input
                        data-concept-index={index}
                        data-prop="name"
                        name={`concept-${index}-title`}
                        type="text"
                        required
                        value={concept.name}
                        onChange={onConceptValueChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Image</label>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <button
                        type="button"
                        data-concept-index={index}
                        onClick={onClickRemoveConcept}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
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
