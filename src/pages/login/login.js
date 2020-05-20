import React from "react";
import { useHistory, useLocation } from "react-router-dom";

import PageLayout from "../../layouts/page/page";

export default function LoginPage() {
  let history = useHistory();
  let location = useLocation();

  let { from } = location.state || { from: { pathname: "/" } };
  let login = () => {
    history.replace(from);
  };

  return (
    <PageLayout>
      <p>You must log in to view the page at {from.pathname}</p>
      <button onClick={login}>Log in</button>
    </PageLayout>
  );
}
