import React from "react";
import PageLayout from "../../containers/page-layout/page-layout";

export default function NoMatchPage() {
  return (
    <PageLayout noNavigation={true} noFooter={true}>
      <h1>404</h1>
    </PageLayout>
  );
}
