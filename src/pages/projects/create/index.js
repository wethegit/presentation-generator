import React from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import PageLayout from "../../../containers/page/page";

import { createProject } from "../../../graphql/mutations";

import { formToObject } from "../../../utils/helpers";

export default function CreateProjectPage() {
  const [createProjectMutation] = useMutation(gql(createProject));

  const onSubmit = (event) => {
    event.preventDefault();

    const formData = formToObject(event.target);

    createProjectMutation({ variables: { input: { ...formData } } });
  };

  return (
    <PageLayout>
      <form onSubmit={onSubmit}>
        <label>
          Title
          <input name="title" type="text" required></input>
        </label>
        <label>
          Client
          <select name="client" required>
            <option value="NOA" defaultValue>
              NOA
            </option>
            <option value="TPCI">TPCI</option>
            <option value="WTC">WTC</option>
          </select>
        </label>
        <label>
          Description
          <input name="description" type="text"></input>
        </label>
        <button type="submit">Create</button>
      </form>
    </PageLayout>
  );
}
