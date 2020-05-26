import React, { useState } from "react";
import { Auth, API } from "aws-amplify";

import PageLayout from "../../containers/page-layout/page-layout.js";

export default function AdminPage() {
  const [state, setState] = useState({
    loading: false,
    error: false,
    success: false,
  });

  const createNewUser = async function (event) {
    event.preventDefault();

    setState({ loading: true, error: false, success: false });

    const formData = new FormData(event.target);
    const { username, password, groupname } = Object.fromEntries(
      formData.entries()
    );

    try {
      await Auth.signUp({ username, password });
      await API.post("AdminQueries", "/addUserToGroup", {
        body: {
          username,
          groupname,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `${(await Auth.currentSession())
            .getAccessToken()
            .getJwtToken()}`,
        },
      });

      setState((cur) => {
        return { ...cur, success: true, error: false };
      });
    } catch (error) {
      setState((cur) => {
        return { ...cur, error: error.message };
      });
    } finally {
      setState((cur) => {
        return { ...cur, loading: false };
      });
    }
  };

  return (
    <PageLayout>
      <h1>Admin</h1>
      <h2>Create new user</h2>
      {state.error && <p>{state.error}</p>}
      {state.success && <p>Success!</p>}
      <form onSubmit={createNewUser}>
        <fieldset disabled={state.loading}>
          <table>
            <tbody>
              <tr>
                <td>
                  <label>Username</label>
                </td>
                <td>
                  <input name="username" type="text" required />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Password</label>
                </td>
                <td>
                  <input name="password" type="password" required />
                </td>
              </tr>
              <tr>
                <td>
                  <label>User group</label>
                </td>
                <td>
                  <select name="groupname">
                    <option defaultValue value="WTC">
                      WTC
                    </option>
                    <option value="NOA">NOA</option>
                    <option value="TPCI">TPCI</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <button type="submit">Create</button>
        </fieldset>
      </form>
    </PageLayout>
  );
}
