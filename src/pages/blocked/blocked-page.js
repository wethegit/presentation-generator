import React from "react";

import PageLayout from "../../containers/page-layout/page-layout.js";

import useAuth from "../../hooks/use-auth.js";

export default function BlockedPage() {
  const { signOut } = useAuth();

  return (
    <PageLayout noNavigation={true} noFooter={true}>
      <p>Nothing to see here</p>
      <button onClick={signOut}>Sign out</button>
    </PageLayout>
  );
}
