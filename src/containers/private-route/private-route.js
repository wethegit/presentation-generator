import React, { useMemo } from "react";
import { Route } from "react-router-dom";

import useAuth from "../../hooks/use-auth.js";
import BlockedPage from "../../pages/blocked/blocked-page.js";

export default function PrivateRoute({
  children,
  groups = ["Admin"],
  ...rest
}) {
  const { user, loading } = useAuth();
  const isAdmin = !loading && user && user.isAdmin;

  const canRender = useMemo(() => {
    if (isAdmin) return true;
    if (!user.groups) return false;

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
