import { useContext } from "react";
import { Auth } from "aws-amplify";

import AuthContext from "../contexts/auth-context";

export default function useAuth() {
  const [{ user, loading }, dispatch] = useContext(AuthContext);

  const signIn = async function (username, password) {
    try {
      const user = await Auth.signIn(username, password);
      dispatch({ type: "signin", payload: user });
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
      await Auth.completeNewPassword(user, newPassword);
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
