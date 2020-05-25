import React, { useReducer, useEffect, createContext } from "react";
import { Auth } from "aws-amplify";

const AuthContext = createContext();

const authReducer = function (state, action) {
  switch (action.type) {
    case "signin": {
      const { user, userData } = action.payload;
      const { username, signInUserSession } = user;
      const { identityId } = userData;
      let groups = [];
      let isAdmin = false;

      if (signInUserSession) {
        const {
          idToken: { payload },
        } = signInUserSession;

        groups = payload["cognito:groups"];
        isAdmin = groups.includes("Admin");
      }

      return {
        loading: state.loading,
        user: {
          challengeName: user.challengeName,
          username,
          identityId,
          groups,
          isAdmin,
        },
      };
    }
    case "signout": {
      return { loading: state.loading, user: false };
    }
    case "loaded": {
      return { loading: false, user: state.user };
    }
    case "error": {
      return { ...state, error: action.payload };
    }
    default: {
      return state;
    }
  }
};

const AuthProvider = function ({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    loading: true,
    user: false,
    error: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const userData = await Auth.currentCredentials();
        dispatch({ type: "signin", payload: { user, userData } });
      } catch (error) {
        console.log("error during login", error);
        dispatch({ type: "error", payload: error });
      } finally {
        dispatch({ type: "loaded" });
      }
    };

    load();
  }, []);

  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext as default, AuthProvider };
