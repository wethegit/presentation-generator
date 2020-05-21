import React, { useReducer, useEffect, createContext } from "react";
import { Auth } from "aws-amplify";

const AuthContext = createContext();

const authReducer = function (state, action) {
  switch (action.type) {
    case "signin": {
      const user = action.payload;
      const {
        idToken: { payload },
      } = user.signInUserSession;

      user.groups = payload["cognito:groups"];

      return { loading: state.loading, user: user };
    }
    case "signout": {
      return { loading: state.loading, user: false };
    }
    case "loaded": {
      return { loading: false, user: state.user };
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
  });

  useEffect(() => {
    const load = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        dispatch({ type: "signin", payload: user });
      } catch (err) {
        console.log(err);
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
