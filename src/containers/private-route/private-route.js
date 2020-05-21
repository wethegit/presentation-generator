import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import BlockedPage from "../../pages/blocked";

export default function PrivateRoute({
  children,
  groups = ["Admin"],
  ...rest
}) {
  const { user, loading } = useAuth();
  const isAdmin = useMemo(() => !loading && user.groups.includes("Admin"), [
    user,
    loading,
  ]);
  const canRender = useMemo(() => {
    if (isAdmin) return true;

    let allowed = false;

    for (let group of user.groups) {
      if (groups.includes(group)) {
        allowed = true;
        break;
      }
    }

    return allowed;
  }, [groups, isAdmin, user.groups]);

  if (!canRender) return <BlockedPage />;

  return <Route {...rest}>{children}</Route>;
}
