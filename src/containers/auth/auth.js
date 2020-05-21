import React, { useState } from "react";

import useAuth from "../../hooks/useAuth";

export default function Auth({ children }) {
  const { loading, user, signIn, completeNewPassword } = useAuth();
  const [error, setError] = useState();

  const onSignIn = async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const response = await signIn(
      formData.get("username"),
      formData.get("password")
    );

    console.log(response);

    if (response.error) {
      setError(response.error.message);
    }
  };

  const onNewPassword = async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const response = completeNewPassword(formData.get("password"));
    if (response.error) {
      setError(response.error.message);
    }
  };

  if (loading) return null;

  if (user && user.challengeName === "NEW_PASSWORD_REQUIRED")
    return (
      <>
        <p>Set a new password</p>
        <form onSubmit={onNewPassword}>
          <label>
            Password
            <input name="password" type="password" defaultValue="" required />
          </label>
          <button type="submit">Update and log in</button>
        </form>
      </>
    );

  if (!user)
    return (
      <>
        <p>Log in</p>
        <form onSubmit={onSignIn}>
          <label>
            Username
            <input
              name="username"
              type="text"
              defaultValue="marlonmarcello"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              defaultValue="TK,C2tTH^zDzKsQdvP"
              required
            />
          </label>
          <button type="submit">Sign In</button>
        </form>
        {error && <p>{error}</p>}
      </>
    );

  return children;
}
