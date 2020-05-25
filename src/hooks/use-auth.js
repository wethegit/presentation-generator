import { useContext } from "react";
import { Auth } from "aws-amplify";

import AuthContext from "../contexts/auth-context.js";

export default function useAuth() {
  const [{ user, loading }, dispatch] = useContext(AuthContext);

  const signIn = async function (username, password) {
    try {
      const user = await Auth.signIn(username, password);
      const userData = await Auth.currentCredentials();
      dispatch({ type: "signin", payload: { user, userData } });
      return user;
    } catch (error) {
      return { error };
    }
  };

  const signOut = async function () {
    try {
      await Auth.signOut();
      dispatch({ type: "signout" });
    } catch (error) {
      return { error };
    }
  };

  const completeNewPassword = async function (newPassword) {
    if (!user) throw Error("No logged in user");
    try {
      const updatedUser = await Auth.completeNewPassword(user, newPassword);
      const userData = await Auth.currentCredentials();
      dispatch({ type: "signin", payload: { user: updatedUser, userData } });
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    completeNewPassword,
  };
}
